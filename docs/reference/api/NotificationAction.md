# NotificationAction

An optional labeled application action displayed inside a notification.

## Usage

Pass this object as NotificationOptions.action. Frame prevents repeated clicks while running, pauses expiry, and closes the notification after success. The host owns the callback.

```typescript
frame.notify({ title: 'Review requested', action: { label: 'Open settings', run: () => frame.openSettings() } });
```

## Reference

<!-- frame:generated type="NotificationAction" -->

```ts
export interface NotificationAction {

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Application callback invoked when the action is activated. */
  run: () => void | Promise<void>;
}
```

| Name    | Type                          | Description                                                |
| ------- | ----------------------------- | ---------------------------------------------------------- |
| `label` | `string`                      | Human-readable name displayed by the owning surface.       |
| `run`   | `() => void \| Promise<void>` | Application callback invoked when the action is activated. |

<!-- /frame:generated -->

## Notes

- **label** (string): Visible action-button text.
- **run** (() => void | Promise<void>): Runs on activation. A thrown error or rejected promise displays an error notification.
