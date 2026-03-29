[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [store/authStore](../README.md) / useAuthStore

# Variable: useAuthStore

> `const` **useAuthStore**: `UseBoundStore`\<`StoreApi`\<`AuthState`\>\>

Defined in: [store/authStore.ts:125](https://github.com/iamjeerge/zenfit/blob/main/src/store/authStore.ts#L125)

Global singleton store for authentication state.

Backed by Zustand — components subscribe via the `useAuthStore` hook.
The store is automatically kept in sync with Supabase Auth via
`onAuthStateChange`, which is registered during `initialize()`.

## Example

```tsx
function MyComponent() {
  const { profile, signOut } = useAuthStore();
  return <Text onPress={signOut}>{profile?.full_name}</Text>;
}
```
