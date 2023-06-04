import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import getChat from './routes/getChat';
import sendChat from './routes/sendChat';
import { DynamoDB } from 'aws-sdk';
import { Configuration, OpenAIApi } from 'openai';
import OpenAIClientFactory from './clients/openai';
import parseJwt from './utils/jwtParser';

export type Dependencies = {
  dynamoDBClient: DynamoDB;
  openAIClient: OpenAIApi;
};

type Route = {
  path: string;
  method: string;
  action: (
    event: APIGatewayProxyEvent,
    dependencies: Dependencies,
    userId: string
  ) => Promise<APIGatewayProxyResult>;
};

const routes: Route[] = [
  {
    path: '/getChat',
    method: 'GET',
    action: getChat,
  },
  {
    path: '/sendChat',
    method: 'POST',
    action: sendChat,
  },
];

exports.handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // @ts-ignore aws-lambda types are wrong
  const { path, method } = event.requestContext.http;
  console.log('Received event: ', event);

  const route = routes.find(
    (route) => route.path === path && route.method === method
  );

  if (!route) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Route not found' }),
    };
  }

  try {
    const token = event.headers.authorization ?? event.headers.Authorization;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Could not get auth token' }),
      };
    }

    const userId = parseJwt(token)!.payload['cognito:username'];

    const dependencies = {
      dynamoDBClient: new DynamoDB({ region: 'us-east-2' }),
      openAIClient: await OpenAIClientFactory(),
    };
    const result = await route.action(event, dependencies, userId);
    return {
      ...result,
      // Even though we are setting cors headers in the API Gateway, we need it here to have SAM local work https://github.com/aws/aws-sam-cli/issues/4161.
      // Once the issue is resolved, we can remove this.
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
