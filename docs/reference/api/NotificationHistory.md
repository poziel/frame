# NotificationHistory

An optional in-memory store from @frame/core/modules/notifications. It retains notification events independently of core notification expiry.

## Usage

Create the store before emitting notifications. Mount NotificationPanel and NotificationIndicator with the same store. Dispose it on host unmount to unsubscribe. This store is not part of @frame/core.

```typescript
import { createNotificationHistory } from '@frame/core/modules/notifications';
const history = createNotificationHistory(frame, { limit: 200 });
history.toggle();
// onBeforeUnmount(() => history.dispose());
```

## Reference

<!-- frame:generated type="NotificationHistory" -->

```ts
export type NotificationHistory = Pick<
  NotificationHistoryController,
  keyof NotificationHistoryController
>;
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **state.open** (boolean): Controls the optional history panel visibility.
- **state.items** (HistoryNotification[]): Newest-first history entries with independent numeric historyId keys and expanded state; bounded by limit.
- **toggle** (() => void): Toggles panel visibility.
- **dismiss** ((historyId: number) => void): Removes one history entry without dismissing an active core notification.
- **clear** (() => void): Clears history without changing active notifications.
- **dispose** (() => void): Unsubscribes, clears history, and closes its panel.
