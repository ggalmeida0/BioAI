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

const handleLLMFunction = async (
  textResponse: string,
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  openAI: OpenAI,
  inputContext: Message[],
  userMessage: UserMessage
) => {
  switch (functionCall.name) {
    case 'createBreakdown':
      return createBreakdown(textResponse, functionCall);
    case 'getMeals':
      return await getMealsHandler(
        functionCall,
        ddb,
        openAI,
        inputContext,
        userMessage
      );
    case 'deleteMeal':
      return await deleteMeal(textResponse, functionCall, ddb);
    default:
      throw new NoOperationFoundError(
        `No LLM function exists with name ${functionCall.name}`
      );
  }
};

const createBreakdown = (
  textResponse: string,
  functionCall: ChatCompletionRequestMessageFunctionCall
) => {
  const breakdown = JSON.parse(functionCall.arguments!) as Meal;
  return new AssistantMessage({ content: textResponse, meal: breakdown });
};

const getMealsHandler = async (
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade,
  openAI: OpenAI,
  inputContext: Message[],
  userMessage: UserMessage
) => {
  const dates = JSON.parse(functionCall.arguments!).dates.map((date: string) =>
    DateTime.fromISO(date).toUTC().toSeconds()
  );

  const datedMeals = await ddb.getMealsForDates(dates);
  const contextWithMeals = trimTokensToFitInContext([
    ...inputContext,
    new SystemMessage(
      `Bio made a function call to getMeals and this is the result of it: ${JSON.stringify(
        datedMeals
      )}. Now respond appropriately to the user`
    ),
  ]);
  const llmMessage = await openAI.sendChat(contextWithMeals);
  await ddb.addMessages([userMessage, llmMessage]);
  return llmMessage;
};

const deleteMeal = async (
  textResponse: string,
  functionCall: ChatCompletionRequestMessageFunctionCall,
  ddb: DynamoDBFacade
) => {
  const { date: unformatedDate, mealTitle } = JSON.parse(
    functionCall.arguments!
  );
  const date = DateTime.fromISO(unformatedDate).toUTC().toSeconds();
  await ddb.deleteMeal(mealTitle, date);
  return new AssistantMessage({ content: textResponse });
};

export default handleLLMFunction;
