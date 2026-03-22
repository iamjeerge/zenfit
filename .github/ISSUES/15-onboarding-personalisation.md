# Issue #15 — Onboarding Personalisation Improvements

**Type:** Enhancement  
**Labels:** `enhancement`, `onboarding`, `UX`  
**Priority:** Medium

## Summary

The current onboarding flow is 3 static screens. Extend it to capture richer user preferences (fitness goals, activity level, dietary preferences, preferred workout time, sleep schedule) and use them to personalise the app experience from day one.

## Motivation

Personalisation at onboarding dramatically increases user activation. When the app "knows you" from the start — suggesting the right calorie target, displaying the right yoga level, and scheduling reminders at sensible times — users are far more likely to engage daily.

## Proposed Solution

### Extended Onboarding Steps (7 steps)

| Step | Purpose | Data Collected |
|------|---------|----------------|
| 1 | Welcome & intro | — |
| 2 | Personal info | name, date_of_birth, gender |
| 3 | Body metrics | height_cm, weight_kg |
| 4 | Fitness goal | fitness_goal (lose_weight / build_muscle / stay_fit / flexibility / meditation) |
| 5 | Activity level | sedentary / lightly_active / moderately_active / very_active |
| 6 | Workout preferences | preferred days/time, workout types (yoga / strength / cardio / HIIT) |
| 7 | Sleep & reminders | bedtime, wake time, enable reminders? |

### Profile Pre-Population

On completion, save all collected data to `profiles` and schedule reminders if the user opted in.

### Skip Functionality

Maintain a "Skip" button on each step. Skipped fields are collected later via Profile screen prompts.

### Progress Indicator

Replace the current dot indicator with a labelled step counter ("Step 2 of 7") and a progress bar.

### Personalisation Results

| Data Point | Used For |
|-----------|---------|
| fitness_goal | AI workout recommendations, calorie target |
| activity_level | TDEE calculation in Nutrition screen |
| preferred_workout_time | Default reminder time |
| sleep schedule | Pre-fill SleepScreen bedtime/wake defaults |
| workout_types | Filter yoga/video library recommendations |

## Acceptance Criteria

- [ ] Onboarding extended to 7 steps with progress bar
- [ ] All 7 data points collected and saved to `profiles` on completion
- [ ] Reminders scheduled if user opts in at step 7
- [ ] Skip button skips only the current step (not the entire flow)
- [ ] Returning users bypass onboarding (existing `hasSeenOnboarding` check)
- [ ] Back navigation between steps
- [ ] Unit tests for each step component
- [ ] Collected data immediately reflected in relevant screens (Nutrition calorie goal, etc.)

## Additional Context

- Current onboarding is in `app/onboarding.tsx` (304 lines) — extend rather than rewrite
- `profiles` table already has columns for all 7 data points
- Reminder scheduling is detailed in Issue #11
