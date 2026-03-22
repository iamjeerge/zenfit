# ZenFit API & Code Documentation

ZenFit is a React Native Expo app for yoga, meditation, and fitness tracking with a cosmic dark theme. This document provides comprehensive API documentation for all modules and services.

## Table of Contents

- [Design System](#design-system)
- [Core Services](#core-services)
- [State Management](#state-management)
- [Screens & Navigation](#screens--navigation)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)

---

## Design System

### Theme Module (`src/theme/colors.ts`)

The design system provides a complete cosmic dark theme with color tokens, gradients, spacing, and typography.

#### Color Tokens

**Backgrounds**
- `background: '#0D0B1A'` — Primary dark background
- `backgroundLight: '#151326'` — Secondary lighter background
- `card: '#1A1730'` — Card and container background
- `cardHover: '#221F3A'` — Hover state for interactive cards

**Primary Palette**
- `violet: '#7C3AED'` — Main brand color
- `violetLight: '#A78BFA'` — Light violet accent
- `lavender: '#C4B5FD'` — Soft lavender
- `rosePetal: '#F472B6'` — Rose/pink accent
- `rosePetalLight: '#FBCFE8'` — Light rose

**Accent Colors**
- `sacredGold: '#FBBF24'` — Gold highlight
- `sageLeaf: '#34D399'` — Green accent
- `moonlight: '#F1F5F9'` — Light gray
- `cosmicBlue: '#60A5FA'` — Blue accent
- `sunriseOrange: '#FB923C'` — Orange accent

**Text Colors**
- `textPrimary: '#F8FAFC'` — Main text
- `textSecondary: '#94A3B8'` — Secondary text
- `textMuted: '#64748B'` — Muted text
- `textAccent: '#C4B5FD'` — Accent text

**Status Colors**
- `success: '#34D399'` — Success state
- `warning: '#FBBF24'` — Warning state
- `error: '#F87171'` — Error state
- `info: '#60A5FA'` — Info state

**Heart Rate Zones**
- `heartRest: '#34D399'` — Rest zone
- `heartFatBurn: '#60A5FA'` — Fat burn zone
- `heartCardio: '#FBBF24'` — Cardio zone
- `heartPeak: '#F87171'` — Peak zone
- `heartExtreme: '#EF4444'` — Extreme zone

**Glassmorphism**
- `glassBorder: 'rgba(196, 181, 253, 0.2)'` — Glass border
- `glassBackground: 'rgba(26, 23, 48, 0.6)'` — Glass background
- `glassBackgroundLight: 'rgba(26, 23, 48, 0.4)'` — Light glass background

**Overlays**
- `overlay: 'rgba(13, 11, 26, 0.7)'` — Dark overlay
- `overlayLight: 'rgba(13, 11, 26, 0.4)'` — Light overlay

#### Gradients

**Aurora Gradients**
```typescript
aurora: ['#7C3AED', '#C4B5FD', '#F472B6']        // Main aurora gradient
auroraSubtle: ['#7C3AED', '#A78BFA']             // Subtle aurora
cosmic: ['#0D0B1A', '#1A1730', '#2D2554']        // Cosmic background
sunrise: ['#F472B6', '#FBBF24', '#FB923C']       // Sunrise gradient
ocean: ['#60A5FA', '#7C3AED']                    // Ocean gradient
forest: ['#34D399', '#059669']                   // Forest gradient
lotus: ['#F472B6', '#C4B5FD', '#7C3AED']         // Lotus gradient
```

**Card Gradients**
```typescript
cardPrimary: ['rgba(124, 58, 237, 0.3)', 'rgba(244, 114, 182, 0.1)']
cardSecondary: ['rgba(196, 181, 253, 0.1)', 'rgba(124, 58, 237, 0.05)']
cardGold: ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']
```

**Tab Bar**
```typescript
tabGlow: ['rgba(124, 58, 237, 0.8)', 'rgba(124, 58, 237, 0)']
```

#### Shadows

**Glow Shadow**
```typescript
shadowColor: '#7C3AED'
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 0.5
shadowRadius: 20
elevation: 10
```

**Card Shadow**
```typescript
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.3
shadowRadius: 12
elevation: 8
```

**Subtle Shadow**
```typescript
shadowColor: '#7C3AED'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.15
shadowRadius: 8
elevation: 4
```

#### Spacing Scale

```typescript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

#### Border Radius

```typescript
sm: 8px
md: 12px
lg: 16px
xl: 24px
full: 9999px (fully rounded)
```

#### Font Sizes

```typescript
xs: 10px
sm: 12px
md: 14px
lg: 16px
xl: 20px
xxl: 24px
xxxl: 32px
display: 40px
```

---

## Core Services

### Supabase Client (`src/lib/supabase.ts`)

Initialize Supabase client for database and authentication.

```typescript
import { supabase } from '@/lib/supabase';
```

**Configuration**

- `SUPABASE_URL`: `process.env.EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`: `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Features**
- AsyncStorage persistence
- Auto token refresh
- Session persistence
- Session detection from URL

**Usage**

```typescript
// Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Database queries
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

---

## State Management

### Auth Store (`src/store/authStore.ts`)

Zustand store for authentication state and user profile management.

```typescript
import { useAuthStore } from '@/store/authStore';
```

**State Properties**

```typescript
session: Session | null          // Current user session
user: User | null                // Current user object
profile: Profile | null          // User profile with metadata
loading: boolean                 // Loading state for async operations
initialized: boolean             // Whether store has initialized
```

**Profile Type**

```typescript
type Profile = {
  id: string                     // User ID (PK)
  full_name: string | null       // Full name
  avatar_url: string | null      // Profile picture URL
  gender: 'male' | 'female' | 'other' | null
  date_of_birth: string | null   // ISO date
  height_cm: number | null       // Height in centimeters
  weight_kg: number | null       // Weight in kilograms
  fitness_goal: string | null    // User's fitness goal
  subscription_status: 'free' | 'premium'
  streak_days: number            // Consecutive activity days
  xp: number                     // Experience points
  level: number                  // User level
  created_at: string             // ISO timestamp
}
```

**Actions**

**`setSession(session: Session | null)`**
Set current session and user.

```typescript
const { setSession } = useAuthStore();
setSession(newSession);
```

**`fetchProfile(): Promise<void>`**
Fetch user profile from database.

```typescript
const { fetchProfile } = useAuthStore();
await fetchProfile();
```

**`updateProfile(updates: Partial<Profile>): Promise<void>`**
Update user profile in database.

```typescript
const { updateProfile } = useAuthStore();
await updateProfile({ height_cm: 180, weight_kg: 75 });
```

**`signInWithEmail(email: string, password: string): Promise<void>`**
Sign in with email and password.

```typescript
const { signInWithEmail } = useAuthStore();
try {
  await signInWithEmail('user@example.com', 'password123');
} catch (error) {
  console.error('Sign in failed:', error);
}
```

**`signUpWithEmail(email: string, password: string, fullName: string): Promise<void>`**
Create new account with email.

```typescript
const { signUpWithEmail } = useAuthStore();
await signUpWithEmail('user@example.com', 'password123', 'John Doe');
```

**`signOut(): Promise<void>`**
Sign out current user.

```typescript
const { signOut } = useAuthStore();
await signOut();
```

**`initialize(): Promise<void>`**
Initialize auth state on app startup. Sets up session listeners.

```typescript
const { initialize } = useAuthStore();
useEffect(() => {
  initialize();
}, [initialize]);
```

**Usage Example**

```typescript
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { profile, updateProfile, loading } = useAuthStore();

  const handleUpdateHeight = async (height: number) => {
    try {
      await updateProfile({ height_cm: height });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <View>
      {profile && (
        <>
          <Text>Name: {profile.full_name}</Text>
          <Text>Height: {profile.height_cm}cm</Text>
        </>
      )}
    </View>
  );
}
```

---

## Screens & Navigation

### File-Based Routing (Expo Router)

ZenFit uses Expo Router for file-based routing:

- `app/index.tsx` — Splash/landing screen
- `app/auth.tsx` — Authentication screen
- `app/onboarding.tsx` — Onboarding flow
- `app/(tabs)/_layout.tsx` — Tab navigation layout
- `app/(tabs)/index.tsx` — Home/Dashboard screen
- `app/(tabs)/yoga.tsx` — Yoga screen
- `app/(tabs)/breathe.tsx` — Breathing/Meditation screen
- `app/(tabs)/nutrition.tsx` — Nutrition screen
- `app/(tabs)/profile.tsx` — User profile screen

### Screen Descriptions

**Home Screen** (`app/(tabs)/index.tsx`)
- Dashboard with daily overview
- Quick access to activities
- Streak and XP display
- Recent activities

**Yoga Screen** (`app/(tabs)/yoga.tsx`)
- Yoga session library
- Difficulty levels
- Duration filters
- Video playback

**Breathing Screen** (`app/(tabs)/breathe.tsx`)
- Guided breathing exercises
- Meditation sessions
- Customizable duration
- Progress tracking

**Nutrition Screen** (`app/(tabs)/nutrition.tsx`)
- Food logging
- Meal tracking
- Nutritional insights
- AI-powered recommendations

**Profile Screen** (`app/(tabs)/profile.tsx`)
- User profile management
- Settings
- Statistics
- Preferences

---

## Database Schema

ZenFit uses PostgreSQL via Supabase with 14 core tables:

### Core Tables

**1. profiles**
```sql
- id (UUID, PK) — User ID
- full_name (TEXT)
- avatar_url (TEXT)
- gender (ENUM: male, female, other)
- date_of_birth (DATE)
- height_cm (INTEGER)
- weight_kg (DECIMAL)
- fitness_goal (TEXT)
- subscription_status (ENUM: free, premium)
- streak_days (INTEGER, default: 0)
- xp (INTEGER, default: 0)
- level (INTEGER, default: 1)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**2. sessions** (Yoga/Meditation)
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- type (ENUM: yoga, meditation, breathwork)
- title (TEXT)
- description (TEXT)
- duration_minutes (INTEGER)
- difficulty (ENUM: beginner, intermediate, advanced)
- video_url (TEXT)
- thumbnail_url (TEXT)
- instructor_name (TEXT)
- category (TEXT)
- created_at (TIMESTAMP)
```

**3. user_sessions** (Activity Log)
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- session_id (UUID, FK -> sessions)
- completed_at (TIMESTAMP)
- duration_seconds (INTEGER)
- heart_rate_avg (INTEGER)
- calories_burned (INTEGER)
- notes (TEXT)
```

**4. meals**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- date (DATE)
- meal_type (ENUM: breakfast, lunch, dinner, snack)
- food_items (JSONB)
- total_calories (INTEGER)
- protein_g (DECIMAL)
- carbs_g (DECIMAL)
- fat_g (DECIMAL)
- created_at (TIMESTAMP)
```

**5. daily_metrics**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- date (DATE)
- steps (INTEGER)
- calories_burned (INTEGER)
- water_intake_ml (INTEGER)
- sleep_hours (DECIMAL)
- stress_level (INTEGER, 1-10)
- mood (ENUM: poor, fair, good, excellent)
- created_at (TIMESTAMP)
```

**6. workout_sessions**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- session_id (UUID, FK -> sessions)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- heart_rate_max (INTEGER)
- heart_rate_min (INTEGER)
- heart_rate_avg (INTEGER)
- calories_burned (INTEGER)
- distance_m (DECIMAL)
- notes (TEXT)
```

**7. goals**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- type (ENUM: weight, steps, sessions, meditation)
- target_value (DECIMAL)
- current_value (DECIMAL)
- unit (TEXT)
- start_date (DATE)
- end_date (DATE)
- status (ENUM: active, completed, abandoned)
```

**8. reminders**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- type (ENUM: yoga, meditation, meal, water, sleep)
- time (TIME)
- enabled (BOOLEAN)
- frequency (ENUM: daily, weekly, custom)
- message (TEXT)
```

**9. achievements**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- achievement_type (TEXT)
- title (TEXT)
- description (TEXT)
- icon_url (TEXT)
- unlocked_at (TIMESTAMP)
```

**10. wearable_sync**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- device_type (ENUM: apple_watch, fitbit, garmin)
- last_sync (TIMESTAMP)
- is_connected (BOOLEAN)
```

**11. subscriptions**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- plan (ENUM: free, premium)
- start_date (DATE)
- renewal_date (DATE)
- is_active (BOOLEAN)
- payment_method (TEXT)
```

**12. activity_log**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- action (TEXT)
- timestamp (TIMESTAMP)
- details (JSONB)
```

**13. favorites**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- session_id (UUID, FK -> sessions)
- created_at (TIMESTAMP)
```

**14. notifications**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> profiles)
- title (TEXT)
- message (TEXT)
- type (ENUM: reminder, achievement, tip, promotion)
- read_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## API Endpoints

### Authentication (Supabase Auth)

**Sign Up**
```typescript
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Sign In**
```typescript
POST /auth/v1/token?grant_type=password
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Sign Out**
```typescript
POST /auth/v1/logout
```

### Profiles

**Get Profile**
```typescript
GET /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer {token}
```

**Update Profile**
```typescript
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "John Doe",
  "height_cm": 180,
  "weight_kg": 75
}
```

### Sessions

**Get All Sessions**
```typescript
GET /rest/v1/sessions
Authorization: Bearer {token}
```

**Filter by Type**
```typescript
GET /rest/v1/sessions?type=eq.yoga
Authorization: Bearer {token}
```

**Get Session Details**
```typescript
GET /rest/v1/sessions?id=eq.{session_id}
Authorization: Bearer {token}
```

### User Sessions (Activity Log)

**Log a Session**
```typescript
POST /rest/v1/user_sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "session_id": "uuid",
  "completed_at": "2026-03-23T10:30:00Z",
  "duration_seconds": 1800,
  "calories_burned": 150
}
```

**Get User Sessions**
```typescript
GET /rest/v1/user_sessions?user_id=eq.{user_id}
Authorization: Bearer {token}
```

### Meals

**Log Meal**
```typescript
POST /rest/v1/meals
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2026-03-23",
  "meal_type": "breakfast",
  "food_items": [],
  "total_calories": 500
}
```

**Get Daily Meals**
```typescript
GET /rest/v1/meals?date=eq.{date}&user_id=eq.{user_id}
Authorization: Bearer {token}
```

### Daily Metrics

**Update Daily Metrics**
```typescript
PATCH /rest/v1/daily_metrics
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2026-03-23",
  "steps": 10000,
  "water_intake_ml": 2000,
  "mood": "good"
}
```

### Goals

**Create Goal**
```typescript
POST /rest/v1/goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "weight",
  "target_value": 70,
  "unit": "kg",
  "end_date": "2026-06-23"
}
```

**Get User Goals**
```typescript
GET /rest/v1/goals?user_id=eq.{user_id}
Authorization: Bearer {token}
```

---

## Usage Examples

### Complete Sign Up Flow

```typescript
import { useAuthStore } from '@/store/authStore';

export default function SignUpScreen() {
  const { signUpWithEmail, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignUp = async () => {
    try {
      await signUpWithEmail(email, password, fullName);
      // User created, trigger onboarding
    } catch (error) {
      console.error('Sign up failed:', error.message);
    }
  };

  return (
    // Form UI
  );
}
```

### Log a Yoga Session

```typescript
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export async function logYogaSession(
  sessionId: string,
  durationSeconds: number,
  caloriesBurned: number
) {
  const { user } = useAuthStore.getState();

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: user?.id,
      session_id: sessionId,
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      calories_burned: caloriesBurned,
    });

  if (error) throw error;
  return data;
}
```

### Fetch User Dashboard Data

```typescript
import { supabase } from '@/lib/supabase';

export async function getDashboardData(userId: string) {
  const [profile, todayMetrics, recentSessions] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single(),
    supabase
      .from('user_sessions')
      .select('*, sessions(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5),
  ]);

  return {
    profile: profile.data,
    metrics: todayMetrics.data,
    sessions: recentSessions.data,
  };
}
```

---

For more information, see the main [README.md](../README.md) and [SETUP.md](./SETUP.md).
