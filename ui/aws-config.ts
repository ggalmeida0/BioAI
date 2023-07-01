import Constants from 'expo-constants';

const Auth = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_am4K7bVvt',
  userPoolWebClientId: '77ggcpkhhioldeagd63vf3lr8f',
  mandatorySignIn: true,
  oauth: {
    domain: 'bio-ai.auth.us-east-2.amazoncognito.com',
    scope: ['email', 'openid'],
    redirectSignIn: Constants.expoConfig!.extra!.authRedirectUri,
    redirectSignOut: Constants.expoConfig!.extra!.authRedirectUri,
    responseType: 'code',
  },
};

const API = {
  endpoints: [
    {
      name: 'BioAPI',
      endpoint: Constants.expoConfig!.extra!.apiEndpoint,
      region: 'us-east-2',
      authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    },
  ],
};

export default { Auth, API };
