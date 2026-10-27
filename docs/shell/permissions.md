# UI permissions

Permissions provide shared synchronous decisions for commands and host-owned interactions. They are isolated per Frame. Features continue to describe functional availability; permissions do not disable features automatically or enforce backend authorization.

```ts
const edit = frame.permissions.register<{readOnly: boolean; aiBusy: boolean}>({
  id: 'document.edit',
  allowed: document => !document.readOnly && !document.aiBusy,
  reason: document => document.aiBusy ? 'AI is editing' : 'Document is read-only',
});

const erase = frame.commands.register({
  id: 'artwork.edit.erase', label: 'Erase', feature: 'artwork',
  requires: ['document.edit'], context: () => currentDocument.value,
  enabled: () => hasSelection.value,
  run: eraseSelection,
});

edit.disable('Application is read-only');
edit.enable(); // Force approval for this permission only.
edit.reset();  // Resume the original automatic condition.

const decision = edit.check(currentDocument.value);
if (decision.allowed) startUserStroke();
erase.unregister();
edit.unregister();
```

`allowed` and `reason` accept literals, Vue refs, or context predicates. A literal is a snapshot; use a ref or predicate to follow later changes. Evaluation does not perform authentication, discovery, or network requests. The host updates reactive state from its own services.

Manual state is `automatic`, `enabled`, or `disabled`. Overrides retain the registered sources. Unknown or unregistered permissions deny access. All command requirements must allow access, and command conditions and feature availability remain independent gates. UI permission checks do not cancel work already in progress: long-running operations must coordinate cancellation or recheck before committing changes.

The object returned from registration owns `check(context)`, `enable()`, `disable(reason?)`, `reset()`, and `unregister()`. Registry methods delegate to that same object. Use `get<Context>(id)` for typed contextual lookup, or bracket lookup for registered dotted IDs. Registry member names are reserved. Context-free permissions use `check(undefined)`.

Host-owned buttons can bind disabled state to the decision and display its reason. Canvas handlers must check the same permission before editing. Keep the AI's controlled mutation path distinct from user editing permission when an AI operation temporarily locks user interaction.

Disposing Frame unregisters its permissions and prevents retained references from allowing access. Registrations reject duplicate IDs. Unregistering an old object never removes a replacement registered under the same ID.

## Observe state changes

Permissions expose `subscribe`, `subscribeOnce`, `unsubscribe`, and `invoke` through the shared [Notifier](../reference/notifier.md) mechanism. Each subscription returns an opaque ID. Callbacks receive one payload containing `previous` and `current` snapshots.

```ts
const id = edit.subscribe(({previous, current}) => {
  if (previous.allowed && !current.allowed) cancelUserStroke();
}, () => currentDocument.value);

edit.unsubscribe(id);

edit.subscribeOnce(({current}) => {
  console.log('Next permission change:', current.allowed);
}, () => currentDocument.value);
```

Contextual permissions require a typed target, target ref, or target getter.
Context-free permissions, commands, and features need only the callback.
Subscriptions do not replay an initial event. Automatic state events arrive
synchronously only when the effective snapshot changes, and each subscription
observes its own target independently.

Permission snapshots include `mode`, the effective `reason`, `active`, and
`allowed`. Manual mutations replace one typed `PermissionState` atomically, so
subscribers do not observe an intermediate mode/reason combination.

`unsubscribe(id)` removes one subscription and its reactive observation;
`unsubscribe()` removes them all. One-time subscriptions are removed before
callback execution, preventing duplicate delivery during nested changes. Actual
removal or Frame disposal delivers terminal inactive snapshots and detaches
observations. Subscribing to an inactive registration throws.

`invoke({previous, current})` explicitly broadcasts a supplied event; it does
not change permission state or select a target. Prefer actual permission
operations for state changes. Callback failures do not block other subscribers,
and async callbacks are not awaited or cancelled by unsubscription.
