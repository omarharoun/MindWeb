# MindWeb - Knowledge Management App

A React Native app built with Expo SDK 53 for creating and managing your personal knowledge web.

## Features

- 🧠 Interactive knowledge nodes with drag-and-drop functionality
- 🎯 AI-powered content generation (OpenAI integration)
- 🎮 Interactive quizzes and knowledge testing
- 📊 Progress tracking and gamification
- 🎨 Rich media attachments (images, documents)
- 🌐 Visual knowledge web with connections
- 📱 Cross-platform (iOS, Android, Web)

## Prerequisites

- Node.js >= 18.0.0
- Expo CLI >= 6.0.0
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Run on specific platforms:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## Project Structure

```
mindweb-app/
├── app/                    # App routes (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home/Mind Web screen
│   │   ├── add.tsx        # Add Knowledge screen
│   │   ├── play.tsx       # Quiz/Testing screen
│   │   ├── progress.tsx   # Progress tracking
│   │   └── profile.tsx    # User profile & settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── EnhancedKnowledgeWeb.tsx
│   ├── DraggableNode.tsx
│   ├── EnhancedNodeDetailModal.tsx
│   └── ...
├── hooks/                 # Custom hooks
│   └── useKnowledgeStore.ts
├── types/                 # TypeScript definitions
│   └── knowledge.ts
└── assets/               # Images and static assets
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### SDK 53 Features

This project uses Expo SDK 53 with the following key features:

- **New Architecture**: Enabled for better performance
- **Expo Router v4**: File-based navigation
- **React Native 0.76**: Latest React Native version
- **TypeScript**: Full type safety
- **Metro Bundler**: Optimized bundling
- **EAS Build**: Cloud-based builds

## Building for Production

### Development Build
```bash
npm run build:all
```

### Production Build
```bash
eas build --platform all --profile production
```

### Submit to App Stores
```bash
npm run submit:ios
npm run submit:android
```

## Testing

Run tests:
```bash
npm test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
```bash
npx expo start --clear
```

2. **Node modules issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **iOS build issues**:
```bash
cd ios && pod install && cd ..
```

4. **Android build issues**:
```bash
cd android && ./gradlew clean && cd ..
```

### SDK 53 Specific

- Ensure Node.js version is >= 18.0.0
- Clear Metro cache if experiencing bundling issues
- Update Expo CLI to latest version: `npm install -g @expo/cli@latest`

## Performance Optimization

- Uses React Native Reanimated for smooth animations
- Implements lazy loading for large knowledge webs
- Optimized image handling with Expo Image Picker
- Efficient state management with custom hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details