import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { SERVICE_GET_CHAT, SERVICE_SEND_CHAT } from './queryKeys';
import { API } from 'aws-amplify';
import useAuth from './useAuth';
import { DateTime } from 'luxon';

type GetChatResponse = {
  date: string;
  messages: Message[];
};

export type Meal = {
  title: string;
  breakdown: NutritionBreakdown;
  date?: string;
  emoji: string;
};

type NutritionBreakdown = {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  portion: string;
};

export type Message = {
  content?: string;
  timestamp?: string;
  role: string;
  meal?: Meal;
};

export type ChatContext = {
  messagesContext: UseQueryResult<GetChatResponse[]>;
  senderContext: UseMutationResult<void, unknown, string, unknown>;
};

type useChatProps = {
  onSendSuccess: (data: Message) => void;
};

const useChat = ({ onSendSuccess }: useChatProps): ChatContext => {
  const authContext = useAuth();
  const timezone = DateTime.local().zoneName;
  const idToken =
    authContext.userAuthContext.data.signInUserSession.idToken.jwtToken;
  const messagesContext = useQuery({
    queryKey: [SERVICE_GET_CHAT],
    queryFn: () =>
      API.get('BioAPI', '/getChat', {
        headers: {
          Authorization: idToken,
          Timezone: timezone,
        },
      }),
  });
  const senderContext = useMutation({
    mutationKey: [SERVICE_SEND_CHAT],
    mutationFn: (message: string) =>
      API.post('BioAPI', '/sendChat', {
        headers: {
          Authorization: idToken,
          Timezone: timezone,
        },
        body: { message },
      }),
    onSuccess: (data) => onSendSuccess(data),
  });

  return {
    messagesContext,
    senderContext,
  };
};

export default useChat;
