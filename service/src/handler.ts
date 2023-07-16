import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import getChat from './routes/getChat';
import sendChat from './routes/sendChat';
import { getTokenFromAPIGWEvent, parseJwt } from './utils/authToken';
import UnauthorizedError from './errors/UnauthorizedError';
import NoOperationFoundError from './errors/NoOperationFoundError';
import DynamoDBFacade from './clients/DynamoDBFacade';
import OpenAI from './clients/OpenAI';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import saveMeal from './routes/saveMeal';
import getFrequentMeals from './routes/getFrequentMeals';
import DependencyError from './errors/DependencyError';

export type Dependencies = {
  ddb: DynamoDBFacade;
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
  {
    path: '/saveMeal',
    method: 'POST',
    action: saveMeal,
  },
  {
    path: '/getFrequentMeals',
    method: 'GET',
    action: getFrequentMeals,
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

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

exports.handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { path, method } = event.requestContext.http;
  console.log('Received event: ', event);

  const route = getRoute(path, method);

  try {
    const token = getTokenFromAPIGWEvent(event);
    await verifier.verify(token);

    const userId = parseJwt(token)!.payload['cognito:username'];

    const timezone = event.headers.Timezone ?? event.headers.timezone ?? 'UTC';

    const dependencies: Dependencies = {
      ddb: new DynamoDBFacade(userId, timezone),
      openAI: await OpenAI.init(timezone),
    };

    const result = await route.action(event, dependencies, userId);

    const headers =
      process.env['ENV'] === 'prod'
        ? undefined
        : // Even though we are setting cors headers in the Function Url, we need it here to have SAM local work https://github.com/aws/aws-sam-cli/issues/4299.
          // Once the feature is released, we can remove this.
          {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Allow-Headers': '*',
          };

    return {
      ...(result as object),
      headers,
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

    if (error instanceof DependencyError) {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
