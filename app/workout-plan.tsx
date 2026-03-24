import { Stack } from 'expo-router';
import WorkoutPlanScreen from '../src/screens/WorkoutPlanScreen';

export default function WorkoutPlanRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WorkoutPlanScreen />
    </>
  );
}
