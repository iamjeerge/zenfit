# Issue #8 — Custom Workout Plan Builder

**Type:** Enhancement  
**Labels:** `enhancement`, `workout`  
**Priority:** Medium

## Summary

Let users create, save, and schedule custom multi-day workout plans (e.g., Push/Pull/Legs split, 5-day programme) that they can follow week by week, with progress tracking against each plan.

## Motivation

While the Workout Tracker (#2) lets users log ad-hoc sessions, serious athletes need structured programmes. A Plan Builder bridges casual logging and structured periodised training.

## Proposed Solution

### Plan Builder Screen

New `WorkoutPlanScreen` accessible from `WorkoutScreen` or Profile menu:

1. **Create Plan** — give it a name, number of days per week (1–7).
2. **Day Builder** — for each training day, add exercises with target sets/reps/weight.
3. **Schedule** — assign each day to Mon/Tue/Wed… or leave as "Day 1, Day 2…".
4. **Activate Plan** — mark a plan as active; it appears on the Home dashboard as "Today's Plan".

### Following a Plan

- Home screen shows "Today's Workout" card based on the active plan.
- Tapping it opens the Workout Tracker pre-filled with the plan's exercises.
- After completing, the session is marked as ✅ in the plan's progress view.

### Database Changes

The `diet_plans` pattern can be replicated for workout plans:

```sql
create table public.workout_plans (
  id uuid primary key,
  user_id uuid references profiles(id),
  name text not null,
  description text,
  days_per_week integer check (days_per_week between 1 and 7),
  plan_days jsonb not null default '[]',
  -- [{day_number, name, exercises:[{name,sets,reps,weight_kg}]}]
  is_active boolean default false,
  created_at timestamptz default now()
);
```

## Acceptance Criteria

- [ ] User can create a named plan with 1–7 training days
- [ ] Each day can have an unlimited number of exercises
- [ ] Plans are saved to Supabase
- [ ] One plan can be set as "active" at a time
- [ ] Active plan's "today" workout appears on the Home dashboard
- [ ] Completing a workout against a plan records progress
- [ ] Plan progress view shows completion history (calendar heatmap style)
- [ ] Plans can be edited and deleted

## Additional Context

- `diet_plans` table in `supabase/schema.sql` is a good structural reference
- Plan templates could later be shared publicly (premium feature)
