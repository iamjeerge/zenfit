// ─── Mocks for packages unavailable in the Jest environment ──────────────────

jest.mock('react-native-url-polyfill/auto', () => {});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

jest.mock('react-native-haptic-feedback', () => ({ trigger: jest.fn() }));

jest.mock('./src/utils/haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

jest.mock('./src/utils/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
}));

jest.mock('./src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(() =>
        Promise.resolve({
          data: {
            session: {
              access_token: 'test-token',
              user: { id: 'user-1', email: 'test@zenfit.app' },
            },
          },
          error: null,
        })
      ),
      signUp: jest.fn(() =>
        Promise.resolve({
          data: {
            session: {
              access_token: 'test-token',
              user: { id: 'user-1', email: 'test@zenfit.app' },
            },
          },
          error: null,
        })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() =>
        Promise.resolve({
          data: {
            id: 'user-1',
            full_name: 'Test User',
            email: 'test@zenfit.app',
            streak_days: 5,
            xp: 100,
            level: 1,
            subscription_status: 'free',
          },
          error: null,
        })
      ),
    })),
  },
}));


jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => false),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  NavigationContainer: ({ children }) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  useFocusEffect: jest.fn((cb) => cb()),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
    Screen: jest.fn(() => null),
  })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }) => {
      const React = require('react');
      return React.createElement(React.Fragment, null, children);
    },
    Screen: jest.fn(() => null),
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  SafeAreaView: ({ children, ...props }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  },
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  TouchableOpacity: require('react-native').TouchableOpacity,
  ScrollView: require('react-native').ScrollView,
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Animated = require('react-native').Animated;

  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      FlatList: View,
      Image: View,
      createAnimatedComponent: (comp) => comp,
      call: jest.fn(),
      add: jest.fn(),
      divide: jest.fn(),
      eq: jest.fn(),
      event: jest.fn(),
      lessThan: jest.fn(),
      modulo: jest.fn(),
      multiply: jest.fn(),
      greaterThan: jest.fn(),
      sub: jest.fn(),
      Value: jest.fn().mockImplementation(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({
          interpolate: jest.fn(),
        })),
      })),
      Clock: jest.fn(),
      Node: jest.fn(),
      createRef: jest.fn(),
      useSharedValue: jest.fn((v) => ({ value: v })),
      useAnimatedStyle: jest.fn(() => ({})),
      useAnimatedScrollHandler: jest.fn(() => ({})),
      useAnimatedRef: jest.fn(() => ({ current: null })),
      useDerivedValue: jest.fn((fn) => ({ value: fn() })),
      withTiming: jest.fn((v) => v),
      withSpring: jest.fn((v) => v),
      withDecay: jest.fn((v) => v),
      withDelay: jest.fn((_, v) => v),
      withRepeat: jest.fn((v) => v),
      withSequence: jest.fn((...v) => v[0]),
      runOnUI: jest.fn((fn) => fn),
      runOnJS: jest.fn((fn) => fn),
      Easing: {
        linear: jest.fn(),
        ease: jest.fn(),
        quad: jest.fn(),
        cubic: jest.fn(),
        poly: jest.fn(),
        sin: jest.fn(),
        circle: jest.fn(),
        exp: jest.fn(),
        elastic: jest.fn(),
        bounce: jest.fn(),
        bezier: jest.fn(),
        in: jest.fn(),
        out: jest.fn(),
        inOut: jest.fn(),
      },
      interpolate: jest.fn(),
      Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
      Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
      cancelAnimation: jest.fn(),
      measure: jest.fn(),
      scrollTo: jest.fn(),
      makeMutable: jest.fn((v) => ({ value: v, modify: jest.fn() })),
    },
    useSharedValue: jest.fn((v) => ({ value: v })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useDerivedValue: jest.fn((fn) => ({ value: fn() })),
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    withDecay: jest.fn((v) => v),
    withDelay: jest.fn((_, v) => v),
    withRepeat: jest.fn((v) => v),
    withSequence: jest.fn((...v) => v[0]),
    runOnUI: jest.fn((fn) => fn),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    interpolate: jest.fn(),
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    cancelAnimation: jest.fn(),
    measure: jest.fn(),
    scrollTo: jest.fn(),
    makeMutable: jest.fn((v) => ({ value: v, modify: jest.fn() })),
    createAnimatedComponent: (comp) => comp,
    FlatList: View,
    ScrollView: View,
    View,
    Text: View,
    Image: View,
  };
});

jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
  G: 'G',
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);
