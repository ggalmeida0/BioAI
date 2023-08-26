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
  loginWithGoogleContext: UseMutationResult<ICredentials, unknown, void, unknown>;
  loginWithEmailContext: UseMutationResult<void, unknown, { username: string, password: string }, unknown>;
  logoutContext: UseMutationResult<any, unknown, void, unknown>;
  signUpWithEmailContext: UseMutationResult<void, unknown, { username: string, email: string, password: string }, unknown>; // Add this line
};

const ONE_MINUTE = 1000 * 60;

const useAuth = (queryClient?: QueryClient): AuthContext => {
  const queryClientRef = queryClient ?? useQueryClient();

  const userAuthContext = useQuery({
    queryKey: [GET_AUTH_USER],
    queryFn: () => Auth.currentAuthenticatedUser(),
    cacheTime: ONE_MINUTE,
  });

  const loginWithGoogleContext = useMutation({
    mutationFn: () =>
      Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      }),
    onSuccess: () => queryClientRef.invalidateQueries([GET_AUTH_USER]),
  });

  const loginWithEmailContext = useMutation({
    mutationFn: async ({ username, password }: { username: string, password: string }) => {
      await Auth.signIn(username, password);

      queryClientRef.invalidateQueries([GET_AUTH_USER]);
    },
  });

  const logoutContext = useMutation({
    mutationFn: () => Auth.signOut(),
    onSuccess: () => queryClientRef.invalidateQueries([GET_AUTH_USER]),
  });

  const signUpWithEmailContext = useMutation({
    mutationFn: async ({ username, email, password }: { username: string, email: string, password: string }) => {
      // Use Amplify's Auth.signUp method for email sign-up
      await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
        autoSignIn: {
          enabled: true,
        },
      });
      queryClientRef.invalidateQueries([GET_AUTH_USER]);
    },
  });


  return { userAuthContext, loginWithGoogleContext, loginWithEmailContext, logoutContext, signUpWithEmailContext };
};

export default useAuth;
