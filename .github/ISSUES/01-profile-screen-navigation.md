# Issue #1 — Wire up Profile Screen Navigation

**Type:** Enhancement  
**Labels:** `enhancement`, `navigation`  
**Priority:** High

## Summary

All `onPress` handlers in the Profile screen menu are currently empty no-ops (`() => {}`). Tapping any menu item — **Reminders**, **Subscription**, **Beauty Tips**, **Progress**, **Achievements**, **Workout Tracker**, **Sleep Tracker**, **Mood Journal**, **Settings** — does nothing.

## Motivation

The Profile screen is the central hub for accessing all secondary features of ZenFit. Without working navigation, users can discover features exist from the menu but are unable to reach them, severely degrading the user experience.

## Proposed Solution

Use `expo-router` to push the corresponding screen onto the navigation stack for each menu item:

| Menu Item | Target Screen |
|-----------|---------------|
| Reminders | `RemindersScreen` |
| Subscription | `SubscriptionScreen` |
| Beauty Tips | `BeautyTipsScreen` |
| Progress | `ProgressScreen` |
| Achievements | `ProgressScreen` (badges section) |
| Workout Tracker | `WorkoutScreen` |
| Sleep Tracker | `SleepScreen` |
| Mood Journal | `MoodScreen` |
| Settings | `SettingsScreen` (to be created) |

Each screen should be registered as a route under `app/(tabs)/profile/` or as a modal (`app/modal/`).

## Acceptance Criteria

- [ ] All Profile menu items navigate to their corresponding screen when tapped
- [ ] Back navigation (hardware back / swipe back) returns to Profile
- [ ] Expo Router routes are registered and accessible
- [ ] Existing Profile screen tests are updated to assert `router.push` is called with correct paths
- [ ] No broken navigation on iOS, Android, and Web

## Additional Context

Related screens already exist in `src/screens/`:
- `WorkoutScreen.tsx`, `SleepScreen.tsx`, `MoodScreen.tsx` (added in PR: Workout Tracker, Sleep Tracker, Mood Journal)
- `RemindersScreen.tsx`, `SubscriptionScreen.tsx`, `BeautyTipsScreen.tsx`, `ProgressScreen.tsx`, `StepsScreen.tsx`, `VideosScreen.tsx`
