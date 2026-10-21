# Modals

Frame provides draggable, resizable modals for host-owned forms, properties, previews, and other secondary tasks. The modal header supports a title, optional icon, optional tools, maximize/restore, and close. Content can be any Vue component. Modals are local to the application; they are not operating-system windows.

```ts
const handle = frame.openModal({
  id: "properties",
  title: "Workspace properties",
  icon: PropertiesIcon,
  component: PropertiesForm,
  props: { workspaceId },
  actions: [{ id: "reset", label: "Reset", icon: ResetIcon, run: resetForm }],
  width: 960,
  height: 640,
});
handle.close();
// Or close the top modal:
frame.closeModal();
```

Use a distinct ID for each independently open modal. Opening an already-open ID activates its existing instance and preserves its content. Opening a different ID pushes a nested modal; closing it reveals the previous modal with its edits intact. A stale handle cannot close a later instance with the same ID.

Drag the header to move a normal modal. Resize any edge or corner. Maximize fills the workbench body with a 6px inset, excluding the title and status bars. Restore returns to the normal rectangle. Browser/window resize clamps the modal to keep it reachable. Double-click the header or title to maximize/restore.

Escape closes the active modal. The background and lower modals are inert. Keyboard focus is contained within the top modal and returns to its opening control on close. Mark a content field `data-modal-autofocus` to give it initial focus. The header is keyboard focusable: Alt+Arrow keys move by 10px, and Alt+Shift+Arrow keys resize the bottom/right edges. Clicking the backdrop does not discard the modal.

For hosts that manage visibility themselves, the exported `FrameModal` component also supports a default content slot, a `header-actions` slot, the same title/icon/actions/size props, an optional `bounds` element, and a `close` event. Mount it only while it is open. `active` defaults to true.

The demo includes `Demo: Open workspace properties` in Quick actions and a Workspace properties button in Sample tools. Advanced properties demonstrates a nested modal. Form changes are illustrative and remain in component state until the modal closes.
