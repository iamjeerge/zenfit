# Issue #14 — Dark / Light Theme Toggle

**Type:** Enhancement  
**Labels:** `enhancement`, `UI`, `accessibility`  
**Priority:** Low

## Summary

ZenFit currently uses a fixed "cosmic dark" theme. Add a light theme variant and a toggle in Settings so users can switch between dark mode (default), light mode, and system-following mode.

## Motivation

- Accessibility: some users with visual impairments prefer high-contrast light mode.
- Outdoor use: light themes are more legible in bright sunlight.
- User preference: offering a choice increases comfort and app stickiness.

## Proposed Solution

### Theme System

1. **Define a `LightColors` palette** in `src/theme/colors.ts` alongside the existing `Colors` (dark).
2. **Create a `ThemeContext`** that provides the active `Colors`, `Gradients`, and `Shadows` objects.
3. **Wrap the app root** in `ThemeProvider`.
4. **All screens consume `useTheme()`** instead of importing `Colors` directly.

### Light Theme Palette (draft)

| Token | Dark | Light |
|-------|------|-------|
| `background` | `#0D0B1A` | `#F8F9FF` |
| `card` | `#1A1730` | `#FFFFFF` |
| `textPrimary` | `#F8FAFC` | `#1A1730` |
| `textSecondary` | `#94A3B8` | `#64748B` |
| `violet` | `#7C3AED` | `#7C3AED` (unchanged) |

### Settings Screen

Add a "Appearance" row in `SettingsScreen` with three options:
- ☀️ Light
- 🌙 Dark
- 📱 System (follows device setting)

Persist preference in `AsyncStorage` and apply on app launch.

## Acceptance Criteria

- [ ] `ThemeContext` provides `Colors`, `Gradients`, `Shadows` dynamically
- [ ] All screens use `useTheme()` instead of hard-coded `Colors` imports
- [ ] Light theme palette defined for all colour tokens
- [ ] Appearance preference persisted in `AsyncStorage`
- [ ] System-following mode uses `useColorScheme()` from React Native
- [ ] No hardcoded hex values outside `colors.ts`
- [ ] Snapshot tests updated for both themes
- [ ] Smooth animated transition between themes

## Additional Context

- React Native's `useColorScheme()` detects OS dark/light mode
- `AsyncStorage` is already in `package.json`
- Requires updating all 15+ screens — consider using a codemod to automate the `Colors` → `useTheme().colors` migration
