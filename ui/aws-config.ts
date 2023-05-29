const Auth = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_KUibeo1Q6',
  userPoolWebClientId: '5o2d78td489lh6ci0a7a3r320r',
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
      endpoint: 'https://vnvdg8qcjl.execute-api.us-east-2.amazonaws.com',
      region: 'us-east-2',
      authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    },
  ],
};

export default { Auth, API };
