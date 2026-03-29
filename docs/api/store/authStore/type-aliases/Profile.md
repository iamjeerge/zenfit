[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [store/authStore](../README.md) / Profile

# Type Alias: Profile

> **Profile** = `object`

Defined in: [store/authStore.ts:26](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L26)

Shape of a user profile row in the `profiles` Supabase table.
Maps 1-to-1 with the `profiles` schema defined in `supabase/schema.sql`.

## Properties

### activity\_level

> **activity\_level**: `string` \| `null`

Defined in: [store/authStore.ts:52](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L52)

Activity level for TDEE calculation, e.g. "sedentary" | "light" | "moderate" | "active"

***

### avatar\_url

> **avatar\_url**: `string` \| `null`

Defined in: [store/authStore.ts:32](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L32)

Public URL of the user's avatar image

***

### created\_at

> **created\_at**: `string`

Defined in: [store/authStore.ts:54](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L54)

ISO timestamp of profile creation

***

### date\_of\_birth

> **date\_of\_birth**: `string` \| `null`

Defined in: [store/authStore.ts:36](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L36)

ISO date string, e.g. `"1990-05-20"`

***

### fitness\_goal

> **fitness\_goal**: `string` \| `null`

Defined in: [store/authStore.ts:42](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L42)

Free-text fitness goal, e.g. `"Lose weight"`

***

### full\_name

> **full\_name**: `string` \| `null`

Defined in: [store/authStore.ts:30](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L30)

Display name chosen by the user

***

### gender

> **gender**: `"male"` \| `"female"` \| `"other"` \| `null`

Defined in: [store/authStore.ts:34](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L34)

Biological gender for personalised fitness advice

***

### height\_cm

> **height\_cm**: `number` \| `null`

Defined in: [store/authStore.ts:38](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L38)

Height in centimetres

***

### id

> **id**: `string`

Defined in: [store/authStore.ts:28](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L28)

UUID — matches `auth.users.id`

***

### level

> **level**: `number`

Defined in: [store/authStore.ts:50](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L50)

Gamification level derived from XP

***

### streak\_days

> **streak\_days**: `number`

Defined in: [store/authStore.ts:46](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L46)

Consecutive days the user has logged at least one activity

***

### subscription\_status

> **subscription\_status**: `"free"` \| `"premium"`

Defined in: [store/authStore.ts:44](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L44)

Subscription tier — controls feature access

***

### weight\_kg

> **weight\_kg**: `number` \| `null`

Defined in: [store/authStore.ts:40](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L40)

Weight in kilograms

***

### xp

> **xp**: `number`

Defined in: [store/authStore.ts:48](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L48)

Experience points accumulated across all tracked activities
