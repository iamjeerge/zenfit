// Mock expo modules
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: React.forwardRef((props, ref) => {
      const { children, colors, start, end, ...restProps } = props;
      return React.createElement('View', { ref, ...restProps }, children);
    }),
  };
});

jest.mock('expo-blur', () => ({
  BlurView: (props) => {
    const React = require('react');
    return React.createElement('View', props, props.children);
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, android: {}, ios: {} })
  ),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  addNotificationReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('expo-image', () => ({
  Image: (props) => {
    const React = require('react');
    return React.createElement('Image', props);
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(() => Promise.resolve()),
            pauseAsync: jest.fn(() => Promise.resolve()),
            stopAsync: jest.fn(() => Promise.resolve()),
            unloadAsync: jest.fn(() => Promise.resolve()),
          },
        })
      ),
    },
  },
  Video: {
    useVideoPlayer: jest.fn(() => ({
      status: 'idle',
      play: jest.fn(),
      pause: jest.fn(),
    })),
  },
}));

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  Gyroscope: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
        accuracy: 0,
        heading: 0,
        speed: 0,
      },
    })
  ),
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

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
  useGlobalSearchParams: jest.fn(() => ({})),
  Link: (props) => {
    const React = require('react');
    const { children, href, ...restProps } = props;
    return React.createElement('Text', restProps, children);
  },
  Stack: {
    Screen: jest.fn(() => null),
  },
}));

// Mock Supabase client
jest.mock('../src/lib/supabase', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
  };

  const mockSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    user: mockUser,
  };

  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn(() =>
          Promise.resolve({ data: { session: mockSession }, error: null })
        ),
        signUp: jest.fn(() =>
          Promise.resolve({ data: { session: mockSession }, error: null })
        ),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
        getSession: jest.fn(() =>
          Promise.resolve({ data: { session: null }, error: null })
        ),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn((table) => ({
        select: jest.fn(function () {
          return {
            eq: jest.fn(function () {
              return {
                single: jest.fn(() =>
                  Promise.resolve({
                    data: {
                      id: 'test-profile-id',
                      full_name: 'Test User',
                      email: 'test@example.com',
                      streak_days: 5,
                      xp: 100,
                      level: 1,
                      subscription_status: 'free',
                    },
                    error: null,
                  })
                ),
              };
            }),
          };
        }),
        update: jest.fn(function () {
          return {
            eq: jest.fn(function () {
              return {
                select: jest.fn(function () {
                  return {
                    single: jest.fn(() =>
                      Promise.resolve({
                        data: { id: 'test-profile-id' },
                        error: null,
                      })
                    ),
                  };
                }),
              };
            }),
          };
        }),
      })),
    },
  };
});

// Mock react-native modules
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios,
    },
  };
});

// Mock gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: (props) => {
    const React = require('react');
    return React.createElement('View', props, props.children);
  },
}));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: (props) => {
    const React = require('react');
    return React.createElement('View', props, props.children);
  },
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const actualReanimated = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actualReanimated,
    useAnimatedStyle: () => ({}),
    useAnimatedReaction: () => undefined,
    useSharedValue: (v) => ({ value: v }),
    interpolate: () => 0,
    Extrapolate: {
      CLAMP: 0,
    },
  };
});

// Setup global test utilities
global.fetch = jest.fn();

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Non-serializable values were found in the state')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
