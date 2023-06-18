import { Meal } from '../types/meals';
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from '../types/messages';
import { extractJSON } from '../utils/json';
import { trimTokensToFitInContext } from '../utils/llmToken';
import { SendChatInput } from './service';

const BREAKDOWN_PROMPT = `
Look at the message to follow, output any nutritional breakdown in JSON format.

Here is the data model of the JSON:

{
  title: string;
  breakdown: {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
  }
}
`;

const sendChat = async (input: SendChatInput): Promise<AssistantMessage> => {
  const { userId, userMessage: message, openAI, ddb } = input;

  console.log('User', userId, 'Sending message: ', message);

  const chatHistory = await ddb.getMessages();

  const userMessage = new UserMessage(message);

  const inputContext: Message[] = trimTokensToFitInContext([
    new SystemMessage(BREAKDOWN_PROMPT),
    ...chatHistory.map((chat) => chat.messages).flat(),
    userMessage,
  ]);

  console.log(inputContext)

  const rawResponse = await openAI.sendChat(inputContext);

  console.log('LLM raw response: ', rawResponse);

  const { jsonObject: meal, newStr: treatedContent } = extractJSON<Meal>(
    rawResponse.content
  );

  console.log('Meal Breakdown: ', meal);

  const llmMessage = new AssistantMessage(treatedContent, meal);

  await ddb.addMessages([userMessage, llmMessage]);

  return llmMessage;
};

export default sendChat;
