import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Dependencies } from '../handler';
import serviceAPI, { SaveMealInput, SendChatInput } from '../logic/service';

const saveMeal = async (
  event: APIGatewayProxyEventV2,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResultV2> => {
  const { ddbChat } = dependencies;
  const { meal } = JSON.parse(event.body || '');

  const input: SaveMealInput = {
    userId,
    meal,
    ddbChat,
  };

  const result = await serviceAPI.saveMeal(input);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export default saveMeal;
