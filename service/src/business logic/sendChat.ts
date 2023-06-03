import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  OpenAIApi,
} from 'openai';
import { SYSTEM_MESSAGE } from '../clients/openai';
import { DynamoDB } from 'aws-sdk';
import serviceAPI from './service';

const { User } = ChatCompletionRequestMessageRoleEnum;

const sendChat = async (
  openAIClient: OpenAIApi,
  userMessage: string,
  userId: string,
  ddbClient: DynamoDB
) => {
  console.log('User', userId, 'Sending message: ', userMessage);

  const ddbConversationResults = (await serviceAPI.getChat(userId)) ?? [];
  // this assumes results are sorted by date. Assumes no limit on the llm context size
  const latestContext = ddbConversationResults?.reduce(
    (acc: ChatCompletionRequestMessage[], cur) => [...acc, ...cur.messages],
    []
  );

  console.log('Sending with context: ', latestContext);

  const llmResponse = await openAIClient.createChatCompletion(
    {
      model: 'gpt-3.5-turbo',
      messages: [
        SYSTEM_MESSAGE,
        ...latestContext,
        { role: User, content: userMessage },
      ],
    },
    { timeout: 30000 }
  );
  const llmMessage: string[] = llmResponse.data.choices.map(
    (c) => c.message!.content
  );

  // not sure when this would happen, so I want to know if it does
  if (llmMessage.length > 1)
    throw new Error('LLM returned more than one message.');

  console.log('LLM response: ', llmMessage);

  const today = new Date().toISOString().split('T')[0];

  const params = {
    TableName: 'UserChats',
    Key: {
      userId: { S: userId },
      date: { S: today },
    },
    ExpressionAttributeValues: {
      ':message': {
        L: [
          { M: { content: { S: userMessage }, role: { S: 'user' } } },
          { M: { content: { S: llmMessage[0] }, role: { S: 'assistant' } } },
        ],
      },
      ':empty_list': { L: [] },
    },
    UpdateExpression:
      'SET messages = list_append(if_not_exists(messages, :empty_list), :message)',
  };

  await ddbClient.updateItem(params).promise();

  return llmMessage[0];
};

export default sendChat;
