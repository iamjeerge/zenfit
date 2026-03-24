import { Stack } from 'expo-router';
import SocialScreen from '../src/screens/SocialScreen';

export default function SocialRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SocialScreen />
    </>
  );
}
