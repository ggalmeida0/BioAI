import { DateTime } from 'luxon';
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
import MessageUtils from '../utils/messagesUtils';

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
    ...chatHistory.flatMap((chat) => MessageUtils.asOpenAIModel(chat.messages)),
    new SystemMessage(BREAKDOWN_PROMPT),
    userMessage,
  ]);

  console.log(inputContext);

  const rawResponse = await openAI.sendChat(inputContext);

  console.log('LLM raw response: ', rawResponse);

  const functionCall = rawResponse.function_call;

  if (functionCall) {
    const dates = JSON.parse(functionCall.arguments!).dates.map(
      (date: string) => DateTime.fromISO(date).toUTC().toSeconds()
    );

    const datedMeals = await ddb.getMealsForDates(dates);
    const message =
      datedMeals.length > 0
        ? 'Here are the meals'
        : "I couldn't find any meals";

    return new AssistantMessage({ content: message, datedMeals });
  }

  const { jsonObject: meal, newStr: treatedContent } = extractJSON<Meal>(
    rawResponse.content
  );

  console.log('Meal Breakdown: ', meal);

  const llmMessage = new AssistantMessage({ content: treatedContent, meal });

  await ddb.addMessages([userMessage, llmMessage]);

  return llmMessage;
};

export default sendChat;
