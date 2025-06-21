import 'dotenv/config';

export default {
  expo: {
    name: 'MindWeb Knowledge App',
    slug: 'mindweb-knowledge-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mindweb',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mindweb.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0f172a',
      },
      package: 'com.mindweb.app',
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you add images to your knowledge nodes.',
          cameraPermission: 'The app accesses your camera to let you take photos for your knowledge nodes.',
        },
      ],
      [
        'expo-document-picker',
        {
          iCloudContainerEnvironment: 'Production',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission: 'Allow MindWeb to access your microphone for audio recordings.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'mindweb-knowledge-app',
      },
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    updates: {
      url: 'https://u.expo.dev/mindweb-knowledge-app',
    },
  },
};