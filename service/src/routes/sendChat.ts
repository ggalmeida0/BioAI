import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Dependencies } from '../handler';
import serviceAPI, { SendChatInput } from '../logic/service';

const sendChat = async (
  event: APIGatewayProxyEventV2,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResultV2> => {
  const { openAI, ddb } = dependencies;
  const { message: userMessage } = JSON.parse(event.body || '');
  const timezone = event.headers.Timezone ?? event.headers.timezone ?? 'UTC';

  const input: SendChatInput = {
    userId,
    userMessage,
    ddb,
    openAI,
    timezone,
  };

  const result = await serviceAPI.sendChat(input);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export default sendChat;
