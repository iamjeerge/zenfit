# ZenFit Setup Guide

Complete setup instructions for developing ZenFit locally.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm** or **yarn**: Latest version
- **Expo CLI**: Installed globally
- **Git**: For version control
- **Supabase Account**: Free tier available at https://supabase.com
- **iOS Simulator** (macOS) or **Android Emulator**: For local testing

### System Requirements

**macOS**
- macOS 12.0 or later
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

**Linux/Windows**
- WSL2 for Windows recommended
- Android Studio with Android SDK
- Java Development Kit (JDK) 11+

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zenfit.git
cd zenfit
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Install Expo CLI Globally

```bash
npm install -g expo-cli
```

### 4. Create Supabase Project

1. Go to https://supabase.com and sign up (or log in)
2. Click "New Project"
3. Choose:
   - Project name: `zenfit-dev`
   - Database password: Strong password (save this!)
   - Region: Closest to you
4. Wait for project to initialize (5-10 minutes)

### 5. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query
3. Copy entire contents of `supabase/schema.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Verify all 14 tables are created

```bash
# Alternative: Run from CLI
supabase db push
```

### 6. Configure Environment Variables

1. Get your Supabase keys from **Settings** → **API**
2. Create `.env` file in project root:

```bash
cp .env.example .env
```

3. Fill in your keys:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Finding Your Keys:**
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Anon public key

### 7. Enable Authentication Methods

In Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable "Email" (should be default)
3. Go to **URL Configuration**
4. Add redirect URLs:
   - `http://localhost:8081`
   - `http://localhost:19000`
   - `exp://localhost:19000`
   - Your production domain

### 8. Verify Installation

```bash
# Start development server
npm start

# You should see:
# ▶︎ Expo Go (Android): exp://localhost:19000
# ▶︎ Web:               http://localhost:19000
# ▶︎ iOS Simulator:     i
```

---

## Running the App

### Development Server

```bash
npm start
```

Opens interactive mode with options:

- **`i`** — Open iOS Simulator
- **`a`** — Open Android Emulator
- **`w`** — Open Web
- **`r`** — Reload app
- **`j`** — Toggle debugger

### iOS Development

```bash
# Option 1: Using Expo CLI
npm run ios

# Option 2: Direct to Simulator
expo start --ios
```

**Requirements:**
- macOS with Xcode installed
- iOS Simulator running
- Project setup completed

### Android Development

```bash
# Option 1: Using Expo CLI
npm run android

# Option 2: Direct to Emulator
expo start --android
```

**Requirements:**
- Android SDK installed
- Android Emulator running
- `ANDROID_HOME` environment variable set

### Web Development

```bash
npm run web
```

Opens http://localhost:19000 in browser. Hot reload enabled.

---

## Database Setup

### Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy supabase/schema.sql and execute
```

### Seed Sample Data

```bash
# Optional: Add test data
npm run seed
# (if seed script exists)
```

### Verify Schema

In Supabase dashboard → Table Editor, verify these 14 tables exist:
- profiles
- sessions
- user_sessions
- meals
- daily_metrics
- workout_sessions
- goals
- reminders
- achievements
- wearable_sync
- subscriptions
- activity_log
- favorites
- notifications

---

## Building for Production

### EAS Build Setup

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Create EAS project:
```bash
eas build:configure
```

3. Configure build settings in `eas.json`

### Build iOS

```bash
# Development build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

### Build Android

```bash
# Development build
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### Generate APK

```bash
# For local testing
eas build --platform android --local
```

### Submit to App Stores

```bash
# Submit to App Store (iOS)
eas submit --platform ios

# Submit to Google Play (Android)
eas submit --platform android
```

---

## Troubleshooting

### Issue: "Metro bundler error"

**Solution:**
```bash
# Clear cache and restart
npm start -- --clear
```

### Issue: "Cannot find module '@/lib/supabase'"

**Solution:**
Verify `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: "Supabase authentication fails"

**Check:**
1. `.env` file has correct keys
2. Supabase project is active
3. API keys are not expired
4. Redirect URLs are configured

**Reset Keys:**
1. Go to Supabase Settings → API
2. Click "Rotate" next to any key
3. Update `.env` with new keys

### Issue: "iOS Simulator won't start"

```bash
# Reset simulator
xcrun simctl erase all

# Restart services
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService

# Reopen Simulator
open -a Simulator
```

### Issue: "Android Emulator won't connect"

```bash
# Reset adb
adb kill-server
adb start-server

# List available devices
adb devices

# Connect to emulator
adb connect emulator-5554
```

### Issue: "Build fails with pod install error" (iOS)

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Issue: "Gradle build fails" (Android)

```bash
# Clean gradle cache
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Issue: "Environment variables not loading"

```bash
# Verify .env file is in project root
ls -la .env

# Clear Expo cache
npm start -- --clear

# Restart development server
npm start
```

---

## Development Workflow

### Creating New Screens

1. Create screen file in `app/(tabs)/` or `app/`
2. Use Expo Router conventions
3. Import from `@/lib`, `@/store`, `@/components`

```typescript
// app/(tabs)/example.tsx
import { View, Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function ExampleScreen() {
  const { user } = useAuthStore();

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
    </View>
  );
}
```

### Adding New Database Tables

1. Edit `supabase/schema.sql`
2. Run migration: `supabase db push`
3. Add type definitions in `src/types/`
4. Update API documentation

### Adding State with Zustand

```typescript
// src/store/exampleStore.ts
import { create } from 'zustand';

type ExampleState = {
  value: string;
  setValue: (value: string) => void;
};

export const useExampleStore = create<ExampleState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### Testing Authentication

```bash
# Create test account in Supabase
# Go to Authentication → Users → Add user

# Test login flow
npm start
# Use test account in auth screen
```

---

## Performance Optimization

### Reduce App Bundle Size

```bash
# Analyze bundle
npx expo-optimize
```

### Enable Production Mode

```bash
# Build production bundle
expo build --platform ios --release
```

### Monitor Performance

```bash
# Enable React DevTools
npm start
# Press 'r' in terminal, then open DevTools
```

---

## Wearable Integration Setup

### Apple HealthKit (iOS)

1. Add to `app.json`:
```json
{
  "plugins": [
    ["expo-health", {
      "isHealthKitEnabled": true
    }]
  ]
}
```

2. Configure health permissions in `ios/Podfile`

### Google Health Connect (Android)

1. Add to `app.json`:
```json
{
  "plugins": [
    ["expo-health-connect"]
  ]
}
```

2. Add permissions in `AndroidManifest.xml`

---

## Useful Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Type check
npm run type-check

# Lint code
npm run lint

# Run tests
npm test

# Build for production (EAS)
eas build

# View logs
expo logs

# Clear Expo cache
npm start -- --clear
```

---

## Environment Checklist

- [ ] Node.js 18+
- [ ] npm/yarn installed
- [ ] Expo CLI installed globally
- [ ] `.env` file created with Supabase keys
- [ ] Supabase project created
- [ ] Database schema initialized
- [ ] iOS Simulator or Android Emulator available
- [ ] Authentication methods enabled in Supabase
- [ ] `npm install` completed
- [ ] `npm start` runs without errors

---

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check [API.md](./API.md) for API documentation
3. Review [CONTRIBUTING.md](../CONTRIBUTING.md) before making changes
4. Explore [TEST_GUIDE.md](../TEST_GUIDE.md) for testing

## Support

For issues:
1. Check troubleshooting section above
2. Search existing GitHub issues
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - Node/Expo version
   - OS and device info

---

Happy coding!
