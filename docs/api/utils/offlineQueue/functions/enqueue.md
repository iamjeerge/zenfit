[**ZenFit API Reference v1.0.0**](../../../README.md)

***

[ZenFit API Reference](../../../modules.md) / [utils/offlineQueue](../README.md) / enqueue

# Function: enqueue()

> **enqueue**(`table`, `operation`, `payload`, `conflictKey?`): `Promise`\<`void`\>

Defined in: [utils/offlineQueue.ts:47](https://github.com/iamjeerge/zenfit/blob/main/src/utils/offlineQueue.ts#L47)

Append a new mutation to the queue

## Parameters

### table

[`MutationTable`](../type-aliases/MutationTable.md)

### operation

`"insert"` \| `"upsert"`

### payload

`Record`\<`string`, `unknown`\>

### conflictKey?

`string`

## Returns

`Promise`\<`void`\>
