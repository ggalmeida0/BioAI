const prodApiEndpoint = process.env.PROD_API_ENDPOINT;
const prodAuthRedirectUri = process.env.UI_PROD_AUTH_REDIRECT_URI;
const easProjectId = process.env.EAS_PROJECT_ID;

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
      prodApiEndpoint,
      webLocalApiEndpoint: 'http://localhost:3000',
      prodAuthRedirectUri,
      eas: {
        projectId: easProjectId,
      },
    },
  },
};
