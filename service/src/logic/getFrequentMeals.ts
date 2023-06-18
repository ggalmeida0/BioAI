import { Meal } from '../types/meals';
import { GetFrequentMealsInput } from './service';

const getFrequentMeals = async (input: GetFrequentMealsInput): Promise<Meal[]> => {
  const { ddb } = input;

  return await ddb.getFrequentMeals()
};

export default getFrequentMeals;
