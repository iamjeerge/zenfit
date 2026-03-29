[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [utils/haptics](../README.md) / NotificationFeedbackType

# Variable: NotificationFeedbackType

> `const` **NotificationFeedbackType**: `object`

Defined in: [utils/haptics.ts:48](https://github.com/iamjeerge/zenfit/blob/main/src/utils/haptics.ts#L48)

Maps Expo `NotificationFeedbackType` enum values to the underlying
`react-native-haptic-feedback` trigger strings.

## Type Declaration

### Error

> `readonly` **Error**: `"notificationError"` = `'notificationError'`

Sharp pattern — operation failed

### Success

> `readonly` **Success**: `"notificationSuccess"` = `'notificationSuccess'`

Three ascending taps — operation succeeded

### Warning

> `readonly` **Warning**: `"notificationWarning"` = `'notificationWarning'`

Two taps — caution / non-fatal issue
