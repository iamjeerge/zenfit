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
