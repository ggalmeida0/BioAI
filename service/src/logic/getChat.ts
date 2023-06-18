import { GetChatInput } from './service';

const getChat = async (input: GetChatInput) => {
  const { userId, ddb } = input;

  console.log('Getting chats for user ', userId);

  return await ddb.getMessages();
};

export default getChat;
