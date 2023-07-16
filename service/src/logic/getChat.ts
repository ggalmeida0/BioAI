import { DateTime } from 'luxon';
import { GetChatInput } from './service';
import MessagesUtils from '../utils/messagesUtils';
import { SystemMessage } from '../types/messages';
import { ChatSession } from '../clients/DynamoDBFacade';
import { trimTokensToFitInContext } from '../utils/llmToken';

const getChat = async (input: GetChatInput): Promise<ChatSession[]> => {
  const { userId, ddb, openAI, timezone } = input;

  console.log('Getting chats for user ', userId, 'in timezone ', timezone);

  const todayInSecs = DateTime.local()
    .setZone(timezone)
    .startOf('day')
    .toSeconds();

  const todaysMessages = await ddb.getMessages(todayInSecs);

  if (todaysMessages.length === 0) {
    const allMessages = await ddb.getMessages();
    const llmMessage = await openAI.sendChat(
      trimTokensToFitInContext([
        ...MessagesUtils.asOpenAIModel(allMessages),
        new SystemMessage(
          allMessages.length === 0
            ? 'This is the users first time using the app. Give them a unique greeting talking about how you can help'
            : `Now it\'s ${DateTime.local()
                .setZone(timezone)
                .toFormat(
                  'MMMM dd, yyyy, h:mm'
                )}, a new day. Give the user a unique greeting based on the previous conversations`
        ),
      ]),
      false,
      1
    );
    await ddb.addMessages([llmMessage], todayInSecs);
    return [
      {
        date: DateTime.local().setZone(timezone).toFormat('yyyy-MM-dd'),
        messages: [llmMessage],
      } as ChatSession,
    ];
  }
  return todaysMessages;
};

export default getChat;
