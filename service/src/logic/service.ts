import { DynamoDB } from 'aws-sdk';
import DynamoDBFacade from '../clients/DynamoDBFacade';
import OpenAI from '../clients/OpenAI';
import { AssistantMessage } from '../types/messages';
import { Meal } from '../types/meals';
import getChat from './getChat';
import sendChat from './sendChat';
import saveMeal from './saveMeal';
import getFrequentMeals from './getFrequentMeals';

export type SendChatInput = {
  userId: string;
  userMessage: string;
  ddb: DynamoDBFacade;
  openAI: OpenAI;
};

export type GetChatInput = {
  userId: string;
  ddb: DynamoDBFacade;
};

export type SaveMealInput = {
  userId: string;
  meal: Meal;
  ddb: DynamoDBFacade;
};

export type GetFrequentMealsInput = {
  ddb: DynamoDBFacade;
}

type BioServiceAPI = {
  getChat: (
    input: GetChatInput
  ) => Promise<DynamoDB.DocumentClient.ItemList | undefined>;
  sendChat: (input: SendChatInput) => Promise<AssistantMessage>;
  saveMeal: (input: SaveMealInput) => Promise<void>;
  getFrequentMeals: (input: GetFrequentMealsInput) => Promise<Meal[]>
};

const serviceAPI: BioServiceAPI = {
  getChat,
  sendChat,
  saveMeal,
  getFrequentMeals
};

export default serviceAPI;