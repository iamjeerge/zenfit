import { Stack } from 'expo-router';
import SubscriptionScreen from '../src/screens/SubscriptionScreen';

export default function SubscriptionRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SubscriptionScreen />
    </>
  );
}
