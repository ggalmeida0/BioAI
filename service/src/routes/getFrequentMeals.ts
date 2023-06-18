import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Dependencies } from '../handler';
import serviceAPI, { GetFrequentMealsInput } from '../logic/service';

const getFrequentMeals = async (
  _: APIGatewayProxyEventV2,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { ddb } = dependencies;
    const getFrequentMealsInput: GetFrequentMealsInput = { ddb }
    console.log('Getting frequent meals for user: ', userId)
    const result = await serviceAPI.getFrequentMeals(getFrequentMealsInput);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export default getFrequentMeals;
