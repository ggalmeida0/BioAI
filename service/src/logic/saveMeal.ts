import { SaveMealInput } from './service';

const saveMeal = async (input: SaveMealInput): Promise<void> => {
  const { userId, meal, ddb } = input;

  console.log('User', userId, 'Saving meal: ', meal);

  await ddb.addMeal(meal);
};

export default saveMeal;
