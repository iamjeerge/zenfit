import { Stack } from 'expo-router';
import AppearanceScreen from '../src/screens/AppearanceScreen';

export default function AppearanceRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppearanceScreen />
    </>
  );
}
