[**ZenFit API Reference v1.0.0**](../../README.md)

***

[ZenFit API Reference](../../modules.md) / store/authStore

# store/authStore

## File

authStore.ts

## Description

Global Zustand store for authentication state.

Manages the Supabase session lifecycle, user profile data, and all
auth-related side-effects (sign-in, sign-up, sign-out, initialization).

Usage:
```ts
const { session, signInWithEmail } = useAuthStore();
// or with a selector (avoids unnecessary re-renders):
const profile = useAuthStore((s) => s.profile);
```

## Type Aliases

- [Profile](type-aliases/Profile.md)

## Variables

- [useAuthStore](variables/useAuthStore.md)
