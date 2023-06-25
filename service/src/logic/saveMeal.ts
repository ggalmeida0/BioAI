import { DateTime } from 'luxon';
import { validateDateFormat } from '../utils/date';
import { SaveMealInput } from './service';

const saveMeal = async (input: SaveMealInput): Promise<void> => {
  const { userId, meal, ddb, date } = input;

  const validatedDate = validateDateFormat(date);
  const formatedDate =
    validatedDate && DateTime.fromISO(validatedDate).toUTC().toSeconds();

  console.log('User', userId, 'Saving meal: ', meal);

  // @ts-ignore TS acting weird saying formatedDate could be "" when it cannot
  await ddb.addMeal(meal, formatedDate);
};

export default saveMeal;
