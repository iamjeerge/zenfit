/**
 * @file supabase.ts
 * @module lib/supabase
 * @description Initialises and exports the singleton Supabase client used
 * throughout the application.
 *
 * Configuration is read from environment variables:
 * - `EXPO_PUBLIC_SUPABASE_URL` — the project URL (e.g. `https://xyz.supabase.co`)
 * - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — the public anon key for row-level security
 *
 * The client is configured to use `AsyncStorage` for session persistence so that
 * the user remains signed in across app restarts on both iOS and Android.
 *
 * @example
 * ```ts
 * import { supabase } from '../lib/supabase';
 * const { data, error } = await supabase.from('profiles').select('*');
 * ```
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/** Supabase project URL — must be set via env var in production. */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
/** Supabase anon key — safe to expose client-side; row-level security enforces access control. */
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

/**
 * The application-wide Supabase client.
 *
 * Import this singleton wherever database or auth operations are needed.
 * Do **not** call `createClient` elsewhere — always import from this module.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
