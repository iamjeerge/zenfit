/**
 * @file App.tsx
 * @module App
 * @description Root application component.
 * Sets up the React Navigation stack, tab navigator, offline banner,
 * and bootstraps auth state on mount via `useAuthStore.initialize()`.
 */

import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from './src/store/authStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useOfflineSync } from './src/hooks/useOfflineSync';
import OfflineBanner from './src/components/OfflineBanner';

// ── Screen imports ────────────────────────────────────────────────────────────
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Tab screens (moved from app/(tabs)/ → src/screens/tabs/)
import HomeScreen from './src/screens/tabs/HomeScreen';
import BreatheScreen from './src/screens/tabs/BreatheScreen';
import NutritionScreen from './src/screens/tabs/NutritionScreen';
import ProfileScreen from './src/screens/tabs/ProfileScreen';
import YogaScreen from './src/screens/YogaScreen';

// Stack screens
import WorkoutScreen from './src/screens/WorkoutScreen';
import SleepScreen from './src/screens/SleepScreen';
import MoodScreen from './src/screens/MoodScreen';
import BMIScreen from './src/screens/BMIScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import WaterTrackerScreen from './src/screens/WaterTrackerScreen';
import RecoveryScreen from './src/screens/RecoveryScreen';
import BodyMeasurementsScreen from './src/screens/BodyMeasurementsScreen';
import HabitChainScreen from './src/screens/HabitChainScreen';
import GratitudeJournalScreen from './src/screens/GratitudeJournalScreen';
import ChallengeRoomsScreen from './src/screens/ChallengeRoomsScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import AppearanceScreen from './src/screens/AppearanceScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SocialScreen from './src/screens/SocialScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import BeautyTipsScreen from './src/screens/BeautyTipsScreen';
import VideosScreen from './src/screens/VideosScreen';
import StepsScreen from './src/screens/StepsScreen';
import ProgressPhotosScreen from './src/screens/ProgressPhotosScreen';

import CustomTabBar from './src/components/CustomTabBar';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  Workout: undefined;
  Sleep: undefined;
  Mood: undefined;
  BMI: undefined;
  ActiveWorkout: undefined;
  Water: undefined;
  Recovery: undefined;
  BodyMeasurements: undefined;
  Habits: undefined;
  Journal: undefined;
  Challenges: undefined;
  BarcodeScanner: undefined;
  Progress: undefined;
  Appearance: undefined;
  Settings: undefined;
  Social: undefined;
  Reminders: undefined;
  Subscription: undefined;
  BeautyTips: undefined;
  Videos: undefined;
  Steps: undefined;
  ProgressPhotos: undefined;
  WorkoutPlan: undefined;
};

export type TabParamList = {
  Home: undefined;
  Breathe: undefined;
  Yoga: undefined;
  Nutrition: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Breathe" component={BreatheScreen} />
      <Tab.Screen name="Yoga" component={YogaScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { isConnected, pendingCount, isSyncing } = useOfflineSync();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <OfflineBanner isConnected={isConnected} pendingCount={pendingCount} isSyncing={isSyncing} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="Sleep" component={SleepScreen} />
          <Stack.Screen name="Mood" component={MoodScreen} />
          <Stack.Screen name="BMI" component={BMIScreen} />
          <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Water" component={WaterTrackerScreen} />
          <Stack.Screen name="Recovery" component={RecoveryScreen} />
          <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
          <Stack.Screen name="Habits" component={HabitChainScreen} />
          <Stack.Screen name="Journal" component={GratitudeJournalScreen} />
          <Stack.Screen name="Challenges" component={ChallengeRoomsScreen} />
          <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Appearance" component={AppearanceScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Social" component={SocialScreen} />
          <Stack.Screen name="Reminders" component={RemindersScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="BeautyTips" component={BeautyTipsScreen} />
          <Stack.Screen name="Videos" component={VideosScreen} />
          <Stack.Screen name="Steps" component={StepsScreen} />
          <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />
          <Stack.Screen name="WorkoutPlan" component={WorkoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

