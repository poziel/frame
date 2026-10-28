# ChatMessage

Public interface declared in packages/core/src/modules/chat/types/chatTypes.ts.

## Usage

Import ChatMessage from @frame/core/modules/chat. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface ChatMessage {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Conversation role identifying the entry as user or assistant content. */
  role: 'user' | 'assistant';

  /** Creation timestamp in milliseconds since the Unix epoch. */
  createdAt: number;

  /** Content parts retained in their original event order. */
  parts: ChatPart[];

  /**
   * Host-selected attachment references associated with this entry or request.
   */
  attachments: ChatAttachment[];

  /** Whether the entry is pending, complete, stopped, or failed. */
  status: 'pending' | 'complete' | 'stopped' | 'error';

  /**
   * Completion timestamp in milliseconds since the Unix epoch, when finished.
   */
  finishedAt?: number;

  /** Failure explanation retained when the message finishes with an error. */
  error?: string;
}
```

## Reference

<!-- frame:generated type="ChatMessage" -->

```ts
export interface ChatMessage {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Conversation role identifying the entry as user or assistant content. */
  role: 'user' | 'assistant';

  /** Creation timestamp in milliseconds since the Unix epoch. */
  createdAt: number;

  /** Content parts retained in their original event order. */
  parts: ChatPart[];

  /**
   * Host-selected attachment references associated with this entry or request.
   */
  attachments: ChatAttachment[];

  /** Whether the entry is pending, complete, stopped, or failed. */
  status: 'pending' | 'complete' | 'stopped' | 'error';

  /**
   * Completion timestamp in milliseconds since the Unix epoch, when finished.
   */
  finishedAt?: number;

  /** Failure explanation retained when the message finishes with an error. */
  error?: string;
}
```

| Name          | Type                                              | Description                                                                     |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `id`          | `string`                                          | Stable identity used to address this entry within its owning message or schema. |
| `role`        | `'user' \| 'assistant'`                           | Conversation role identifying the entry as user or assistant content.           |
| `createdAt`   | `number`                                          | Creation timestamp in milliseconds since the Unix epoch.                        |
| `parts`       | `ChatPart[]`                                      | Content parts retained in their original event order.                           |
| `attachments` | `ChatAttachment[]`                                | Host-selected attachment references associated with this entry or request.      |
| `status`      | `'pending' \| 'complete' \| 'stopped' \| 'error'` | Whether the entry is pending, complete, stopped, or failed.                     |
| `finishedAt`  | `number`                                          | Completion timestamp in milliseconds since the Unix epoch, when finished.       |
| `error`       | `string`                                          | Failure explanation retained when the message finishes with an error.           |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **role** ('user' | 'assistant'): Role configuration for this component; see its Features examples for usage.
- **createdAt** (number): Created At configuration for this component; see its Features examples for usage.
- **parts** (ChatPart[]): Parts configuration for this component; see its Features examples for usage.
- **attachments** (ChatAttachment[]): Attachments configuration for this component; see its Features examples for usage.
- **status** ('pending' | 'complete' | 'stopped' | 'error'): Status configuration for this component; see its Features examples for usage.
- **finishedAt** (number): Finished At configuration for this component; see its Features examples for usage.
- **error** (string): Error configuration for this component; see its Features examples for usage.
