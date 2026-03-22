# Issue #6 — AI-Powered Personalised Workout Recommendations

**Type:** Enhancement  
**Labels:** `enhancement`, `AI`, `workout`  
**Priority:** Medium

## Summary

Integrate the Claude AI API to generate personalised workout plans and daily exercise recommendations based on the user's fitness goal, recent workout history, sleep quality, and current fitness level.

## Motivation

The `NutritionScreen` already uses Claude AI for location-aware food recommendations. Extending AI to workout planning creates a truly intelligent fitness companion that adapts to the user's unique progress and recovery state.

## Proposed Solution

### Recommendation Engine

Use Claude to generate recommendations by providing:
- User's `fitness_goal` from their profile
- Last 7 days of `workout_sessions` (type, volume, muscle groups)
- Last 7 days of `sleep_logs` (duration, quality)
- Current `streak_days` and `level`

**Prompt pattern:**
```
You are a professional fitness coach. Based on the following data:
- Fitness goal: {goal}
- Recent workouts: {workouts}
- Recent sleep: {sleep}
- Current level: {level}

Suggest today's workout with exercises, sets, reps, and rest periods.
Format as JSON: [{name, sets, reps, rest_seconds, muscle_group, tips}]
```

### UI Integration

- Add an "AI Recommendation" card on the `WorkoutScreen` (similar to the AI card in `NutritionScreen`).
- Users can tap "Generate Workout" to get a Claude-powered suggestion.
- Accepted suggestions are pre-populated in the exercise list for the current session.

## Acceptance Criteria

- [ ] "Generate Workout" button calls Claude API with personalised context
- [ ] Claude response is parsed and displayed as an exercise list
- [ ] Loading state shown while waiting for API response
- [ ] Error state with retry option if API call fails
- [ ] Generated workout can be started directly (pre-fills today's exercise list)
- [ ] API key stored securely in `EXPO_PUBLIC_CLAUDE_API_KEY` env var (already configured)
- [ ] Recommendation respects the user's fitness goal (lose weight vs build muscle vs flexibility)

## Additional Context

- See `NutritionScreen` for the existing Claude API call pattern
- `EXPO_PUBLIC_CLAUDE_API_KEY` is already defined in `.env.example`
- Model: `claude-3-5-sonnet-20241022` or latest available
