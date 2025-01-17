import { DateTime } from 'luxon';
import { ChatCompletionRequestMessageFunctionCall } from 'openai';
import DynamoDBFacade from '../clients/DynamoDBFacade';
import { trimTokensToFitInContext } from '../utils/llmToken';
import {
  AssistantMessage,
  Message,
  SystemMessage,
  UserMessage,
} from '../types/messages';
import OpenAI from '../clients/OpenAI';
import NoOperationFoundError from '../errors/NoOperationFoundError';
import { Meal } from '../types/meals';
import { evaluate } from 'mathjs';

const handleLLMFunction = async (
  textResponse: string,
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  openAI: OpenAI,
  inputContext: Message[],
  userMessage: UserMessage,
  timezone: string
) => {
  switch (functionCall.name) {
    case 'displayBreakdown':
      return displayBreakdown(textResponse, functionCall, ddb, userMessage);
    case 'getMeals':
      return await getMealsHandler(
        functionCall,
        ddb,
        openAI,
        inputContext,
        userMessage,
        timezone
      );
    case 'deleteMeal':
      return await deleteMeal(
        functionCall,
        ddb,
        openAI,
        userMessage,
        timezone,
        textResponse,
        inputContext
      );
    default:
      throw new NoOperationFoundError(
        `No LLM function exists with name ${functionCall.name}`
      );
  }
};

const displayBreakdown = async (
  textResponse: string,
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  userMessage: UserMessage
) => {
  const meal = eval(`(${functionCall.arguments!})`) as Meal;

  const evaluatedBreakdown = {
    title: meal.title,
    breakdown: Object.fromEntries(
      Object.entries(meal.breakdown).map((entry) =>
        entry[0] !== 'portion' ? [entry[0], evaluate(String(entry[1]))] : entry
      )
    ),
    emoji: meal.emoji,
    date: meal.date,
  } as Meal;

  const llmResponse = new AssistantMessage({
    content: textResponse,
    meal: evaluatedBreakdown,
  });
  await ddb.addMessages([userMessage, llmResponse]);
  return llmResponse;
};

const getMealsHandler = async (
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  openAI: OpenAI,
  inputContext: Message[],
  userMessage: UserMessage,
  timezone: string
) => {
  const dates = JSON.parse(functionCall.arguments!).dates.map((date: string) =>
    DateTime.fromISO(date, { zone: timezone }).toSeconds()
  );

  const datedMeals = await ddb.getMealsForDates(dates);
  const contextWithMeals = trimTokensToFitInContext([
    ...inputContext,
    new SystemMessage(
      `${AI_NAME} made a function call to getMeals and this is the result of it: ${JSON.stringify(
        datedMeals
      )}. Now respond appropriately to the user`
    ),
  ]);
  const llmMessage = await openAI.sendChat(contextWithMeals, false);
  await ddb.addMessages([userMessage, llmMessage]);
  return llmMessage;
};

const deleteMeal = async (
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  openAI: OpenAI,
  userMessage: UserMessage,
  timezone: string,
  textResponse: string,
  inputContext: Message[]
): Promise<AssistantMessage> => {
  const { date: unformatedDate, mealTitle } = JSON.parse(
    functionCall.arguments!
  );
  const date = DateTime.fromISO(unformatedDate, { zone: timezone }).toSeconds();
  await ddb.deleteMeal(mealTitle, date);
  const llmMessage = await openAI.sendChat(
    [
      userMessage,
      new SystemMessage(
        `${AI_NAME} deleted meal ${mealTitle} on ${DateTime.fromSeconds(
          date
        ).toFormat(
          'MMMM dd, yyyy'
        )}. Now respond appropriately to the user. In the case an aditional function call is required tell the user you can only delete one meal at a time.`
      ),
    ],
    false
  );
  await ddb.addMessages([userMessage, llmMessage]);
  return llmMessage;
};

export default handleLLMFunction;
