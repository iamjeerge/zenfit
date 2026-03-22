# Issue #10 — Offline Data Sync & Local Caching

**Type:** Enhancement  
**Labels:** `enhancement`, `offline`, `performance`  
**Priority:** Medium

## Summary

ZenFit currently requires an active internet connection for all data operations. Add an offline-first architecture so users can log workouts, sleep, meals, and mood without connectivity, with background sync when the connection is restored.

## Motivation

Gyms often have poor Wi-Fi. Morning routines happen before the phone connects to the network. Requiring a connection for basic logging creates friction and risks data loss.

## Proposed Solution

### Strategy: MMKV + Supabase Sync Queue

1. **Local store** — Use `react-native-mmkv` (fast key-value store) or `@realm/react` for structured local storage.
2. **Mutation queue** — All writes (workout sessions, mood entries, sleep logs, water intake) are added to a local queue first.
3. **Background sync** — When connectivity is detected (`@react-native-community/netinfo`), drain the queue by submitting all pending mutations to Supabase.
4. **Conflict resolution** — Last-write-wins for scalar fields; append-only for logs.

### Affected Screens

| Screen | Offline Action |
|--------|---------------|
| WorkoutScreen | Log exercise sets locally |
| SleepScreen | Save sleep log locally |
| MoodScreen | Save mood entry locally |
| NutritionScreen | Log meals locally |
| HomeScreen | Read last-known stats from cache |

### Sync Indicator

Show a subtle banner ("Offline — data will sync when connected") when the app detects no connection.

## Acceptance Criteria

- [ ] Workout, sleep, mood, and meal entries can be saved without a network connection
- [ ] A sync queue persists across app restarts
- [ ] All queued mutations are submitted when connectivity is restored
- [ ] Sync status indicator visible in the app shell
- [ ] No duplicate entries created on sync
- [ ] Unit tests for queue logic and conflict resolution
- [ ] E2E test simulates offline → online transition

## Additional Context

- `@react-native-community/netinfo` is a popular dependency for connectivity detection
- Supabase's `upsert` with `on_conflict` simplifies conflict resolution
