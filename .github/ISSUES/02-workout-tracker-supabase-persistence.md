# Issue #2 — Workout Tracker: Supabase Persistence

**Type:** Enhancement  
**Labels:** `enhancement`, `backend`, `workout`  
**Priority:** High

## Summary

The `WorkoutScreen` currently stores exercises only in local React state. All data is lost when the screen is unmounted or the app is restarted. Workout sessions should be persisted to the `workout_sessions` Supabase table.

## Motivation

Fitness tracking is only valuable when historical data is available. Users need to see their workout history over time to track progress, measure improvements, and stay motivated.

## Proposed Solution

1. **Save workout sessions** — When the user taps "End Workout", save the session (exercises, duration, notes) to `public.workout_sessions` via the Supabase client.
2. **Load recent sessions** — On screen mount, fetch the user's last 10 sessions from Supabase (replacing the current hardcoded `recentSessions` array).
3. **Real-time loading state** — Show a loading spinner while fetching.
4. **Optimistic updates** — Append the new session to the local list before the API call resolves to keep the UI responsive.

### Database Table (already in schema)

```sql
create table public.workout_sessions (
  id uuid primary key,
  user_id uuid references profiles(id),
  exercises jsonb not null default '[]',
  duration_minutes integer,
  notes text,
  started_at timestamptz default now(),
  completed_at timestamptz
);
```

## Acceptance Criteria

- [ ] Tapping "End Workout" saves the session to Supabase
- [ ] Recent sessions are loaded from Supabase on mount
- [ ] Sessions persist across app restarts
- [ ] Loading and error states are handled gracefully
- [ ] Unit tests mock Supabase and assert insert is called with correct data
- [ ] RLS ensures users can only see their own sessions

## Additional Context

- `src/lib/supabase.ts` — Supabase client
- `src/store/authStore.ts` — access `session.user.id` for `user_id`
