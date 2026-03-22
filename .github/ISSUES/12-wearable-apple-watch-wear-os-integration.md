# Issue #12 — Deeper Apple Watch & Wear OS Integration

**Type:** Enhancement  
**Labels:** `enhancement`, `wearables`, `health`  
**Priority:** Medium

## Summary

Extend wearable integration beyond the current step-count placeholder to continuously sync heart rate, active calories, workout auto-detection, and sleep data from Apple Watch (HealthKit) and Wear OS / Samsung watches (Health Connect).

## Motivation

Wearable data dramatically increases the value of ZenFit by eliminating manual data entry for the most health-critical metrics. Users expect their fitness app to "just know" how they slept and how many calories they burned.

## Proposed Solution

### iOS — HealthKit

Use `react-native-health` (or the Expo equivalent) to read:

| Data Type | HKQuantityTypeIdentifier |
|-----------|--------------------------|
| Steps | `stepCount` |
| Heart Rate | `heartRate` |
| Active Energy | `activeEnergyBurned` |
| Sleep Analysis | `sleepAnalysis` |
| Resting HR | `restingHeartRate` |
| VO₂ Max | `vo2Max` |
| Workouts | `workoutType` (auto-detected) |

### Android — Health Connect

Use `react-native-health-connect` to read equivalent metrics from Google's Health Connect API.

### Sync Behaviour

1. On app foreground, request any new readings since the last sync.
2. Write synced data to the corresponding Supabase tables (`daily_steps`, `heart_rate_logs`, `sleep_logs`, `workout_sessions`).
3. Mark synced records with `source: 'apple_watch' | 'wear_os'` to distinguish from manual entries.
4. Show a "Last synced: X minutes ago" indicator in the HomeScreen.

### Permissions

- Request HealthKit / Health Connect permissions during or after onboarding.
- Clearly explain which data types are read and why.
- Allow users to revoke individual data types in Settings.

## Acceptance Criteria

- [ ] HealthKit permission request on iOS after onboarding
- [ ] Health Connect permission request on Android after onboarding
- [ ] Steps auto-populated in `daily_steps` from wearable on app open
- [ ] Heart rate synced to `heart_rate_logs`
- [ ] Sleep data auto-fills `SleepScreen` if available
- [ ] Auto-detected workouts appear in `WorkoutScreen` history
- [ ] Source field distinguishes wearable vs manual entries
- [ ] "Last synced" timestamp shown on HomeScreen
- [ ] Works gracefully when no wearable is paired

## Additional Context

- `expo-sensors` is already a dependency but has limited health data access
- `heart_rate_logs` table already has a `source` column with `apple_watch | android_watch | manual` values
