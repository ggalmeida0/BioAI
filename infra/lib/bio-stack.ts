import * as cdk from 'aws-cdk-lib';
import { UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class BioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const { userPool, client } = this.setupAuth();
    this.setupDatabase();
    this.setupService(userPool, client);
  }

  setupDatabase() {
    new cdk.aws_dynamodb.Table(this, 'UserChats', {
      tableName: 'UserChats',
      partitionKey: {
        name: 'userId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }

  setupService(
    userPool: cdk.aws_cognito.UserPool,
    client: cdk.aws_cognito.UserPoolClient
  ) {
    const lambda = new cdk.aws_lambda.Function(this, 'BioService', {
      functionName: 'BioService',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: 'dist/handler.handler',
      code: cdk.aws_lambda.Code.fromAsset('../service/lambda/bio-service.zip'),
      initialPolicy: [
        PolicyStatement.fromJson({
          Effect: Effect.ALLOW,
          Action: ['dynamodb:Query', 'dynamodb:UpdateItem'],
          Resource: 'arn:aws:dynamodb:*:*:table/UserChats',
        }),
      ],
      timeout: cdk.Duration.seconds(30),
    });

    const openAiApiKey = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      'OPENAI_API_KEY',
      'prod/bio'
    );

    openAiApiKey.grantRead(lambda);

    const api = new HttpApi(this, 'BioAPI', {
      apiName: 'BioAPI',
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ['http://localhost:19006'],
        maxAge: cdk.Duration.days(7),
      },
    });

    const authorizer = new HttpJwtAuthorizer(
      'APIAuthorizer',
      `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
      {
        identitySource: ['$request.header.Authorization'],
        jwtAudience: [client.userPoolClientId],
      }
    );

    const getChatIntegration = new HttpLambdaIntegration(
      'APIIntegration::getChat',
      lambda
    );
    const sendChatIntegration = new HttpLambdaIntegration(
      'APIIntegration::sendChat',
      lambda
    );

    api.addRoutes({
      path: '/getChat',
      methods: [HttpMethod.GET],
      integration: getChatIntegration,
      authorizer,
    });
    api.addRoutes({
      path: '/sendChat',
      methods: [HttpMethod.POST],
      integration: sendChatIntegration,
      authorizer,
    });
  }

  setupAuth() {
    const googleClientSecret = cdk.SecretValue.secretsManager('prod/bio', {
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

    const callbackUrl = 'http://localhost:19006/';
    const client = userPool.addClient('BioAuthClient', {
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        callbackUrls: [callbackUrl],
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
