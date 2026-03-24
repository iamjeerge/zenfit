import { Stack } from 'expo-router';
import SleepScreen from '../src/screens/SleepScreen';

export default function SleepRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SleepScreen />
    </>
  );
}
