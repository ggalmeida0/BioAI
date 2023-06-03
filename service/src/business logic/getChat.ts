import { DynamoDB } from 'aws-sdk';

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
  return Items;
};

export default getChat;
