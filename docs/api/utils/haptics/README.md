[**ZenFit API Reference v1.0.0**](../../README.md)

***

[ZenFit API Reference](../../modules.md) / utils/haptics

# utils/haptics

## File

haptics.ts

## Description

Haptic feedback utilities — a platform-agnostic wrapper around
`react-native-haptic-feedback` that mirrors the Expo Haptics API surface.

Provides three feedback categories:
- **Impact** — physical collision feel (light / medium / heavy)
- **Notification** — success / warning / error patterns
- **Selection** — subtle tick for list/picker interactions

Usage:
```ts
import { impactAsync, ImpactFeedbackStyle } from '../utils/haptics';
impactAsync(ImpactFeedbackStyle.Medium);
```

## Variables

- [ImpactFeedbackStyle](variables/ImpactFeedbackStyle.md)
- [NotificationFeedbackType](variables/NotificationFeedbackType.md)
- [SelectionFeedbackStyle](variables/SelectionFeedbackStyle.md)

## Functions

- [impactAsync](functions/impactAsync.md)
- [notificationAsync](functions/notificationAsync.md)
- [selectionAsync](functions/selectionAsync.md)
