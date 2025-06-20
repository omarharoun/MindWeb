# MindWeb - React Native App

This is the React Native version of MindWeb built with Expo Router and designed for mobile platforms.

## Features

- 📱 Native mobile experience with React Native
- 🧠 Interactive knowledge web visualization
- 📊 Progress tracking and gamification
- 🎯 Achievement system
- 💾 Local data persistence with AsyncStorage
- 🎨 Beautiful animations with Reanimated

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open the app:
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Web**: Press `w` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
mindweb-app/
├── app/                    # App routes (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home/Mind Web screen
│   │   ├── add.tsx        # Add Knowledge screen
│   │   ├── progress.tsx   # Progress tracking
│   │   └── profile.tsx    # User profile
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── types/                 # TypeScript definitions
└── assets/               # Images and static assets
```

## Key Technologies

- **Expo SDK 52** - React Native framework
- **Expo Router 4** - File-based navigation
- **React Native Reanimated** - Smooth animations
- **AsyncStorage** - Local data persistence
- **Lucide React Native** - Beautiful icons
- **TypeScript** - Type safety

## Building for Production

### Development Build
```bash
npx expo install --fix
eas build --profile development --platform all
```

### Production Build
```bash
eas build --profile production --platform all
```

## Platform Support

- ✅ iOS
- ✅ Android  
- ✅ Web (limited features)

Note: Some native features like haptic feedback are not available on web platform.