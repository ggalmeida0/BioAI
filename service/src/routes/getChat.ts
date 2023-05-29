import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import parseJwt from '../utils/jwtParser';
import { DynamoDB } from 'aws-sdk';
import { Dependencies } from '../handler';
import { INITIAL_GREETING } from '../clients/openai';

const getChat = async (
  event: APIGatewayProxyEvent,
  dependencies: Dependencies,
  userId: string
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Getting chats for user ', userId);

    const dynamoDb = new DynamoDB.DocumentClient();
    const { Items } = await dynamoDb
      .query({
        TableName: 'UserChats',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        Items?.length === 0
          ? [{ content: INITIAL_GREETING, role: 'assistant' }]
          : Items
      ),
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
