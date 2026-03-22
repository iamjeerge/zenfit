# Issue #3 — Sleep Tracker: Supabase Persistence & Wearable Integration

**Type:** Enhancement  
**Labels:** `enhancement`, `backend`, `sleep`, `wearables`  
**Priority:** High

## Summary

The `SleepScreen` displays hardcoded demo data and does not persist sleep logs to Supabase. Additionally, sleep data should optionally be pulled from Apple HealthKit (iOS) or Health Connect (Android) to reduce manual entry.

## Motivation

Accurate sleep history enables trend analysis and personalised recommendations. Integrating with wearables removes the friction of manual logging, increasing data completeness.

## Proposed Solution

### 1. Supabase Persistence

- On "Save" in the Log Sleep modal, insert a record into `public.sleep_logs`.
- On screen mount, query the last 14 days of logs for the current user.
- Replace `RECENT_LOGS` and `WEEK_DATA` constants with live data.

### 2. HealthKit / Health Connect Integration

- Use `expo-health` (or a community Expo module) to request permissions for sleep analysis.
- If permission granted, auto-populate the most recent sleep session.
- Fall back to manual entry if permission denied or data unavailable.

### Database Table (already in schema)

```sql
create table public.sleep_logs (
  id uuid primary key,
  user_id uuid references profiles(id),
  bedtime timestamptz not null,
  wake_time timestamptz not null,
  duration_hours numeric(4,2) generated always as (...) stored,
  quality integer check (quality between 1 and 5),
  notes text,
  date date not null
);
```

## Acceptance Criteria

- [ ] Saving a sleep log persists to Supabase
- [ ] Weekly chart reflects real data from Supabase
- [ ] Sleep history shows actual logged entries
- [ ] HealthKit / Health Connect read permission is requested (iOS/Android only)
- [ ] Auto-fill from wearable data when available
- [ ] Graceful fallback when no wearable data or permission denied
- [ ] Unit tests cover insert, fetch, and wearable-data parsing

## Additional Context

- See `docs/ARCHITECTURE.md` for wearable integration patterns
- `expo-sensors` is already a dependency
