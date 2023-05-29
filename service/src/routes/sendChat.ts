import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManager } from 'aws-sdk';
import { Dependencies } from '../handler';
import parseJwt from '../utils/jwtParser';
import { SYSTEM_MESSAGE } from '../clients/openai';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

const sendChat = async (
  event: APIGatewayProxyEvent,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResult> => {
  try {
    const { openAIClient } = dependencies;
    const { message } = JSON.parse(event.body || '');
    const userId = parseJwt(event.headers.authorization!)!.payload[
      'cognito:username'
    ];
    console.log('User ', userId, ' sent message: ', message);
    const llmResponse = await openAIClient.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          SYSTEM_MESSAGE,
          { role: ChatCompletionRequestMessageRoleEnum.User, content: message },
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
    const { dynamoDBClient } = dependencies;

    const params = {
      TableName: 'UserChats',
      Key: {
        userId: { S: userId },
        date: { S: today },
      },
      ExpressionAttributeValues: {
        ':message': {
          L: [
            { M: { content: { S: message }, role: { S: 'user' } } },
            { M: { content: { S: llmMessage[0] }, role: { S: 'assistant' } } },
          ],
        },
        ':empty_list': { L: [] },
      },
      UpdateExpression:
        'SET messages = list_append(if_not_exists(messages, :empty_list), :message)',
    };

    const result = await dynamoDBClient.updateItem(params).promise();

    console.log('DynamoDB result: ', result);

    return {
      statusCode: 200,
      body: JSON.stringify(llmMessage[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export default sendChat;
