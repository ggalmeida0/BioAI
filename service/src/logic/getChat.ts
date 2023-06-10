import { GetChatInput } from './service';

const getChat = async (input: GetChatInput) => {
  const { userId, ddbChat } = input;

  console.log('Getting chats for user ', userId);

  return await ddbChat.getMessages();
};

export default getChat;
