import { ChatCompletionRequestMessage, OpenAIApi } from 'openai';
import getChat from './getChat';
import sendChat from './sendChat';
import { AWSError, DynamoDB } from 'aws-sdk';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';

type BioServiceAPI = {
  getChat: (
    userId: string
  ) => Promise<DynamoDB.DocumentClient.ItemList | undefined>;
  sendChat: (
    openAIClient: OpenAIApi,
    userId: string,
    message: string,
    dynamoDBCLient: DynamoDB
  ) => Promise<string>;
};

const serviceAPI: BioServiceAPI = {
  getChat,
  sendChat,
};

export default serviceAPI;
