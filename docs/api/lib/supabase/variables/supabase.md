[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [lib/supabase](../README.md) / supabase

# Variable: supabase

> `const` **supabase**: `SupabaseClient`\<`any`, `"public"`, `"public"`, `any`, `any`\>

Defined in: [lib/supabase.ts:35](https://github.com/iamjeerge/zenfit/blob/main/src/lib/supabase.ts#L35)

The application-wide Supabase client.

Import this singleton wherever database or auth operations are needed.
Do **not** call `createClient` elsewhere — always import from this module.
