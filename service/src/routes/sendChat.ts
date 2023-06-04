import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Dependencies } from '../handler';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import serviceAPI from '../logic/service';

const sendChat = async (
  event: APIGatewayProxyEvent,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResult> => {
  const { openAIClient, dynamoDBClient } = dependencies;
  const { message } = JSON.parse(event.body || '');
  serviceAPI.sendChat(openAIClient, message, userId, dynamoDBClient);
  try {
    const result = await serviceAPI.sendChat(
      openAIClient,
      message,
      userId,
      dynamoDBClient
    );
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

export default sendChat;
