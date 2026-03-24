import { Stack } from 'expo-router';
import ProgressScreen from '../src/screens/ProgressScreen';

export default function ProgressRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProgressScreen />
    </>
  );
}
