# AIChatConversation

Public interface declared in packages/core/src/modules/chat/controllers/aiChatHistory.ts.

## Usage

Import AIChatConversation from @frame/core/modules/chat. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface AIChatConversation {

  /** Unique identity within this history store. */
  id: string;

  /** User-visible name preserved while the conversation is retained. */
  title: string;

  /** Application scope identity, independent of the native provider session. */
  applicationId?: string;

  /** Creation time in epoch milliseconds. */
  createdAt: number;

  /** Whether the conversation sorts before unpinned entries. */
  pinned: boolean;

  /** Whether the conversation is retained outside the normal visible list. */
  archived: boolean;

  /** Owned chat controller disposed when the conversation is removed. */
  chat: AIChatController;
}
```

## Reference

<!-- frame:generated type="AIChatConversation" -->

```ts
export interface AIChatConversation {

  /** Unique identity within this history store. */
  id: string;

  /** User-visible name preserved while the conversation is retained. */
  title: string;

  /** Application scope identity, independent of the native provider session. */
  applicationId?: string;

  /** Creation time in epoch milliseconds. */
  createdAt: number;

  /** Whether the conversation sorts before unpinned entries. */
  pinned: boolean;

  /** Whether the conversation is retained outside the normal visible list. */
  archived: boolean;

  /** Owned chat controller disposed when the conversation is removed. */
  chat: AIChatController;
}
```

| Name            | Type               | Description                                                             |
| --------------- | ------------------ | ----------------------------------------------------------------------- |
| `id`            | `string`           | Unique identity within this history store.                              |
| `title`         | `string`           | User-visible name preserved while the conversation is retained.         |
| `applicationId` | `string`           | Application scope identity, independent of the native provider session. |
| `createdAt`     | `number`           | Creation time in epoch milliseconds.                                    |
| `pinned`        | `boolean`          | Whether the conversation sorts before unpinned entries.                 |
| `archived`      | `boolean`          | Whether the conversation is retained outside the normal visible list.   |
| `chat`          | `AIChatController` | Owned chat controller disposed when the conversation is removed.        |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **title** (string): Visible heading.
- **applicationId** (string): Application Id configuration for this component; see its Features examples for usage.
- **createdAt** (number): Created At configuration for this component; see its Features examples for usage.
- **pinned** (boolean): Pinned configuration for this component; see its Features examples for usage.
- **archived** (boolean): Archived configuration for this component; see its Features examples for usage.
- **chat** (AIChatController): Application-owned chat controller. Requests start only when explicitly sent.
