const env = process.env.EXPO_ENV;

const apiEndpoint = env === 'prod' ? 'https://9r8oxxcs38.execute-api.us-east-2.amazonaws.com' : 'http://localhost:3000';

export default {
  "expo": {
    "name": "bio",
    "slug": "bio",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    extra: {
      apiEndpoint
    }
  }
}
