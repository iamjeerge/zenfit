/**
 * Drop-in replacement for expo-router's useRouter hook.
 * Maps the Expo Router API surface to React Navigation.
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Route path → screen name mapping (from expo-router paths)
const ROUTE_MAP: Record<string, keyof RootStackParamList> = {
  '/': 'Tabs',
  '/(tabs)': 'Tabs',
  '/workout': 'Workout',
  '/sleep': 'Sleep',
  '/mood': 'Mood',
  '/bmi': 'BMI',
  '/active-workout': 'ActiveWorkout',
  '/water': 'Water',
  '/recovery': 'Recovery',
  '/body-measurements': 'BodyMeasurements',
  '/habits': 'Habits',
  '/journal': 'Journal',
  '/challenges': 'Challenges',
  '/barcode-scanner': 'BarcodeScanner',
  '/progress': 'Progress',
  '/appearance': 'Appearance',
  '/settings': 'Settings',
  '/social': 'Social',
  '/reminders': 'Reminders',
  '/subscription': 'Subscription',
  '/beauty-tips': 'BeautyTips',
  '/videos': 'Videos',
  '/steps': 'Steps',
  '/progress-photos': 'ProgressPhotos',
  '/workout-plan': 'WorkoutPlan',
  '/auth': 'Auth',
  '/onboarding': 'Onboarding',
};

function mapRoute(path: string): keyof RootStackParamList {
  const cleaned = path.replace(/\?.*$/, ''); // strip query string
  return ROUTE_MAP[cleaned] ?? ('Tabs' as keyof RootStackParamList);
}

type PushArg = string | { pathname: string; params?: Record<string, string> };

function resolvePush(arg: PushArg): [keyof RootStackParamList, Record<string, string> | undefined] {
  if (typeof arg === 'string') {
    return [mapRoute(arg), undefined];
  }
  return [mapRoute(arg.pathname), arg.params];
}

export function useRouter() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return {
    push: (arg: PushArg) => {
      const [screen, params] = resolvePush(arg);
      navigation.navigate(screen as any, params as any);
    },
    replace: (path: string) => navigation.replace(mapRoute(path) as any),
    back: () => navigation.goBack(),
    canGoBack: () => navigation.canGoBack(),
    navigate: (arg: PushArg) => {
      const [screen, params] = resolvePush(arg);
      navigation.navigate(screen as any, params as any);
    },
  };
}

export function useLocalSearchParams() {
  // No-op shim; params not used via expo-router in this project
  return {} as Record<string, string>;
}
