import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Dependencies } from '../handler';
import { INITIAL_GREETING } from '../clients/openai';
import serviceAPI from '../business logic/service';

const getChat = async (
  event: APIGatewayProxyEvent,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await serviceAPI.getChat(userId);

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

export default getChat;
