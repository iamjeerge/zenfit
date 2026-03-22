# Issue #4 — Mood Journal: Supabase Persistence & Insights

**Type:** Enhancement  
**Labels:** `enhancement`, `backend`, `mood`  
**Priority:** High

## Summary

`MoodScreen` currently uses a hardcoded `RECENT_ENTRIES` array. Mood entries need to be persisted to the `mood_journal` Supabase table and the insights panel should be driven by real data.

## Motivation

A mood journal is only useful when historical trends are preserved. Persistent data also enables future AI-driven insights (e.g., correlating mood with sleep quality or workout frequency).

## Proposed Solution

### 1. Supabase Persistence

- On "Save" in the Log Mood modal, insert into `public.mood_journal`.
- On mount, fetch the last 30 days of mood entries for the current user.
- Compute `avgMood`, `daysLogged`, and `weekTrend` from live data.

### 2. Mood Insights

- Highlight the highest and lowest mood days of the week.
- Show a message when mood correlates with missed workouts or poor sleep (cross-table query).
- Display a streak counter for consecutive days logged.

### Database Table (already in schema)

```sql
create table public.mood_journal (
  id uuid primary key,
  user_id uuid references profiles(id),
  mood_level integer not null check (mood_level between 1 and 5),
  notes text,
  logged_at timestamptz default now(),
  date date not null default current_date
);
```

## Acceptance Criteria

- [ ] Saving a mood entry persists to Supabase
- [ ] 7-day trend chart reflects real logged data
- [ ] Mood history shows actual entries, newest first
- [ ] Average mood and days-logged stats are computed from live data
- [ ] Mood-logging streak counter displayed on screen
- [ ] Unit tests assert Supabase insert and select behaviour

## Additional Context

- Cross-feature insights (mood + sleep + workout) require joins across `mood_journal`, `sleep_logs`, and `workout_sessions` — plan accordingly.
