[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [utils/offlineQueue](../README.md) / QueuedMutation

# Interface: QueuedMutation

Defined in: [utils/offlineQueue.ts:20](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L20)

## Properties

### conflictKey?

> `optional` **conflictKey?**: `string`

Defined in: [utils/offlineQueue.ts:25](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L25)

***

### enqueuedAt

> **enqueuedAt**: `string`

Defined in: [utils/offlineQueue.ts:26](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L26)

***

### id

> **id**: `string`

Defined in: [utils/offlineQueue.ts:21](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L21)

***

### operation

> **operation**: `"insert"` \| `"upsert"`

Defined in: [utils/offlineQueue.ts:23](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L23)

***

### payload

> **payload**: `Record`\<`string`, `unknown`\>

Defined in: [utils/offlineQueue.ts:24](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L24)

***

### table

> **table**: [`MutationTable`](../type-aliases/MutationTable.md)

Defined in: [utils/offlineQueue.ts:22](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L22)
