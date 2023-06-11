import { Meal } from '../types/meals';
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from '../types/messages';
import { extractJSON } from '../utils/json';
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
  const { userId, userMessage: message, openAI, ddbChat } = input;

  console.log('User', userId, 'Sending message: ', message);

  const chatHistory = await ddbChat.getMessages();

  const userMessage = new UserMessage(message);

  const messageSequence: Message[] = [
    new SystemMessage(BREAKDOWN_PROMPT),
    ...chatHistory.map((chat) => chat.messages).flat(),
    userMessage,
  ];

  const rawResponse = await openAI.sendChat(messageSequence);

  console.log('LLM raw response: ', rawResponse);

  const { jsonObject: meal, newStr: treatedContent } = extractJSON<Meal>(
    rawResponse.content
  );

  console.log('Meal Breakdown: ', meal);

  const llmMessage = new AssistantMessage(treatedContent, meal);

  await ddbChat.addMessages([userMessage, llmMessage]);

  return llmMessage;
};

export default sendChat;
