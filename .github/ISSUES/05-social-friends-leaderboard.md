# Issue #5 — Social Features: Friends & Global Leaderboard

**Type:** Enhancement  
**Labels:** `enhancement`, `social`  
**Priority:** Medium

## Summary

Add a social layer to ZenFit so users can add friends, compare daily stats, and compete on weekly leaderboards for steps, workouts, and streaks.

## Motivation

Social accountability is one of the strongest motivators for sustained fitness habits. A leaderboard turns individual progress into a fun, shared experience and increases daily engagement.

## Proposed Solution

### Friend System

- **Send/accept friend requests** — search users by display name or email.
- **Friend list** — view friends' avatars, levels, and current streaks.
- **Activity feed** — see when friends complete workouts, hit step goals, or earn badges.

### Leaderboards

| Board | Metric | Period |
|-------|--------|--------|
| Steps | Total steps | This week |
| Workouts | Sessions completed | This month |
| Streak | Consecutive active days | All time |

### Database Changes

```sql
create table public.friendships (
  id uuid primary key,
  requester_id uuid references profiles(id),
  addressee_id uuid references profiles(id),
  status text check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

create table public.activity_feed (
  id uuid primary key,
  user_id uuid references profiles(id),
  type text, -- 'workout_completed', 'badge_earned', 'step_goal_hit'
  metadata jsonb,
  created_at timestamptz default now()
);
```

### New Screen

`SocialScreen` accessible from the bottom tab bar (new "Social" tab icon).

## Acceptance Criteria

- [ ] Users can search and add friends
- [ ] Friend requests can be accepted or rejected
- [ ] Three leaderboard tabs (Steps, Workouts, Streak) with pagination
- [ ] Current user is highlighted in leaderboard
- [ ] Activity feed shows last 20 friend activities
- [ ] Privacy: users can make their profile private to hide from search
- [ ] RLS policies restrict leaderboard data to friends only (non-public profiles)
- [ ] Unit + integration tests for friend request flow and leaderboard query

## Additional Context

- The `StepsScreen` already has a placeholder `leaderboard` array — this feature should replace it with live data.
