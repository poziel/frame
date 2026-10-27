# Notifier

`Notifier<Event>` registers callbacks under opaque subscription IDs and invokes
them with one payload. It is usable independently of a Frame instance and has
no Vue dependency, reactive state store, or mediator.

```ts
import {Notifier, type StateChange} from '@frame/core';

const changes = new Notifier<StateChange<{allowed: boolean}>>();
const id = changes.subscribe(({previous, current}) => {
  console.log(previous.allowed, current.allowed);
});
changes.subscribeOnce(event => console.log('Next event:', event));
changes.invoke({previous: {allowed: true}, current: {allowed: false}});
changes.unsubscribe(id);
```

## Operations

| Method                    | Behavior                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `subscribe(callback)`     | Retains a callback and returns its `SubscriptionId`             |
| `subscribeOnce(callback)` | Registers a callback for only the next invocation               |
| `unsubscribe(id)`         | Removes that subscription; repeated or foreign IDs are harmless |
| `unsubscribe()`           | Removes every subscription                                      |
| `invoke(event)`           | Delivers one payload to the current subscriptions               |

IDs are unique symbols, not callback functions or persistent application IDs.
Store the returned ID when the subscription needs explicit cancellation. Each
call to subscribe creates an independent subscription, even for the same
callback. Without a payload, use `new Notifier()` and call `invoke()`.

One-time subscriptions are removed **before** their callbacks run, including
when the callback throws or invokes the notifier recursively. New subscriptions
added during an invocation wait for the next invocation. Subscriptions removed
before their turn are skipped.

Delivery is synchronous. Async callbacks are permitted, but their promises are
not awaited. Callback exceptions and rejections are reported independently and
do not block other callbacks. Unsubscribing does not cancel an already-running
async callback. The generic notifier passes its payload unchanged and does not
freeze, interpret, or store it as application state.

## Frame-owned state notifications

`Permission`, `Command`, and `Feature` expose the same four methods and delegate
callback delivery to their own notifier. An internal reactive adapter invokes
notifications when their effective state changes. It creates observation only
when a caller subscribes, suppresses unchanged snapshots, and removes
subscriptions when their registrations end or Frame is disposed.

State callbacks receive one `StateChange<State>` object with `previous` and
`current` readonly snapshots. Automatic state events and their snapshots are
frozen. Contextual permissions retain an explicit target per subscription; see
[permissions](../shell/permissions.md).

Calling an item's `invoke(event)` explicitly broadcasts the supplied event to
its subscriptions. It does not update its actual state, retarget a permission,
or execute a command. Automatic contextual changes are delivered only to the
subscriptions observing the affected target.

`frame.commands.hook(...)` remains a separate existing API for observing
successful command execution; it does not represent an item state subscription.
