[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [utils/offlineQueue](../README.md) / flushQueue

# Function: flushQueue()

> **flushQueue**(): `Promise`\<\{ `failed`: `number`; `synced`: `number`; \}\>

Defined in: [utils/offlineQueue.ts:94](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L94)

Attempt to flush all queued mutations to Supabase.
 Returns { synced, failed } counts.

## Returns

`Promise`\<\{ `failed`: `number`; `synced`: `number`; \}\>
