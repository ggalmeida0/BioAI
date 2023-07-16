import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Dependencies } from '../handler';
import serviceAPI, { GetChatInput } from '../logic/service';

const getChat = async (
  event: APIGatewayProxyEventV2,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResultV2> => {
  try {
    const timezone = event.headers.Timezone ?? 'UTC';
    const { ddb, openAI } = dependencies;
    const getChatInput: GetChatInput = {
      timezone,
      userId,
      ddb,
      openAI,
    };
    const result = await serviceAPI.getChat(getChatInput);

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
