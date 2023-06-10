import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import getChat from './routes/getChat';
import sendChat from './routes/sendChat';
import { getTokenFromAPIGWEvent, parseJwt } from './utils/authToken';
import UnauthorizedError from './errors/UnauthorizedError';
import NoOperationFoundError from './errors/NoOperationFoundError';
import DynamoDBChat from './clients/DynamoDBChat';
import OpenAI from './clients/OpenAI';

export type Dependencies = {
  ddbChat: DynamoDBChat;
  openAI: OpenAI;
};

type Route = {
  path: string;
  method: string;
  action: (
    event: APIGatewayProxyEventV2,
    dependencies: Dependencies,
    userId: string
  ) => Promise<APIGatewayProxyResultV2>;
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

const getRoute = (path: string, method: string) => {
  const route = routes.find(
    (route) => route.path === path && route.method === method
  );

  if (!route) {
    throw new NoOperationFoundError(
      `No operation found for path ${path} and method ${method}`
    );
  }

  return route;
};

exports.handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { path, method } = event.requestContext.http;
  console.log('Received event: ', event);

  const route = getRoute(path, method);

  try {
    const token = getTokenFromAPIGWEvent(event);
    const userId = parseJwt(token)!.payload['cognito:username'];

    const dependencies: Dependencies = {
      ddbChat: new DynamoDBChat(userId),
      openAI: await OpenAI.init(),
    };

    const result = await route.action(event, dependencies, userId);

    return {
      ...(result as object),
      // Even though we are setting cors headers in the API Gateway, we need it here to have SAM local work https://github.com/aws/aws-sam-cli/issues/4161.
      // Once the issue is resolved, we can remove this.
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
      },
    };
  } catch (error) {
    console.error(error);

    if (error instanceof UnauthorizedError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    if (error instanceof NoOperationFoundError) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Route not found' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
