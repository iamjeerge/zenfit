import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { useOfflineSync } from '../src/hooks/useOfflineSync';
import OfflineBanner from '../src/components/OfflineBanner';

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { isConnected, pendingCount, isSyncing } = useOfflineSync();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner isConnected={isConnected} pendingCount={pendingCount} isSyncing={isSyncing} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="appearance" />
        <Stack.Screen name="bmi" />
        <Stack.Screen name="workout-plan" />
        <Stack.Screen name="progress-photos" />
        <Stack.Screen name="social" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="beauty-tips" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="workout" />
        <Stack.Screen name="sleep" />
        <Stack.Screen name="mood" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="active-workout" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="water" />
        <Stack.Screen name="recovery" />
        <Stack.Screen name="body-measurements" />
        <Stack.Screen name="habits" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="challenges" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
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
