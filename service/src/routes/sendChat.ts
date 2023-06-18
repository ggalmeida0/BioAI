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

  const input: SendChatInput = {
    userId,
    userMessage,
    ddb,
    openAI,
  };

  const result = await serviceAPI.sendChat(input);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

export default sendChat;
