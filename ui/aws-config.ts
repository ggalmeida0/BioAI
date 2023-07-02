import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const { env, prodApiEndpoint, webLocalApiEndpoint, prodAuthRedirectUri } =
  Constants.expoConfig!.extra!;
const expoGoAuthRedirectUri = `exp://${Constants.manifest?.debuggerHost}`;
const webLocalAuthRedirectUri = 'http://localhost:19006/';

const endpoint =
  env === 'prod' || Platform.OS === 'web'
    ? prodApiEndpoint
    : webLocalApiEndpoint;

const authRedirectUri =
  env === 'prod'
    ? prodAuthRedirectUri
    : Platform.OS === 'web'
    ? webLocalAuthRedirectUri
    : expoGoAuthRedirectUri;

const urlOpener = async (url: string, redirectUrl: string) => {
  // @ts-ignore
  const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
    url,
    redirectUrl
  );
  if (type === 'success' && Platform.OS === 'ios') {
    WebBrowser.dismissBrowser();
    return Linking.openURL(newUrl);
  }
};

const Auth = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_am4K7bVvt',
  userPoolWebClientId: '77ggcpkhhioldeagd63vf3lr8f',
  mandatorySignIn: true,
  oauth: {
    domain: 'bio-ai.auth.us-east-2.amazoncognito.com',
    scope: ['email', 'openid'],
    redirectSignIn: authRedirectUri,
    redirectSignOut: authRedirectUri,
    responseType: 'code',
    urlOpener,
  },
};

const API = {
  endpoints: [
    {
      name: 'BioAPI',
      endpoint: endpoint,
      region: 'us-east-2',
      authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    },
  ],
};

export default { Auth, API };
