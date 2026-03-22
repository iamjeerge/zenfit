# Issue #11 — Deep Push Notification Reminders

**Type:** Enhancement  
**Labels:** `enhancement`, `notifications`  
**Priority:** Medium

## Summary

Upgrade the existing `RemindersScreen` from a settings UI stub to a fully functional notification system that fires scheduled local push notifications and deep-links directly into the relevant screen when tapped.

## Motivation

Reminders are a proven driver of healthy habit formation. The reminders screen and database table exist, but no notifications are actually scheduled or fired. Completing this feature delivers one of the most impactful engagement mechanics in the app.

## Proposed Solution

### Scheduling

- Use `expo-notifications` (already a dependency) to schedule local notifications for each enabled reminder.
- On save/toggle, call `Notifications.scheduleNotificationAsync` with a `CalendarTrigger` (weekday + time).
- Cancel and re-schedule when a reminder is edited or disabled.
- Persist the `expo-notifications` identifier in the `reminders` table for cancellation.

### Notification Content

| Reminder Type | Title | Body |
|---------------|-------|------|
| Water | 💧 Hydration Time | You've had X glasses today. Goal: 10! |
| Workout | 🏋️ Workout Time | Time for your scheduled workout! |
| Sleep | 🌙 Bedtime Soon | Wind down — your sleep goal is 8 hours. |
| Meal | 🍽️ Meal Reminder | Log your {meal_type} to hit your macros. |
| Mood | 😊 How are you feeling? | Take 10 seconds to log today's mood. |
| Meditation | 🧘 Mindfulness Break | Your {duration}-min meditation is ready. |

### Deep Linking

- Tap a water reminder → opens `NutritionScreen` water section.
- Tap a workout reminder → opens `WorkoutScreen`.
- Tap a mood reminder → opens `MoodScreen` log modal.
- Tap a sleep reminder → opens `SleepScreen` log modal.

### Permissions

- Request notification permission on first launch (after onboarding).
- Gracefully handle denied permissions with an in-app prompt to open Settings.

## Acceptance Criteria

- [ ] Enabling a reminder in `RemindersScreen` schedules a local notification
- [ ] Disabling a reminder cancels the scheduled notification
- [ ] Notifications fire at the configured time on configured days
- [ ] Tapping a notification deep-links to the correct screen
- [ ] Notification permission is requested after onboarding
- [ ] Expo notification identifiers stored in Supabase for cancellation on re-login
- [ ] Unit tests for scheduling and cancellation logic

## Additional Context

- `expo-notifications` is already listed in `package.json`
- `RemindersScreen.tsx` exists in `src/screens/` — extend it rather than rewrite
- `reminders` table in `supabase/schema.sql` has `type`, `time`, `enabled`, `days_of_week` columns
