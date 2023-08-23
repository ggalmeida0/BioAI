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
      bundleIdentifier: 'bio.ios',
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
      env: process.env.EXPO_ENV,
      prodApiEndpoint:
        'https://uudihltgbu4wqxm3nckfe7ylgi0kzccx.lambda-url.us-east-2.on.aws',
      webLocalApiEndpoint: 'http://localhost:3000',
      prodAuthRedirectUri: 'https://app.windieting.ai',
      eas: {
        projectId: 'ea90ed3d-b94c-43c6-990a-d5e9decd48ff',
      },
    },
  },
};
