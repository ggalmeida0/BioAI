import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from '../types/messages';
import { trimTokensToFitInContext } from '../utils/llmToken';
import { SendChatInput } from './service';
import MessageUtils from '../utils/messagesUtils';
import handleLLMFunction from './handleLLMFunction';
import { DateTime } from 'luxon';

const REINFORCEMENT_PROMPT = `In case of ambiguity, assume the user wants to breakdown a meal. Only call functions that are provided`;

const sendChat = async (input: SendChatInput): Promise<AssistantMessage> => {
  const { userId, userMessage: message, openAI, ddb } = input;

  console.log('User', userId, 'Sending message: ', message);

  const chatHistory = await ddb.getMessages(
    DateTime.local().startOf('day').toSeconds()
  );

  const userMessage = new UserMessage(message);

  const inputContext: Message[] = trimTokensToFitInContext([
    ...chatHistory.flatMap((chat) => MessageUtils.asOpenAIModel(chat.messages)),
    new SystemMessage(REINFORCEMENT_PROMPT),
    userMessage,
  ]);

  console.log(inputContext);

  const rawResponse = await openAI.sendChat(inputContext);

  console.log('LLM raw response: ', rawResponse);

  const functionCall = rawResponse.function_call;

  if (functionCall) {
    return handleLLMFunction(
      rawResponse.content,
      functionCall,
      ddb,
      openAI,
      inputContext,
      userMessage
    );
  }

  const llmMessage = new AssistantMessage({ content: rawResponse.content });

  await ddb.addMessages([userMessage, llmMessage]);

  return llmMessage;
};

export default sendChat;
