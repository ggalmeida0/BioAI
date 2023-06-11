import getChat from './getChat';
import sendChat from './sendChat';
import saveMeal from './saveMeal';
import { DynamoDB } from 'aws-sdk';
import DynamoDBChat from '../clients/DynamoDBChat';
import OpenAI from '../clients/OpenAI';
import { AssistantMessage } from '../types/messages';
import { Meal } from '../types/meals';

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

export type SaveMealInput = {
  userId: string;
  meal: Meal;
  ddbChat: DynamoDBChat;
};

type BioServiceAPI = {
  getChat: (
    input: GetChatInput
  ) => Promise<DynamoDB.DocumentClient.ItemList | undefined>;
  sendChat: (input: SendChatInput) => Promise<AssistantMessage>;
  saveMeal: (input: SaveMealInput) => Promise<void>;
};

const serviceAPI: BioServiceAPI = {
  getChat,
  sendChat,
  saveMeal,
};

export default serviceAPI;
