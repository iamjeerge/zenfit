# ZenFit Architecture

Comprehensive overview of ZenFit's system design, technology stack, and implementation patterns.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Navigation Architecture](#navigation-architecture)
- [State Management](#state-management)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Real-Time Features](#real-time-features)
- [Wearable Integration](#wearable-integration)
- [AI Integration](#ai-integration)
- [Design System](#design-system)

---

## Overview

ZenFit is a cross-platform fitness app built with React Native and Expo. It provides a comprehensive platform for yoga, meditation, nutrition tracking, and fitness monitoring with a modern cosmic dark theme and glassmorphism design patterns.

**Key Features:**
- User authentication and profiles
- Yoga & meditation session library
- Breathing exercises and meditation guidance
- Nutrition tracking with AI recommendations
- Fitness metrics (heart rate, calories, steps)
- Achievement system and streaks
- Wearable device integration
- Real-time notifications
- Responsive design (iOS, Android, Web)

**Core Principles:**
- Type-safe TypeScript development
- Functional components with hooks
- Centralized state management (Zustand)
- Database-first architecture (Supabase PostgreSQL)
- Real-time capabilities
- Accessibility first
- Performance optimized

---

## Tech Stack

### Frontend

**React Native 0.83.2**
- Cross-platform mobile development
- Shared codebase for iOS and Android
- Native performance with JavaScript

**Expo 55.0.8**
- Managed React Native platform
- Built-in CLI tools
- Over-the-air updates capability
- Pre-configured native modules
- Web support through React Native Web

**Expo Router 55.0.7**
- File-based routing (like Next.js)
- Deep linking support
- Tab navigation
- Modal stacks
- Type-safe navigation

**React 19.2.0**
- Latest React features
- Improved performance
- Better error boundaries
- Concurrent features

**TypeScript 5.9.2**
- Type safety across codebase
- Better IDE support
- Compile-time error detection
- Self-documenting code

### State Management

**Zustand 5.0.12**
- Minimal boilerplate
- Event-driven updates
- DevTools support
- TypeScript-first
- Lightweight (2KB)

### Backend & Database

**Supabase**
- PostgreSQL database
- Real-time subscriptions
- Authentication with JWT
- File storage
- Edge functions

**PostgreSQL**
- Relational database
- JSONB for flexible data
- Full-text search
- Triggers and functions
- Row-level security

### UI & Styling

**React Native Core**
- StyleSheet for performance
- Flexbox layout
- View, Text, Image, ScrollView

**Expo Modules**
- `expo-linear-gradient` — Gradient backgrounds
- `expo-blur` — Blur effects
- `expo-image` — Optimized image loading
- `expo-font` — Custom fonts

### Sensors & Hardware

**expo-sensors**
- Accelerometer
- Gyroscope
- Magnetometer

**expo-location**
- GPS coordinates
- Address lookup

**expo-av**
- Audio playback for meditations
- Video playback for sessions

**expo-notifications**
- Push notifications
- Local reminders
- Notification scheduling

### Storage

**AsyncStorage**
- Persistent local storage
- Session persistence
- Cache layer

**Supabase Storage**
- User avatars
- Session thumbnails
- Video files

### Development Tools

**TypeScript**
- Type checking
- IntelliSense
- Compiler

**Jest & Testing Library**
- Unit testing
- Component testing
- Snapshot testing

**ESLint & Prettier**
- Code linting
- Automatic formatting
- Style consistency

---

## Folder Structure

```
zenfit/
├── docs/                          # Documentation
│   ├── API.md                     # API reference
│   ├── ARCHITECTURE.md            # This file
│   └── SETUP.md                   # Setup guide
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── screens/                   # Full screen components
│   │   ├── BeautyTipsScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── RemindersScreen.tsx
│   │   ├── StepsScreen.tsx
│   │   ├── SubscriptionScreen.tsx
│   │   └── VideosScreen.tsx
│   ├── hooks/                     # Custom React hooks
│   │   ├── useHealth.ts           # Health data integration
│   │   ├── useNotifications.ts    # Notifications
│   │   └── ...
│   ├── services/                  # Business logic services
│   │   ├── healthService.ts       # Wearable integration
│   │   ├── aiService.ts           # Claude API integration
│   │   ├── metricsService.ts      # Analytics
│   │   └── ...
│   ├── store/                     # Zustand state stores
│   │   ├── authStore.ts           # Authentication state
│   │   ├── fitnessStore.ts        # Fitness data
│   │   ├── nutritionStore.ts      # Nutrition tracking
│   │   └── ...
│   ├── lib/                       # Utilities & clients
│   │   ├── supabase.ts            # Supabase client
│   │   ├── apiClient.ts           # API utilities
│   │   └── ...
│   ├── types/                     # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── activity.ts
│   │   ├── nutrition.ts
│   │   └── ...
│   ├── theme/                     # Design system
│   │   ├── colors.ts              # Color tokens & gradients
│   │   ├── typography.ts          # Font styles
│   │   └── spacing.ts             # Spacing scale
│   ├── utils/                     # Helper functions
│   │   ├── formatters.ts          # Date/number formatting
│   │   ├── validators.ts          # Input validation
│   │   └── ...
│   └── navigation/                # Navigation config
│       └── constants.ts           # Route names
├── app/                           # Expo Router app directory
│   ├── _layout.tsx                # Root layout
│   ├── index.tsx                  # Home/Splash screen
│   ├── auth.tsx                   # Authentication screen
│   ├── onboarding.tsx             # Onboarding flow
│   └── (tabs)/                    # Tabbed screens
│       ├── _layout.tsx            # Tab layout
│       ├── index.tsx              # Home tab
│       ├── yoga.tsx               # Yoga tab
│       ├── breathe.tsx            # Meditation tab
│       ├── nutrition.tsx          # Nutrition tab
│       └── profile.tsx            # Profile tab
├── assets/                        # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── videos/
├── supabase/                      # Supabase configuration
│   ├── schema.sql                 # Database schema
│   ├── migrations/                # Migration scripts
│   └── functions/                 # Edge functions
├── __tests__/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── e2e/                           # End-to-end tests
│   └── sanity.e2e.ts
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── jest.config.js                 # Test configuration
├── .env.example                   # Environment template
├── .env                           # Environment variables (local)
├── .eslintrc.js                   # ESLint config
├── .prettierrc                    # Prettier config
├── .editorconfig                  # Editor settings
├── README.md                      # Project readme
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md             # Community guidelines
├── LICENSE                        # MIT License
└── CHANGELOG.md                   # Version history
```

### Directory Purposes

**`src/components/`** — Reusable UI building blocks
- Button components
- Input fields
- Cards with theme
- Modals and popovers
- List items
- Headers and footers

**`src/screens/`** — Full screen components
- Feature-specific screens
- Complex layouts
- Multiple components per screen
- Navigation integration

**`src/hooks/`** — Custom React hooks
- `useHealth()` — Health data fetching
- `useNotifications()` — Notification management
- `useAnimation()` — Reanimated animation hooks
- `useApi()` — API call hooks
- `useForm()` — Form state management

**`src/services/`** — Business logic
- `healthService.ts` — HealthKit/Health Connect
- `aiService.ts` — Claude API calls
- `metricsService.ts` — Analytics calculation
- `notificationService.ts` — Push notifications

**`src/store/`** — Global state (Zustand)
- `authStore.ts` — User auth state
- `fitnessStore.ts` — Fitness data
- `nutritionStore.ts` — Food logs
- `uiStore.ts` — UI state (theme, modals)

**`src/lib/`** — Utilities and clients
- `supabase.ts` — Supabase client initialization
- `apiClient.ts` — HTTP request utilities
- `analytics.ts` — Analytics tracking

**`src/types/`** — TypeScript definitions
- `user.ts` — User type definitions
- `activity.ts` — Activity/session types
- `nutrition.ts` — Nutrition types
- `api.ts` — API response types

**`src/theme/`** — Design system
- `colors.ts` — Color tokens and gradients
- `typography.ts` — Font definitions
- `spacing.ts` — Spacing scale

**`src/utils/`** — Helper functions
- `formatters.ts` — Date/time/number formatting
- `validators.ts` — Input validation
- `converters.ts` — Unit conversions
- `calculations.ts` — Health calculations

**`app/`** — Routes (Expo Router)
- File-based routing
- Dynamic segments with `[param]`
- Groups with `(group)`
- Modals with `+modal`

---

## Navigation Architecture

### Expo Router Structure

ZenFit uses **file-based routing** with Expo Router, similar to Next.js.

**Route Examples:**

| File | Route | Type |
|------|-------|------|
| `app/index.tsx` | `/` | Splash/Landing |
| `app/auth.tsx` | `/auth` | Authentication |
| `app/onboarding.tsx` | `/onboarding` | Onboarding |
| `app/(tabs)/_layout.tsx` | Tab layout | Wrapper |
| `app/(tabs)/index.tsx` | `/home` | Home tab |
| `app/(tabs)/yoga.tsx` | `/yoga` | Yoga tab |
| `app/(tabs)/breathe.tsx` | `/breathe` | Meditation tab |
| `app/(tabs)/nutrition.tsx` | `/nutrition` | Nutrition tab |
| `app/(tabs)/profile.tsx` | `/profile` | Profile tab |

### Navigation Stack

```
Root Layout (_layout.tsx)
├── Auth Stack (when not logged in)
│   ├── Splash (index.tsx)
│   ├── Authentication (auth.tsx)
│   └── Onboarding (onboarding.tsx)
└── App Stack (when logged in)
    └── Tabs (_layout.tsx)
        ├── Home (index.tsx)
        ├── Yoga (yoga.tsx)
        ├── Breathing (breathe.tsx)
        ├── Nutrition (nutrition.tsx)
        └── Profile (profile.tsx)
```

### Deep Linking

Deep links enable navigation from external sources (notifications, web links):

```typescript
// Enable navigation to specific session
exp://yoga/session/uuid-123

// Navigate to nutrition on app open
exp://nutrition

// Navigate to goal tracking
exp://profile/goals
```

**Configuration in `app.json`:**
```json
{
  "scheme": "zenfit",
  "plugins": [
    ["expo-router", {
      "origin": "https://zenfit.app"
    }]
  ]
}
```

---

## State Management

### Zustand Pattern

ZenFit uses **Zustand** for lightweight, scalable state management.

**Key Benefits:**
- Minimal boilerplate
- DevTools support
- Type-safe with TypeScript
- No provider wrapper needed
- Easy to test

### Store Structure

**Example: Authentication Store**

```typescript
import { create } from 'zustand';

type AuthState = {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      set({ session: result.data.session });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
```

### Using Stores in Components

```typescript
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  // Hook returns entire state and all actions
  const { user, loading, signOut } = useAuthStore();

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      <Button onPress={signOut} disabled={loading} />
    </View>
  );
}
```

### Store Composition

Stores can reference each other for complex workflows:

```typescript
// authStore calls fitnessStore
export const useAuthStore = create<AuthState>((set) => ({
  signUp: async (email, password) => {
    // Create user
    const user = await createUser(email, password);
    // Initialize fitness data
    const fitnessStore = useFitnessStore.getState();
    await fitnessStore.initialize(user.id);
  },
}));
```

### Real-Time Subscriptions

Zustand integrates with Supabase real-time:

```typescript
export const useUserSessions = create<SessionState>((set) => ({
  sessions: [],

  subscribe: (userId: string) => {
    const subscription = supabase
      .from('user_sessions')
      .on('*', (payload) => {
        set((state) => ({
          sessions: [...state.sessions, payload.new],
        }));
      })
      .subscribe();

    return () => subscription.unsubscribe();
  },
}));
```

---

## Database Design

### Entity Relationship Diagram

```
profiles
├── sessions (1:many)
├── user_sessions (1:many)
├── meals (1:many)
├── daily_metrics (1:many)
├── workout_sessions (1:many)
├── goals (1:many)
├── reminders (1:many)
├── achievements (1:many)
├── favorites (1:many)
└── subscriptions (1:1)

sessions
└── user_sessions (1:many)
```

### Core Tables

**profiles**
- Central user record
- Links to all other tables
- Subscription status
- Gamification (XP, level, streak)

**sessions**
- Yoga, meditation, and workout content
- Video metadata
- Difficulty levels
- Instructor information

**user_sessions**
- Activity log for each session
- Duration, calories, heart rate
- Performance metrics
- User progress tracking

**daily_metrics**
- Daily health snapshot
- Steps, calories, water, sleep
- Mood and stress tracking
- Trends over time

**meals**
- Food logging with date
- Macro tracking
- Food items (JSONB array)
- Nutritional analysis

**workout_sessions**
- Detailed workout data
- Heart rate zones
- Distance and pace
- Real-time metric collection

**goals**
- User-defined fitness goals
- Weight, steps, sessions, meditation
- Progress tracking
- Target and deadline

**achievements**
- Unlocked badges and milestones
- Achievement types
- Unlock timestamps
- User motivation

### Schema Features

**Indexes for Performance:**
```sql
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_daily_metrics_user_id ON daily_metrics(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
```

**Row-Level Security (RLS):**
```sql
-- Users can only see their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

**Triggers for Timestamps:**
```sql
-- Auto-update updated_at
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Authentication Flow

### Sign Up Flow

```
User Input
    ↓
Sign Up Form
    ↓
useAuthStore.signUpWithEmail()
    ↓
supabase.auth.signUp()
    ↓
Create User Record
    ↓
Create Profile Record
    ↓
Auto-login
    ↓
Navigate to Onboarding
```

### Sign In Flow

```
User Input
    ↓
Login Form
    ↓
useAuthStore.signInWithEmail()
    ↓
supabase.auth.signInWithPassword()
    ↓
Get Session
    ↓
Fetch Profile
    ↓
Update Zustand
    ↓
Navigate to Home
```

### Session Persistence

```typescript
// On app launch
useEffect(() => {
  useAuthStore.getState().initialize();
}, []);

// In authStore.initialize()
const { data: { session } } = await supabase.auth.getSession();
// Restore session from AsyncStorage
// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  // Update Zustand
  // Refresh profile
  // Handle sign in/out
});
```

### Security

- **JWT Tokens**: Short-lived access + long-lived refresh
- **AsyncStorage**: Encrypted session persistence
- **HTTPS Only**: All API calls
- **RLS Policies**: Server-side access control
- **Password Hashing**: bcrypt with 12 rounds

---

## Real-Time Features

### Supabase Real-Time Subscriptions

**Subscribe to User Sessions:**

```typescript
const subscription = supabase
  .from('user_sessions')
  .on('INSERT', (payload) => {
    // New session logged
    console.log('New activity:', payload.new);
  })
  .on('UPDATE', (payload) => {
    // Session updated
    console.log('Activity updated:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

**Subscribe to Daily Metrics:**

```typescript
supabase
  .from('daily_metrics')
  .on('*', (payload) => {
    set({ metrics: payload.new });
  })
  .subscribe();
```

### Broadcast Events

Real-time updates across multiple clients:

```typescript
// Client 1: Update goal
await supabase
  .from('goals')
  .update({ current_value: 8000 })
  .eq('id', goalId);

// Client 2: Receives update in real-time
supabase
  .from('goals')
  .on('UPDATE', (payload) => {
    // Update UI immediately
  })
  .subscribe();
```

---

## Wearable Integration

### Apple HealthKit (iOS)

**Integration Points:**
- Heart rate monitoring
- Step counting
- Calorie tracking
- Workout data
- Sleep monitoring

**Implementation:**

```typescript
import { useHealthData } from '@/hooks/useHealthData';

export default function FitnessScreen() {
  const { heartRate, steps, calories, loading } = useHealthData();

  return (
    <View>
      <Text>Heart Rate: {heartRate} BPM</Text>
      <Text>Steps: {steps}</Text>
      <Text>Calories: {calories}</Text>
    </View>
  );
}
```

### Google Health Connect (Android)

**Supported Data Types:**
- Heart rate
- Steps
- Distance
- Active energy
- Sleep time
- Blood pressure

**Permissions Needed:**
```xml
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />
<uses-permission android:name="android.permission.health.READ_STEPS" />
<uses-permission android:name="android.permission.health.READ_DISTANCE" />
```

### Sync Strategy

**Periodic Background Sync:**
```typescript
// Sync wearable data every 30 minutes
setInterval(async () => {
  const data = await getWearableData();
  await syncToSupabase(data);
}, 30 * 60 * 1000);
```

**On-Demand Sync:**
```typescript
// User pulls to refresh
onPullToRefresh={async () => {
  await useWearableStore.getState().sync();
}}
```

---

## AI Integration

### Claude API Integration

ZenFit uses Anthropic's Claude API for intelligent features:

**Nutrition Recommendations:**

```typescript
import Anthropic from '@anthropic-ai/sdk';

export async function getAIRecommendation(meals: Meal[]) {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const mealsText = meals
    .map((m) => `${m.name}: ${m.calories} cal`)
    .join(', ');

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Based on these meals today (${mealsText}),
                  provide 3 nutritional improvement suggestions
                  for better health. Keep it brief and actionable.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

**Meditation Guidance:**

```typescript
export async function generateMeditationGuide(
  duration: number,
  focus: 'sleep' | 'anxiety' | 'focus'
) {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `Write a ${duration}-minute guided ${focus} meditation script.
                  Include breathing techniques and visualization.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

### Caching for Performance

```typescript
const meditationCache = new Map<string, string>();

export async function getCachedMeditationGuide(key: string) {
  if (meditationCache.has(key)) {
    return meditationCache.get(key)!;
  }

  const guide = await generateMeditationGuide(...);
  meditationCache.set(key, guide);
  return guide;
}
```

---

## Design System

### Cosmic Dark Theme

**Color Philosophy:**
- Deep purples (#7C3AED) as primary
- Cosmic background (#0D0B1A)
- Glassmorphism for depth
- Aurora gradients for accents

### Glassmorphism Components

```typescript
// Frosted glass effect
const glassStyle = {
  backgroundColor: Colors.glassBackground,
  borderColor: Colors.glassBorder,
  borderWidth: 1,
  borderRadius: BorderRadius.lg,
};
```

### Spacing System

Consistent spacing across the app:

```typescript
// Margins and padding
<View style={{ padding: Spacing.md, gap: Spacing.sm }}>
  <Text>Spaced evenly</Text>
  <Text>With consistent gaps</Text>
</View>
```

### Typography

```typescript
<Text style={{ fontSize: FontSizes.xxxl, fontWeight: '700' }}>
  Display Heading
</Text>
<Text style={{ fontSize: FontSizes.lg }}>
  Body Text
</Text>
```

---

## Performance Optimizations

### Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={require('@/assets/yoga.jpg')}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  placeholder={blurhash}
/>
```

### Memoization

```typescript
import { memo } from 'react';

export const SessionCard = memo(({ session }: Props) => {
  return <View>{/* render session */}</View>;
});
```

### FlatList Optimization

```typescript
<FlatList
  data={sessions}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <SessionCard session={item} />}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
/>
```

---

## Testing Architecture

### Unit Tests

Test pure functions and utilities:

```typescript
// utils/__tests__/formatters.test.ts
describe('formatCalories', () => {
  test('formats 1500 as "1.5k"', () => {
    expect(formatCalories(1500)).toBe('1.5k');
  });
});
```

### Integration Tests

Test store + component interaction:

```typescript
describe('Profile Update', () => {
  test('updates profile in store and shows in UI', async () => {
    const { getByTestId } = render(<ProfileScreen />);
    await userEvent.type(getByTestId('height-input'), '180');
    await userEvent.press(getByTestId('save-button'));
    expect(getByTestId('height-display')).toHaveTextContent('180');
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
describe('Sign Up & Onboarding', () => {
  test('user can sign up and complete onboarding', async () => {
    // Navigate to auth
    // Fill form
    // Verify onboarding appears
    // Complete onboarding
    // Verify home screen
  });
});
```

---

## Deployment

### Environment Configurations

**Development**
- Local Supabase
- Test data
- Debug logging
- Hot reload enabled

**Staging**
- Staging Supabase project
- Real-like data
- Error tracking enabled
- Performance monitoring

**Production**
- Production Supabase
- Optimized bundle
- Error tracking
- Analytics

### EAS Build

```bash
# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

This architecture provides a scalable foundation for ZenFit's growth with clear separation of concerns, type safety, and real-time capabilities.

For implementation details, see [API.md](./API.md).
