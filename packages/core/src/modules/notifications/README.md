# Notifications module

Public entry: `@frame/core/modules/notifications`. History is opt-in, bounded,
and in memory. The factory and component exports remain available at that entry.

| File                                          | Responsibility                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `controllers/notificationHistory.ts`          | `NotificationHistoryController`, the structural history API, and its existing factory |
| `integrations/notificationHistoryBindings.ts` | Toolbar/status registrations, indicator placement, badges, and cleanup                |
| `types/notificationHistoryTypes.ts`           | Shared options, state, retained entry, and indicator location contracts               |
| `components/`                                 | History panel and standalone indicator rendering                                      |
| `components/NotificationPanel.vue`            | History and indicator presentation styles                                             |

## State and lifecycle ownership

`NotificationHistoryController` subscribes only after explicit construction.
It records fresh snapshots in newest-first order, assigns monotonic history IDs,
and trims entries to the configured positive limit. Entries outlive transient
toasts. Dismissing or clearing history never dismisses a live notification.

The existing mutable reactive `state` remains shared with panels and indicators.
UI can continue changing panel openness and entry expansion directly. Bound
controller methods remain usable as callbacks; `createNotificationHistory()`
returns the same structural contract, now backed by the controller class.

`NotificationHistoryBindings` reads that state without creating another store.
It owns collision-safe toolbar/status registration IDs and synchronizes status
moves with the indicator location. Pin visibility, feature availability, and
location remain independent. Disabling the indicator closes the panel while
retaining history; hiding a registered control does not clear history.

Callers own explicit history disposal. It unsubscribes from future deliveries,
removes only this history's registrations, clears retained entries, and closes
the panel. Repeated disposal is harmless and the Frame remains caller-owned.
Core transient notifications stay in `framework/views/notifications.ts`.

Shared types remain re-exported from the previous controller path for existing
imports. See the [shared module structure](../README.md#shared-module-structure).
