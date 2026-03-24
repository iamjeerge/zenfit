import { Stack } from 'expo-router';
import MoodScreen from '../src/screens/MoodScreen';

export default function MoodRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MoodScreen />
    </>
  );
}
