const Auth = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_am4K7bVvt',
  userPoolWebClientId: '77ggcpkhhioldeagd63vf3lr8f',
  mandatorySignIn: true,
  oauth: {
    domain: 'bio-ai.auth.us-east-2.amazoncognito.com',
    scope: ['email', 'openid'],
    redirectSignIn: 'http://localhost:19006/',
    redirectSignOut: 'http://localhost:19006/',
    responseType: 'code',
  },
};

const API = {
  endpoints: [
    {
      name: 'BioAPI',
      endpoint: 'https://9r8oxxcs38.execute-api.us-east-2.amazonaws.com',
      region: 'us-east-2',
      authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    },
  ],
};

export default { Auth, API };
