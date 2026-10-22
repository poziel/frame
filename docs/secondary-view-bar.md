# Secondary view bar

The secondary sidebar uses a **View Bar** for its registered root views. Right-click a tab or the header, or use Shift+F10 on a focused tab, to open its context menu.

The menu supports hiding the selected view, hiding its badge, moving it to the primary sidebar or bottom panel, and selecting which registered views appear. Hiding is presentation-only: it preserves registration, mounted content and application state. Explicitly opening a hidden view reveals it again. When every view is hidden, the empty header remains available for recovery.

View Bar Size offers Default and Compact. View Bar Display offers Icons Only, Text Only, and Icons and Text. A view without an icon gets a generic view icon in icon-only mode; its accessible name remains the label. The final command moves the secondary sidebar to the opposite side and updates its direction after the move. Primary and secondary sidebars remain opposite each other.

```ts
const frame = createFrame({
  secondaryBar: { display: 'both', size: 'default', hidden: [], hiddenBadges: [] },
});
frame.registerSecondaryTab({ id: 'chat', label: 'Chat', component: ChatView, badge: 3 });
frame.secondaryBar.setDisplay('icons');
frame.secondaryBar.setSize('compact');
frame.secondaryBar.setVisible('chat', false);
frame.secondaryBar.setBadgeVisible('chat', false);
frame.secondaryBar.setBadge('chat', 4);
frame.secondaryBar.moveSide('left');
frame.openSecondaryPanel('chat'); // Reveals the existing view, preserving its state.
```

`frame.secondaryBar.items` exposes registered views with their current visibility and badge preferences. Display, size and side are reactive computed refs. Preferences are isolated per Frame instance, cleaned up on unregister/disposal, and display/size reset through the existing layout reset path. Hosts own any cross-session persistence policy.

View tabs are measured against the available width. The active view stays visible when it fits; remaining views move into **More Views**. At very narrow widths, all view choices can be in that menu. The same tab overflow is available for the bottom panel. **More View Actions** similarly contains action buttons that no longer fit; disabled actions remain disabled and selecting an action uses its original callback. Widening the container restores buttons automatically. Roving tab navigation, context-menu keys and focus restoration remain available.
