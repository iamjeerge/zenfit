import { Stack } from 'expo-router';
import ProgressPhotosScreen from '../src/screens/ProgressPhotosScreen';

export default function ProgressPhotosRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProgressPhotosScreen />
    </>
  );
}
