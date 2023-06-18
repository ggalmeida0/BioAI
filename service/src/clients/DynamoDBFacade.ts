import { DynamoDB } from 'aws-sdk';
import { DateTime } from 'luxon';
import { INITIAL_GREETING } from './OpenAI';
import { Message } from '../types/messages';
import { Meal } from '../types/meals';
import { Session } from 'inspector';

// This is what is persisted in DDB
export type ChatSession = {
  date: string;
  messages: Message[];
  meals?: Meal[];
};

class DynamoDBFacade {
  private client: DynamoDB.DocumentClient;
  private today: number;
  private userId: string;
  private table: string;

  constructor(userId: string) {
    this.today = DateTime.local().startOf('day').toSeconds();
    this.client = new DynamoDB.DocumentClient({ region: 'us-east-2' });
    this.userId = userId;
    this.table = 'UserSessions';
  }

  async getMessages(): Promise<ChatSession[]> {
    console.log(this.table);
    const { Items } = await this.client
      .query({
        TableName: this.table,
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
        TableName: this.table,
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
        TableName: this.table,
        Key: {
          userId: this.userId,
          date: this.today,
        },
        ExpressionAttributeValues: {
          ':meals': [meal],
          ':empty_list': [],
        },
        UpdateExpression:
          'SET meals = list_append(if_not_exists(meals, :empty_list), :meals)',
      })
      .promise();
  }

  async getFrequentMeals(): Promise<Meal[]> {
    const ddbResult = await this.client
      .query({
        TableName: this.table,
        KeyConditionExpression: 'userId = :userId and #date <= :date',
        ExpressionAttributeNames: { '#date': 'date' },
        ExpressionAttributeValues: {
          ':userId': this.userId,
          ':date': this.today,
        },
        FilterExpression: 'attribute_exists(meals)',
        ScanIndexForward: false,
        Limit: 30,
      })
      .promise();

    const meals: Meal[] = ddbResult.Items!.flatMap((record) => record.meals!);

    console.log

    const mealFrequencyMap = meals.reduce<
      Record<string, { freq: number; meal: Meal }>
    >(
      (acc, curr) => ({
        ...acc,
        [curr.title]: { freq: (acc[curr.title]?.freq || 0) + 1, meal: curr },
      }),
      {}
    );

    return Object.entries(mealFrequencyMap)
      .sort((meal1, meal2) => meal2[1].freq - meal1[1].freq)
      .flatMap((item) => item[1].meal);
  }
}

export default DynamoDBFacade;
