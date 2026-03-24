import { Stack } from 'expo-router';
import RemindersScreen from '../src/screens/RemindersScreen';

export default function RemindersRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RemindersScreen />
    </>
  );
}
