import { DynamoDB } from 'aws-sdk';
import { INITIAL_GREETING } from '../clients/openai';

const getChat = async (userId: string) => {
  console.log('Getting chats for user ', userId);

  const dynamoDb = new DynamoDB.DocumentClient();
  const { Items } = await dynamoDb
    .query({
      TableName: 'UserChats',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    .promise();
  return Items?.length === 0
    ? [
        {
          date: new Date().toISOString().split('T')[0],
          messages: [{ content: INITIAL_GREETING, role: 'assistant' }],
        },
      ]
    : Items;
};

export default getChat;
