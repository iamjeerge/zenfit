import { Stack } from 'expo-router';
import BeautyTipsScreen from '../src/screens/BeautyTipsScreen';

export default function BeautyTipsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BeautyTipsScreen />
    </>
  );
}
