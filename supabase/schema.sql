-- ─────────────────────────────────────────────
-- ZenFit — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════════════
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  gender text check (gender in ('male', 'female', 'other')),
  date_of_birth date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  fitness_goal text check (fitness_goal in ('lose_weight', 'build_muscle', 'stay_fit', 'flexibility', 'meditation')),
  subscription_status text default 'free' check (subscription_status in ('free', 'premium')),
  streak_days integer default 0,
  xp integer default 0,
  level integer default 1,
  location_city text,
  location_country text,
  preferred_language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════
-- 2. SUBSCRIPTIONS
-- ═══════════════════════════════════════════════
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text default 'premium' check (plan in ('premium')),
  billing_cycle text check (billing_cycle in ('monthly', 'annual')),
  price_cents integer not null,
  currency text default 'USD',
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'trial')),
  trial_ends_at timestamptz,
  current_period_start timestamptz default now(),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 3. DIET PLANS
-- ═══════════════════════════════════════════════
create table public.diet_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  daily_calories integer,
  protein_grams integer,
  carbs_grams integer,
  fat_grams integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  diet_plan_id uuid references public.diet_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  calories integer,
  protein_grams numeric(6,2),
  carbs_grams numeric(6,2),
  fat_grams numeric(6,2),
  logged_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 4. REMINDERS
-- ═══════════════════════════════════════════════
create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('water', 'breakfast', 'lunch', 'dinner', 'snack', 'supplement', 'workout', 'meditation', 'sleep')),
  time time not null,
  enabled boolean default true,
  days_of_week integer[] default '{1,2,3,4,5,6,7}',
  message text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 5. STEPS & HEALTH DATA
-- ═══════════════════════════════════════════════
create table public.daily_steps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  steps integer default 0,
  distance_km numeric(6,2),
  calories_burned integer,
  active_minutes integer,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table public.heart_rate_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bpm integer not null,
  zone text check (zone in ('rest', 'fat_burn', 'cardio', 'peak', 'extreme')),
  source text check (source in ('apple_watch', 'android_watch', 'manual')),
  recorded_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 6. BEAUTY TIPS
-- ═══════════════════════════════════════════════
create table public.beauty_tips (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  category text check (category in ('skin', 'hair', 'grooming', 'post_workout', 'nutrition_beauty')),
  gender text check (gender in ('male', 'female', 'all')),
  image_url text,
  video_url text,
  likes integer default 0,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 7. AI FOOD RECOMMENDATIONS
-- ═══════════════════════════════════════════════
create table public.food_recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  location_city text,
  location_country text,
  foods jsonb not null, -- [{name, benefits, where_to_find, calories}]
  ai_reasoning text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 8. EXERCISE VIDEOS
-- ═══════════════════════════════════════════════
create table public.exercise_videos (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text check (category in ('yoga', 'meditation', 'strength', 'cardio', 'flexibility', 'hiit', 'breathing')),
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer,
  video_url text not null,
  thumbnail_url text,
  instructor_name text,
  rating numeric(3,2) default 0,
  views integer default 0,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 9. WATER TRACKING
-- ═══════════════════════════════════════════════
create table public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  glasses integer default 0,
  target_glasses integer default 10,
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ═══════════════════════════════════════════════
-- 10. MEDITATION SESSIONS
-- ═══════════════════════════════════════════════
create table public.meditation_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('guided', 'breathing', 'body_scan', 'mantra', 'sleep', 'focus')),
  duration_minutes integer not null,
  mood_before text,
  mood_after text,
  notes text,
  completed_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- 11. ACHIEVEMENTS / GAMIFICATION
-- ═══════════════════════════════════════════════
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  xp_reward integer default 0,
  requirement_type text,
  requirement_value integer,
  created_at timestamptz default now()
);

create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- ═══════════════════════════════════════════════
-- 12. YOGA CLASSES
-- ═══════════════════════════════════════════════
create table public.yoga_classes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  style text check (style in ('hatha', 'vinyasa', 'kundalini', 'yin', 'power', 'restorative', 'ashtanga')),
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer,
  video_url text not null,
  thumbnail_url text,
  instructor_name text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.diet_plans enable row level security;
alter table public.meals enable row level security;
alter table public.reminders enable row level security;
alter table public.daily_steps enable row level security;
alter table public.heart_rate_logs enable row level security;
alter table public.food_recommendations enable row level security;
alter table public.water_logs enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.user_achievements enable row level security;

-- Users can only read/write their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);
create policy "Users can manage own diet plans" on public.diet_plans for all using (auth.uid() = user_id);
create policy "Users can manage own meals" on public.meals for all using (auth.uid() = user_id);
create policy "Users can manage own reminders" on public.reminders for all using (auth.uid() = user_id);
create policy "Users can manage own steps" on public.daily_steps for all using (auth.uid() = user_id);
create policy "Users can manage own heart rate" on public.heart_rate_logs for all using (auth.uid() = user_id);
create policy "Users can manage own food recs" on public.food_recommendations for all using (auth.uid() = user_id);
create policy "Users can manage own water logs" on public.water_logs for all using (auth.uid() = user_id);
create policy "Users can manage own meditation" on public.meditation_sessions for all using (auth.uid() = user_id);
create policy "Users can manage own achievements" on public.user_achievements for all using (auth.uid() = user_id);

-- Public read for beauty tips, exercise videos, yoga classes, achievements
alter table public.beauty_tips enable row level security;
alter table public.exercise_videos enable row level security;
alter table public.yoga_classes enable row level security;
alter table public.achievements enable row level security;

create policy "Anyone can view beauty tips" on public.beauty_tips for select using (true);
create policy "Anyone can view exercise videos" on public.exercise_videos for select using (true);
create policy "Anyone can view yoga classes" on public.yoga_classes for select using (true);
create policy "Anyone can view achievements" on public.achievements for select using (true);

-- ═══════════════════════════════════════════════
-- 13. WORKOUT SESSIONS
-- ═══════════════════════════════════════════════
create table public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercises jsonb not null default '[]', -- [{name, sets, reps, weight_kg}]
  duration_minutes integer,
  notes text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.workout_sessions enable row level security;
create policy "Users can manage own workout sessions" on public.workout_sessions for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 14. SLEEP LOGS
-- ═══════════════════════════════════════════════
create table public.sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bedtime timestamptz not null,
  wake_time timestamptz not null,
  duration_hours numeric(4,2) generated always as (
    extract(epoch from (wake_time - bedtime)) / 3600.0
  ) stored,
  quality integer check (quality between 1 and 5),
  notes text,
  date date not null,
  created_at timestamptz default now()
);

alter table public.sleep_logs enable row level security;
create policy "Users can manage own sleep logs" on public.sleep_logs for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 15. MOOD JOURNAL
-- ═══════════════════════════════════════════════
create table public.mood_journal (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood_level integer not null check (mood_level between 1 and 5),
  notes text,
  logged_at timestamptz default now(),
  date date not null default current_date
);

alter table public.mood_journal enable row level security;
create policy "Users can manage own mood journal" on public.mood_journal for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 16. PROGRESS PHOTOS (Issue #7)
-- ═══════════════════════════════════════════════
create table public.progress_photos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_url text not null,
  category text check (category in ('front', 'side', 'back', 'other')) default 'other',
  weight_kg numeric(5,2),
  taken_at date not null default current_date,
  created_at timestamptz default now()
);

alter table public.progress_photos enable row level security;
create policy "Users manage own progress photos" on public.progress_photos for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 17. FRIENDSHIPS (Issue #5)
-- ═══════════════════════════════════════════════
create table public.friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table public.friendships enable row level security;
create policy "Users can manage own friendships" on public.friendships for all
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ═══════════════════════════════════════════════
-- 18. ACTIVITY FEED (Issue #5)
-- ═══════════════════════════════════════════════
create table public.activity_feed (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'workout_completed', 'badge_earned', 'step_goal_hit'
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_feed enable row level security;
create policy "Users can see own activity" on public.activity_feed for select using (auth.uid() = user_id);
create policy "Users can insert own activity" on public.activity_feed for insert with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 19. WORKOUT PLANS (Issue #8)
-- ═══════════════════════════════════════════════
create table public.workout_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  days_per_week integer not null check (days_per_week between 1 and 7),
  plan_days jsonb not null default '[]',
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.workout_plans enable row level security;
create policy "Users can manage own workout plans" on public.workout_plans
  for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 20. WEIGHT LOGS (Issue #9)
-- ═══════════════════════════════════════════════
create table public.weight_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  logged_at date not null default current_date,
  unique(user_id, logged_at),
  created_at timestamptz default now()
);

alter table public.weight_logs enable row level security;
create policy "Users can manage own weight logs" on public.weight_logs
  for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- 21. WEARABLE INTEGRATION MIGRATIONS (Issue #12)
-- ═══════════════════════════════════════════════

-- Add source column to sleep_logs for wearable-synced entries
alter table public.sleep_logs
  add column if not exists source text default 'manual'
    check (source in ('manual', 'apple_watch', 'android_watch', 'health_connect'));

-- Expand heart_rate_logs source check to include health_connect
alter table public.heart_rate_logs
  drop constraint if exists heart_rate_logs_source_check;
alter table public.heart_rate_logs
  add constraint heart_rate_logs_source_check
    check (source in ('apple_watch', 'android_watch', 'manual', 'health_connect'));

-- ═══════════════════════════════════════════════
-- 22. REMINDERS COLUMN MIGRATIONS (Issue #11)
-- ═══════════════════════════════════════════════
alter table public.reminders
  add column if not exists time_hh integer check (time_hh between 0 and 23),
  add column if not exists time_mm integer check (time_mm between 0 and 59),
  add column if not exists notification_id text;

-- ═══════════════════════════════════════════════
-- 23. STRIPE SUBSCRIPTION MIGRATIONS (Issue #13)
-- ═══════════════════════════════════════════════
alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists activity_level text
    check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'));
