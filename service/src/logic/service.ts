import getChat from './getChat';
import sendChat from './sendChat';
import { DynamoDB } from 'aws-sdk';
import DynamoDBChat from '../clients/DynamoDBChat';
import OpenAI from '../clients/OpenAI';
import { AssistantMessage } from '../models/messages';

export type SendChatInput = {
  userId: string;
  userMessage: string;
  ddbChat: DynamoDBChat;
  openAI: OpenAI;
};

export type GetChatInput = {
  userId: string;
  ddbChat: DynamoDBChat;
};

type BioServiceAPI = {
  getChat: (
    input: GetChatInput
  ) => Promise<DynamoDB.DocumentClient.ItemList | undefined>;
  sendChat: (input: SendChatInput) => Promise<AssistantMessage>;
};

const serviceAPI: BioServiceAPI = {
  getChat,
  sendChat,
};

export default serviceAPI;
