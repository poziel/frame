# Shared preference implementation

Settings and keyboard shortcuts share draft editing and shell presentation.
Their effective values remain owned by `Settings` and `CommandRegistry`.

| Class                     | File                            | Responsibility                                                                                                |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `PreferenceDocument`      | `preferenceDocument.ts`         | Isolated JSON draft, dirty state, conflict detection, explicit save, and observation cleanup                  |
| `PreferencePage`          | `preferencePage.ts`             | Form/JSON mode, search text, editor registration, and one document instance                                   |
| `PreferencePresentation`  | `preferencePresentation.ts`     | Modal/tab requests, title and dirty indicators, feature availability, and tab cleanup for one preference kind |
| `PreferencesPresentation` | `preferencesPresentation.ts`    | The mounted shell's pair of settings and keyboard-shortcut presentation adapters                              |
| `Keybindings`             | `../keybindings/keybindings.ts` | Shortcut override hydration and serialized persistence through the host adapter                               |

## Document and content ownership

`PreferenceDocumentHost` supplies `toJSON`, `applyJSON`, `load`, and `flush`.
The document reads that contract without owning domain values or choosing a
storage location. Typing changes only `draft`; `save()` checks the host has not
changed since editing began, applies the document, and awaits persistence.
Failures remain visible in `error` and keep the draft available for retry.
A clean draft follows effective changes automatically; a dirty draft does not.

`PreferencePage` owns one document and the shared content state around it.
Settings and shortcut controllers expose this state to the UI. Moving a page
between a modal and a tab preserves the same mode, search, editor, and draft.
Returning to the form discards unsaved JSON changes.

## Presentation ownership

`FrameShell` creates `PreferencesPresentation` and registers its bound `dispose`
method for unmount. The coordinator owns two independent
`PreferencePresentation` objects, each with its own document kind and watcher
scope. Their request watchers present existing Frame-owned surfaces rather than
creating another layout store.

Each adapter reuses an existing tab or modal, updates titles in place, and
removes unavailable presentation through the workspace and modal APIs.
Disposal stops its watchers and releases its registered workspace tab. It does
not dispose Settings, Keybindings, host storage, or the content page.

Document, presentation, and shortcut-persistence observers have explicit owned
scopes. They are released by the appropriate `dispose()` operation. Methods
passed as callbacks remain bound to their instance.

The old document and presentation factory functions have been replaced by class
construction. Implementations live in their owning files; no compatibility
wrapper or duplicate preference store is required.
