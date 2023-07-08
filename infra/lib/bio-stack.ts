import * as cdk from 'aws-cdk-lib';
import {
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import { CorsHttpMethod, HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class BioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const isDevEnv = !!process.env.IS_DEV_ENV;
    const { userPool, client } = this.setupAuth();
    this.setupDatabase();
    this.setupService(userPool, client, isDevEnv);
  }

  setupDevApi(devLambda: Function) {
    const api = new HttpApi(this, 'BioAPI', {
      apiName: 'BioAPI',
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ['*'],
      },
    });

    const getChatIntegration = new HttpLambdaIntegration(
      'APIIntegration::getChat',
      devLambda
    );
    const sendChatIntegration = new HttpLambdaIntegration(
      'APIIntegration::sendChat',
      devLambda
    );
    const saveMealIntegration = new HttpLambdaIntegration(
      'APIIntegration::saveMeal',
      devLambda
    );
    const getFrequentMealsIntegration = new HttpLambdaIntegration(
      'APIIntegration::getFrequentMeals',
      devLambda
    );

    api.addRoutes({
      path: '/getChat',
      methods: [HttpMethod.GET],
      integration: getChatIntegration,
    });
    api.addRoutes({
      path: '/sendChat',
      methods: [HttpMethod.POST],
      integration: sendChatIntegration,
    });
    api.addRoutes({
      path: '/saveMeal',
      methods: [HttpMethod.POST],
      integration: saveMealIntegration,
    });
    api.addRoutes({
      path: '/getFrequentMeals',
      methods: [HttpMethod.GET],
      integration: getFrequentMealsIntegration,
    });
  }

  setupDatabase() {
    new cdk.aws_dynamodb.Table(this, 'UserSessions', {
      tableName: 'UserSessions',
      partitionKey: {
        name: 'userId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: cdk.aws_dynamodb.AttributeType.NUMBER,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }

  setupService(
    userPool: UserPool,
    client: UserPoolClient,
    isDevEnv: boolean = false
  ) {
    const lambda = new Function(this, 'BioService', {
      functionName: 'BioService',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: 'dist/handler.handler',
      code: cdk.aws_lambda.Code.fromAsset('../service/lambda/bio-service.zip'),
      initialPolicy: [
        PolicyStatement.fromJson({
          Effect: Effect.ALLOW,
          Action: [
            'dynamodb:Query',
            'dynamodb:UpdateItem',
            'dynamodb:BatchGetItem',
          ],
          Resource: 'arn:aws:dynamodb:*:*:table/UserSessions',
        }),
      ],
      timeout: cdk.Duration.seconds(900),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: client.userPoolClientId,
      },
      memorySize: 1024,
    });

    if (isDevEnv) {
      this.setupDevApi(lambda);
    } else {
      lambda.addFunctionUrl({
        authType: FunctionUrlAuthType.NONE,
        cors: {
          allowCredentials: true,
          allowedOrigins: ['*'],
          allowedMethods: [HttpMethod.GET, HttpMethod.POST],
          allowedHeaders: ['*'],
        },
      });
      lambda.addEnvironment('ENV', 'prod');
    }

    const openAiApiKey = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      'OPENAI_API_KEY',
      'openai'
    );

    openAiApiKey.grantRead(lambda);
  }

  setupAuth() {
    const googleClientSecret = cdk.SecretValue.secretsManager('googlecloud', {
      jsonField: 'BIO_GOOGLE_OAUTH_CLIENT_SECRET',
    });

    const userPool = new cdk.aws_cognito.UserPool(this, 'BioUserPool', {
      userPoolName: 'BioUserPool',
    });

    userPool.addDomain('BioAuthDomain', {
      cognitoDomain: {
        domainPrefix: 'bio-ai',
      },
    });

    const callbackUrls = [
      'http://localhost:19006/',
      'https://master.d3mqj86iwprlmp.amplifyapp.com/',
      'exp://192.168.1.243:19000',
      'exp://192.168.1.114:19000',
    ];
    const client = userPool.addClient('BioAuthClient', {
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        callbackUrls: callbackUrls,
      },
    });
    const provider = new cdk.aws_cognito.UserPoolIdentityProviderGoogle(
      this,
      'Google',
      {
        clientId:
          '49839729668-9ptmk3o21cq41ekv1e1shkeqivgjrcjl.apps.googleusercontent.com',
        clientSecretValue: googleClientSecret,
        userPool: userPool,
        scopes: ['email', 'openid'],
      }
    );
    client.node.addDependency(provider);
    return { userPool, client };
  }
}
