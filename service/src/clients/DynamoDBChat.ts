import { DynamoDB } from 'aws-sdk';
import { INITIAL_GREETING } from './OpenAI';
import { Message } from '../types/messages';
import { Meal } from '../types/meals';

// This is what is persisted in DDB
export type ChatSession = {
  date: string;
  messages: Message[];
};

class DynamoDBChat {
  private client: DynamoDB.DocumentClient;
  private today: string;
  private userId: string;

  constructor(userId: string) {
    this.today = new Date().toISOString().split('T')[0];
    this.client = new DynamoDB.DocumentClient({ region: 'us-east-2' });
    this.userId = userId;
  }

  async getMessages(): Promise<ChatSession[]> {
    const { Items } = await this.client
      .query({
        TableName: 'UserChats',
        KeyConditionExpression: 'userId = :userId and #date = :date',
        ExpressionAttributeValues: {
          ':userId': this.userId,
          ':date': this.today,
        },
        ExpressionAttributeNames: {
          '#date': 'date',
        },
      })
      .promise();

    const messages: ChatSession[] =
      Items?.length === 0
        ? [
            {
              date: new Date().toISOString().split('T')[0],
              messages: [{ content: INITIAL_GREETING, role: 'assistant' }],
            },
          ]
        : (Items as ChatSession[]);

    return messages;
  }

  async addMessages(messages: Message[]): Promise<void> {
    await this.client
      .update({
        TableName: 'UserChats',
        Key: {
          userId: this.userId,
          date: this.today,
        },
        ExpressionAttributeValues: {
          ':message': messages.map((message) => ({
            content: message.content,
            role: message.role,
            meal: message.meal,
          })),
          ':empty_list': [],
        },
        UpdateExpression:
          'SET messages = list_append(if_not_exists(messages, :empty_list), :message)',
      })
      .promise();
  }

  async addMeal(meal: Meal): Promise<void> {
    await this.client
      .update({
        TableName: 'UserChats',
        Key: {
          userId: this.userId,
          date: this.today,
        },
        ExpressionAttributeValues: {
          ':meal': [meal],
          ':empty_list': [],
        },
        UpdateExpression:
          'SET meal = list_append(if_not_exists(meals, :empty_list), :meal)',
      })
      .promise();
  }
}

export default DynamoDBChat;
