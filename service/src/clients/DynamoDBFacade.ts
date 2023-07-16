import { DynamoDB } from 'aws-sdk';
import { DateTime } from 'luxon';
import { Message } from '../types/messages';
import { Meal } from '../types/meals';

export type ChatSession = {
  date: string;
  messages: Message[];
  meals?: Meal[];
};

export type DatedMeal = {
  date: string;
  meals: Meal[];
};

class DynamoDBFacade {
  private client: DynamoDB.DocumentClient;
  private today: number;
  private userId: string;
  private table: string;
  private timezone: string;

  constructor(userId: string, timezone: string) {
    this.timezone = timezone;
    this.today = DateTime.local().setZone(timezone).startOf('day').toSeconds();
    this.client = new DynamoDB.DocumentClient({ region: 'us-east-2' });
    this.userId = userId;
    this.table = 'UserSessions';
  }

  async getMessages(date?: number): Promise<ChatSession[]> {
    console.log(date);
    const { Items } = await this.client
      .query({
        TableName: this.table,
        KeyConditionExpression: `userId = :userId and ${
          date ? '#date = :date' : '#date <= :date'
        }`,
        ExpressionAttributeValues: {
          ':userId': this.userId,
          ':date': date ?? this.today,
        },
        ExpressionAttributeNames: {
          '#date': 'date',
        },
      })
      .promise();

    return Items as ChatSession[];
  }

  async addMessages(messages: Message[], date?: number): Promise<void> {
    await this.client
      .update({
        TableName: this.table,
        Key: {
          userId: this.userId,
          date: date ?? this.today,
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

  async addMeal(meal: Meal, date?: number): Promise<void> {
    await this.client
      .update({
        TableName: this.table,
        Key: {
          userId: this.userId,
          date: date ?? this.today,
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

    console.log;

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

  async getMealsForDates(dates: number[]): Promise<DatedMeal[]> {
    console.log('Performing getMealsForDates with input:', dates);
    const ddbResult = await this.client
      .batchGet({
        RequestItems: {
          [this.table]: {
            Keys: dates.map((date) => ({ userId: this.userId, date })),
          },
        },
      })
      .promise();
    const datedMeals = ddbResult
      .Responses![this.table].filter((session) => session.meals !== undefined)
      .map((session) => ({
        date: DateTime.fromSeconds(session.date)
          .setZone(this.timezone)
          .toFormat('yyyy-MM-dd'),
        meals: session.meals,
      })) as DatedMeal[];
    return datedMeals;
  }

  async deleteMeal(mealTitle: string, date: number) {
    const results = await this.getMealsForDates([date]);
    const meals = results.find((res) => res.date)?.meals;
    const deleteIndex = meals?.findIndex((meal) => meal.title === mealTitle);
    const updatedMeals = meals?.filter((_, index) => index !== deleteIndex);

    console.log('Updated meals:', updatedMeals, 'date:', date);

    await this.client
      .update({
        TableName: this.table,
        Key: {
          userId: this.userId,
          date,
        },
        ExpressionAttributeValues: {
          ':meals': updatedMeals,
        },
        UpdateExpression: 'SET meals = :meals',
      })
      .promise();
  }
}

export default DynamoDBFacade;
