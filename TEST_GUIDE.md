# ZenFit E2E Testing Guide

This document provides comprehensive instructions for running and understanding the test suite for the ZenFit React Native Expo app.

## Test Setup Overview

The ZenFit app uses a layered testing approach:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how components work together
3. **E2E Tests** - Test complete user flows using Detox

## Installation & Setup

### Prerequisites

```bash
# Install dependencies
npm install

# For Detox E2E testing
npm install --save-dev detox-cli detox
```

### Setup Files Created

- `jest.config.js` - Jest configuration with Expo preset
- `jest.setup.js` - Mock setup for all Expo and native modules
- `.detoxrc.js` - Detox configuration for iOS and Android
- `e2e/jest.config.js` - Detox-specific Jest configuration
- Test files in `__tests__/` directory

## Running Tests

### Jest Unit/Integration Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run specific test file:
```bash
npm test -- SplashScreen.test.tsx
```

Run with coverage:
```bash
npm test -- --coverage
```

Run tests for specific directories:
```bash
# Screens only
npm test -- __tests__/screens

# Store only
npm test -- __tests__/store

# E2E flow tests
npm test -- __tests__/e2e
```

### Detox E2E Tests

Build the app for testing (first time only):
```bash
# iOS
detox build-framework-cache
detox build-app -c ios.sim.debug

# Android
detox build-app -c android.emu.debug
```

Run E2E tests:
```bash
# iOS Simulator
detox test e2e/starter.test.js -c ios.sim.debug

# Android Emulator
detox test e2e/starter.test.js -c android.emu.debug
```

Run specific test:
```bash
detox test e2e/starter.test.js -c ios.sim.debug --testNamePattern="App Launch"
```

## Test Structure

### 1. Splash Screen Tests (`__tests__/screens/SplashScreen.test.tsx`)

Tests the initial app launch and navigation logic.

**Key Tests:**
- Title and subtitle rendering
- Auto-navigation after 2.5 seconds
- Navigation based on authentication state
- Animation setup

**Coverage:**
- New users → navigate to onboarding
- Authenticated users → navigate to home
- Animations render correctly

### 2. Onboarding Tests (`__tests__/screens/OnboardingScreen.test.tsx`)

Tests the multi-page onboarding flow.

**Key Tests:**
- All 3 onboarding pages render
- Next button advances pages
- Skip button navigates to auth
- Dot indicators show active page
- Last page button text changes to "Get Started"

**Coverage:**
- Page navigation (horizontal scroll)
- Button interactions
- Visual indicators

### 3. Auth Screen Tests (`__tests__/screens/AuthScreen.test.tsx`)

Tests sign in and sign up flows with validation.

**Key Tests:**
- Form toggles between sign in/sign up
- Email validation
- Password length validation
- Full name field only in sign up mode
- Sign in/up calls appropriate functions
- Navigation on success
- Error display

**Coverage:**
- Form validation (email, password, full name)
- Submission and navigation
- Error handling
- Loading states

### 4. Home Screen Tests (`__tests__/screens/HomeScreen.test.tsx`)

Tests the main home dashboard.

**Key Tests:**
- User greeting with name
- Daily stats (steps, water, calories)
- Heart rate widget
- Quick action buttons
- Streak counter
- User profile data loading

**Coverage:**
- Data display
- Stat rendering
- Empty states

### 5. Breathe Screen Tests (`__tests__/screens/BreatheScreen.test.tsx`)

Tests the breathing exercise feature.

**Key Tests:**
- Breathing circle animation
- Timer controls (start, pause, resume, reset)
- Phase text (Inhale, Hold, Exhale)
- Cycle counter increments
- Visual feedback during exercises

**Coverage:**
- Timer management
- Animation states
- User controls

### 6. Nutrition Screen Tests (`__tests__/screens/NutritionScreen.test.tsx`)

Tests nutrition tracking features.

**Key Tests:**
- Macro rings visualization
- Water tracker with add button
- Meal sections (breakfast, lunch, dinner, snacks)
- AI recommendation section
- Daily calorie summary
- Goal tracking

**Coverage:**
- Data visualization
- User interactions (add water, meals)
- Nutrition goals

### 7. Profile Screen Tests (`__tests__/screens/ProfileScreen.test.tsx`)

Tests user profile and account features.

**Key Tests:**
- User info display (name, email, avatar)
- Stats display (level, XP, streak)
- Menu navigation
- Sign out functionality
- Subscription status
- Profile data updates

**Coverage:**
- Data display
- Navigation
- Auth sign out

### 8. Auth Store Tests (`__tests__/store/authStore.test.ts`)

Tests the Zustand auth state management.

**Key Tests:**
- Initial state
- signInWithEmail flow
- signUpWithEmail flow
- signOut clears state
- fetchProfile populates user data
- updateProfile saves changes
- initialize sets up auth listener
- Session persistence

**Coverage:**
- State management
- API interactions (mocked Supabase)
- Auth flow completeness

### 9. E2E Flow Tests (`__tests__/e2e/app-flow.test.tsx`)

Tests complete user journeys end-to-end.

**Key Tests:**
- New user: Splash → Onboarding → Auth → Sign Up → Home
- Returning user: Splash → Home (skips onboarding)
- Sign in flow
- Sign up flow
- Error recovery
- Navigation between screens

**Coverage:**
- Full app flows
- Error scenarios
- Multiple auth paths

## Mocking Strategy

### Jest Mocks (jest.setup.js)

All Expo modules are mocked to avoid native dependencies:

- `expo-linear-gradient` - LinearGradient component
- `expo-blur` - BlurView component
- `expo-haptics` - Haptic feedback
- `expo-notifications` - Push notifications
- `expo-font` - Font loading
- `expo-image` - Image component
- `expo-av` - Audio/Video
- `expo-sensors` - Device sensors
- `expo-location` - GPS/Location
- `expo-router` - Navigation
- `@react-native-async-storage/async-storage` - Local storage
- Supabase client

### Supabase Mock

The Supabase client is mocked to return test data:

```javascript
// Mock auth
supabase.auth.signInWithPassword() → returns test session
supabase.auth.signUp() → returns test session
supabase.auth.getSession() → returns null/session
supabase.auth.onAuthStateChange() → sets up listener

// Mock database
supabase.from('profiles').select() → returns test profile
supabase.from('profiles').update() → returns updated profile
```

## Test Best Practices

### Writing Tests

1. **Use descriptive test names:**
   ```typescript
   it('should navigate to tabs when authenticated', async () => {
     // Test implementation
   });
   ```

2. **Use beforeEach/afterEach for setup:**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
     mockRouter = { replace: jest.fn() };
   });
   ```

3. **Test user-facing behavior:**
   ```typescript
   // Good: Test what user sees
   fireEvent.press(submitButton);
   expect(screen.getByText('Error message')).toBeTruthy();

   // Bad: Test implementation details
   expect(mockFunction).toHaveBeenCalledWithObjectContaining({...});
   ```

4. **Use waitFor for async operations:**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeTruthy();
   });
   ```

### Common Test Patterns

**Testing Navigation:**
```typescript
fireEvent.press(screen.getByText('Next'));
await waitFor(() => {
  expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
});
```

**Testing Form Submission:**
```typescript
const emailInput = screen.getByPlaceholderText('Email Address');
fireEvent.changeText(emailInput, 'test@example.com');
fireEvent.press(screen.getByText('Submit'));
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalledWith('test@example.com');
});
```

**Testing Loading States:**
```typescript
fireEvent.press(submitButton);
expect(submitButton.props.disabled).toBe(true);
await waitFor(() => {
  expect(submitButton.props.disabled).toBe(false);
});
```

## Test Coverage Goals

Target coverage metrics:

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Run coverage report:
```bash
npm test -- --coverage --coverageReporters=text-summary
```

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug Single Test

```bash
npm test -- --testNamePattern="specific test name" --verbose
```

### View Component Tree

Use `screen.debug()` in tests:
```typescript
render(<MyComponent />);
screen.debug(); // Prints component tree
```

### Check Console Output

Tests capture console output. Check for warnings:
```bash
npm test -- --verbose 2>&1 | grep -i "warning\|error"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run detox:test
```

## Performance Testing

### Test Execution Time

```bash
npm test -- --verbose --bail 2>&1 | tail -20
```

### Slow Test Optimization

```bash
# Find slow tests
npm test -- --testTimeout=10000 --detectOpenHandles

# Run only fast tests
npm test -- --bail
```

## Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
- Clear jest cache: `npm test -- --clearCache`
- Reinstall: `rm -rf node_modules && npm install`

**2. Timeout errors**
- Increase timeout: `jest.setTimeout(10000)`
- Check async operations in test

**3. Mock not working**
- Ensure mock is before component render
- Check mock file path is correct
- Verify jest.mock() is at top of file

**4. Detox can't find app**
- Build app first: `detox build-app -c ios.sim.debug`
- Check simulator is running: `xcrun simctl list devices`

**5. E2E test hangs**
- Detox timeout: Increase in `.detoxrc.js`
- Check device state
- Try reloading: `detox test ... --cleanup`

## Running All Tests

Complete test suite:
```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage

# E2E tests (requires simulator/emulator)
detox build-app -c ios.sim.debug
detox test e2e/starter.test.js -c ios.sim.debug

# Both
npm test && detox test e2e/starter.test.js -c ios.sim.debug
```

## Test Maintenance

### Regular Tasks

1. **Update snapshots when intentional UI changes occur:**
   ```bash
   npm test -- -u
   ```

2. **Keep mocks synchronized with actual APIs**
   - Review mock in jest.setup.js when dependencies update

3. **Add tests for new features:**
   - Create test file in `__tests__/` matching feature
   - Follow existing patterns in similar tests

4. **Remove obsolete tests:**
   - Clean up tests for removed features
   - Update snapshots

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox E2E Testing](https://wix.github.io/Detox/)
- [Expo Router Documentation](https://docs.expo.dev/routing/introduction/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Test File Locations

```
zenfit/
├── __tests__/
│   ├── screens/
│   │   ├── SplashScreen.test.tsx
│   │   ├── OnboardingScreen.test.tsx
│   │   ├── AuthScreen.test.tsx
│   │   ├── HomeScreen.test.tsx
│   │   ├── BreatheScreen.test.tsx
│   │   ├── NutritionScreen.test.tsx
│   │   └── ProfileScreen.test.tsx
│   ├── store/
│   │   └── authStore.test.ts
│   └── e2e/
│       └── app-flow.test.tsx
├── e2e/
│   ├── jest.config.js
│   └── starter.test.js
├── jest.config.js
├── jest.setup.js
└── .detoxrc.js
```

## Support

For issues or questions:
1. Check test output for specific errors
2. Review similar passing tests
3. Check mock setup in jest.setup.js
4. Refer to framework documentation
