[**ZenFit API Reference v1.0.0**](../../README.md)

***

[ZenFit API Reference](../../modules.md) / lib/supabase

# lib/supabase

## File

supabase.ts

## Description

Initialises and exports the singleton Supabase client used
throughout the application.

Configuration is read from environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` — the project URL (e.g. `https://xyz.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — the public anon key for row-level security

The client is configured to use `AsyncStorage` for session persistence so that
the user remains signed in across app restarts on both iOS and Android.

## Example

```ts
import { supabase } from '../lib/supabase';
const { data, error } = await supabase.from('profiles').select('*');
```

## Variables

- [supabase](variables/supabase.md)
