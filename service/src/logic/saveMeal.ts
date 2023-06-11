import { SaveMealInput } from './service';

const saveMeal = async (input: SaveMealInput): Promise<void> => {
  const { userId, meal, ddbChat } = input;

  console.log('User', userId, 'Saving meal: ', meal);

  await ddbChat.addMeal(meal);
};

export default saveMeal;
