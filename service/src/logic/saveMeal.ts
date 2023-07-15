import { DateTime } from 'luxon';
import { validateDateFormat } from '../utils/date';
import { SaveMealInput } from './service';
import { AssistantMessage, SystemMessage } from '../types/messages';

const saveMeal = async (input: SaveMealInput): Promise<AssistantMessage> => {
  const { userId, meal, ddb, openAI } = input;

  const validatedDate = validateDateFormat(meal.date);
  const formatedDate =
    validatedDate && DateTime.fromISO(validatedDate).toUTC().toSeconds();

  console.log(
    'User',
    userId,
    'Saving meal: ',
    meal,
    'On timestamp: ',
    formatedDate
  );

  // @ts-ignore TS acting weird saying formatedDate could be "" when it cannot
  await ddb.addMeal(meal, formatedDate);

  const llmResponse = await openAI.sendChat(
    [
      new SystemMessage(
        `Inform the user you just saved the meal: ${JSON.stringify(meal)}`
      ),
    ],
    false
  );
  await ddb.addMessages([llmResponse]);
  return llmResponse;
};

export default saveMeal;
