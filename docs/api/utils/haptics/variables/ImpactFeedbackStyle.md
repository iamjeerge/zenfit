[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [utils/haptics](../README.md) / ImpactFeedbackStyle

# Variable: ImpactFeedbackStyle

> `const` **ImpactFeedbackStyle**: `object`

Defined in: [utils/haptics.ts:31](https://github.com/iamjeerge/zenfit/blob/main/src/utils/haptics.ts#L31)

Maps Expo `ImpactFeedbackStyle` enum values to the underlying
`react-native-haptic-feedback` trigger strings.

## Type Declaration

### Heavy

> `readonly` **Heavy**: `"impactHeavy"` = `'impactHeavy'`

Strong thud — use for confirmations or destructive actions

### Light

> `readonly` **Light**: `"impactLight"` = `'impactLight'`

Very subtle tap — use for small UI interactions

### Medium

> `readonly` **Medium**: `"impactMedium"` = `'impactMedium'`

Standard tap — the default for most interactions

### Rigid

> `readonly` **Rigid**: `"impactHeavy"` = `'impactHeavy'`

Alias for Heavy

### Soft

> `readonly` **Soft**: `"impactLight"` = `'impactLight'`

Alias for Light
