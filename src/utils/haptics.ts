/**
 * @file haptics.ts
 * @module utils/haptics
 * @description Haptic feedback utilities — a platform-agnostic wrapper around
 * `react-native-haptic-feedback` that mirrors the Expo Haptics API surface.
 *
 * Provides three feedback categories:
 * - **Impact** — physical collision feel (light / medium / heavy)
 * - **Notification** — success / warning / error patterns
 * - **Selection** — subtle tick for list/picker interactions
 *
 * Usage:
 * ```ts
 * import { impactAsync, ImpactFeedbackStyle } from '../utils/haptics';
 * impactAsync(ImpactFeedbackStyle.Medium);
 * ```
 */

import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';

/** Native haptic engine options passed to every trigger call. */
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Maps Expo `ImpactFeedbackStyle` enum values to the underlying
 * `react-native-haptic-feedback` trigger strings.
 */
export const ImpactFeedbackStyle = {
  /** Very subtle tap — use for small UI interactions */
  Light: 'impactLight',
  /** Standard tap — the default for most interactions */
  Medium: 'impactMedium',
  /** Strong thud — use for confirmations or destructive actions */
  Heavy: 'impactHeavy',
  /** Alias for Heavy */
  Rigid: 'impactHeavy',
  /** Alias for Light */
  Soft: 'impactLight',
} as const;

/**
 * Maps Expo `NotificationFeedbackType` enum values to the underlying
 * `react-native-haptic-feedback` trigger strings.
 */
export const NotificationFeedbackType = {
  /** Three ascending taps — operation succeeded */
  Success: 'notificationSuccess',
  /** Two taps — caution / non-fatal issue */
  Warning: 'notificationWarning',
  /** Sharp pattern — operation failed */
  Error: 'notificationError',
} as const;

/** Selection feedback — a single subtle click for picker/segmented-control changes. */
export const SelectionFeedbackStyle = { Selection: 'selection' } as const;

/**
 * Trigger an impact haptic (physical collision feel).
 *
 * @param style - One of the `ImpactFeedbackStyle` values (defaults to Medium)
 */
export const impactAsync = (
  style: (typeof ImpactFeedbackStyle)[keyof typeof ImpactFeedbackStyle] = ImpactFeedbackStyle.Medium,
) => {
  ReactNativeHapticFeedback.trigger(style as unknown as HapticFeedbackTypes, options);
};

/**
 * Trigger a notification haptic (success / warning / error pattern).
 *
 * @param type - One of the `NotificationFeedbackType` values (defaults to Success)
 */
export const notificationAsync = (
  type: (typeof NotificationFeedbackType)[keyof typeof NotificationFeedbackType] = NotificationFeedbackType.Success,
) => {
  ReactNativeHapticFeedback.trigger(type as unknown as HapticFeedbackTypes, options);
};

/**
 * Trigger a selection-changed haptic — a lightweight single-click
 * suitable for toggles, sliders, and picker interactions.
 */
export const selectionAsync = () => {
  ReactNativeHapticFeedback.trigger('selection', options);
};
