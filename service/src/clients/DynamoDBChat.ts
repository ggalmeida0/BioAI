import { DynamoDB } from 'aws-sdk';
import { INITIAL_GREETING } from './OpenAI';
import { ChatCompletionRequestMessage } from 'openai';
import { Message } from '../models/messages';

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
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': this.userId,
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
    this.client.update({
      TableName: 'UserChats',
      Key: {
        userId: { S: this.userId },
        date: { S: this.today },
      },
      ExpressionAttributeValues: {
        ':message': {
          L: messages.map((message) => {
            M: {
              content: {
                S: message.content;
              }
              role: {
                S: message.role;
              }
            }
          }),
        },
        ':empty_list': { L: [] },
      },
      UpdateExpression:
        'SET messages = list_append(if_not_exists(messages, :empty_list), :message)',
    });
  }
}

export default DynamoDBChat;
