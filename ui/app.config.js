const env = process.env.EXPO_ENV;

const apiEndpoint =
  env === 'prod'
    ? 'https://uudihltgbu4wqxm3nckfe7ylgi0kzccx.lambda-url.us-east-2.on.aws'
    : 'http://localhost:3000';
const authRedirectUri =
  env === 'prod'
    ? 'https://master.d3mqj86iwprlmp.amplifyapp.com/'
    : 'http://localhost:19006/';

export default {
  expo: {
    name: 'bio',
    slug: 'bio',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiEndpoint,
      authRedirectUri,
    },
  },
};
