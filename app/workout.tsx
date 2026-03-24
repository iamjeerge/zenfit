import { Stack } from 'expo-router';
import WorkoutScreen from '../src/screens/WorkoutScreen';

export default function WorkoutRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WorkoutScreen />
    </>
  );
}
