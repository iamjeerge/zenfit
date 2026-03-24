import { Stack } from 'expo-router';
import BMIScreen from '../src/screens/BMIScreen';

export default function BMIRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BMIScreen />
    </>
  );
}
