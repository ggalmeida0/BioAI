import { Auth } from 'aws-amplify';
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import {
  CognitoHostedUIIdentityProvider,
  CognitoUser,
} from '@aws-amplify/auth';
import { ICredentials } from '@aws-amplify/core';
import { GET_AUTH_USER } from './queryKeys';

type AuthContext = {
  userAuthContext: UseQueryResult<any, unknown>;
  loginContext: UseMutationResult<ICredentials, unknown, void, unknown>;
  logoutContext: UseMutationResult<any, unknown, void, unknown>;
};

const ONE_MINUTE = 1000 * 60;

const useAuth = (queryClient?: QueryClient): AuthContext => {
  const queryClientRef = queryClient ?? useQueryClient();

  const userAuthContext = useQuery({
    queryKey: [GET_AUTH_USER],
    queryFn: () => Auth.currentAuthenticatedUser(),
    cacheTime: ONE_MINUTE,
  });

  const loginContext = useMutation({
    mutationFn: () =>
      Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      }),
    onSuccess: () => queryClientRef.invalidateQueries([GET_AUTH_USER]),
  });

  const logoutContext = useMutation({
    mutationFn: () => Auth.signOut(),
    onSuccess: () => queryClientRef.invalidateQueries([GET_AUTH_USER]),
  });

  return { userAuthContext, loginContext, logoutContext };
};

export default useAuth;
