/**
 * @file authStore.ts
 * @module store/authStore
 * @description Global Zustand store for authentication state.
 *
 * Manages the Supabase session lifecycle, user profile data, and all
 * auth-related side-effects (sign-in, sign-up, sign-out, initialization).
 *
 * Usage:
 * ```ts
 * const { session, signInWithEmail } = useAuthStore();
 * // or with a selector (avoids unnecessary re-renders):
 * const profile = useAuthStore((s) => s.profile);
 * ```
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

/**
 * Shape of a user profile row in the `profiles` Supabase table.
 * Maps 1-to-1 with the `profiles` schema defined in `supabase/schema.sql`.
 */
export type Profile = {
  /** UUID — matches `auth.users.id` */
  id: string;
  /** Display name chosen by the user */
  full_name: string | null;
  /** Public URL of the user's avatar image */
  avatar_url: string | null;
  /** Biological gender for personalised fitness advice */
  gender: 'male' | 'female' | 'other' | null;
  /** ISO date string, e.g. `"1990-05-20"` */
  date_of_birth: string | null;
  /** Height in centimetres */
  height_cm: number | null;
  /** Weight in kilograms */
  weight_kg: number | null;
  /** Free-text fitness goal, e.g. `"Lose weight"` */
  fitness_goal: string | null;
  /** Subscription tier — controls feature access */
  subscription_status: 'free' | 'premium';
  /** Consecutive days the user has logged at least one activity */
  streak_days: number;
  /** Experience points accumulated across all tracked activities */
  xp: number;
  /** Gamification level derived from XP */
  level: number;
  /** Activity level for TDEE calculation, e.g. "sedentary" | "light" | "moderate" | "active" */
  activity_level: string | null;
  /** ISO timestamp of profile creation */
  created_at: string;
};

/**
 * Complete shape of the auth store — includes both state slices and actions.
 * Actions are co-located with state for ergonomic access via `useAuthStore()`.
 */
type AuthState = {
  // ── State ────────────────────────────────────────────────────────────────
  /** Active Supabase session, or `null` when signed out */
  session: Session | null;
  /** Derived from `session.user` for convenient access */
  user: User | null;
  /** Cached user profile fetched from the `profiles` table */
  profile: Profile | null;
  /** `true` while any async auth operation is in-flight */
  loading: boolean;
  /** `true` after `initialize()` has completed at least once */
  initialized: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  /**
   * Manually set the session (e.g. from an `onAuthStateChange` callback).
   * Also syncs `user` from the session.
   */
  setSession: (session: Session | null) => void;
  /** Fetch the current user's profile row from Supabase and cache it in state. */
  fetchProfile: () => Promise<void>;
  /**
   * Persist partial profile updates to Supabase and refresh the local cache.
   * @param updates - Fields to update (partial `Profile`)
   */
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  /**
   * Sign in with email + password via Supabase Auth.
   * Sets `loading: true` for the duration, then fetches the profile on success.
   * @throws Supabase `AuthError` on invalid credentials
   */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /**
   * Create a new account via Supabase Auth and store the returned session.
   * @param fullName - Stored in `user_metadata.full_name`
   * @throws Supabase `AuthError` if the e-mail is already registered
   */
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  /** Sign out of Supabase and clear all local auth state. */
  signOut: () => Promise<void>;
  /**
   * Bootstrap auth on app launch:
   * 1. Restores any persisted session via `getSession()`
   * 2. Fetches the profile if a session exists
   * 3. Subscribes to `onAuthStateChange` for future sign-in/sign-out events
   */
  initialize: () => Promise<void>;
};

/**
 * Global singleton store for authentication state.
 *
 * Backed by Zustand — components subscribe via the `useAuthStore` hook.
 * The store is automatically kept in sync with Supabase Auth via
 * `onAuthStateChange`, which is registered during `initialize()`.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { profile, signOut } = useAuthStore();
 *   return <Text onPress={signOut}>{profile?.full_name}</Text>;
 * }
 * ```
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
      await get().fetchProfile();
    } finally {
      set({ loading: false });
    }
  },

  signUpWithEmail: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, initialized: true });
    if (session) {
      await get().fetchProfile();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session) get().fetchProfile();
    });
  },
}));
