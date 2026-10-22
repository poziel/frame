# Panel layout and view controls

Frame’s panel retains its existing registrations and view state when docked at the Top, Bottom, Left or Right. `bottom` remains the registration region for compatibility; physical docking is controlled independently.

Top and Bottom use the existing Center, Justify, Left and Right alignment policy. Top mirrors the bottom coverage, including sidebar-spanning alignment. Left and Right sit beside the workspace, inside the primary and secondary sidebar boundaries. Alignment controls are disabled for these positions; the saved alignment is preserved for the next horizontal placement. Width and height resize independently.

Right-click a panel tab or its header for Configure Keybinding (disabled placeholder), Hide the selected view, Hide/Show Badge, Move To either sidebar, a checked view list, Panel Position, Align Panel, Show Labels and Hide Panel. Show Labels offers Icons Only, Text Only and Icons and Text. Hidden views retain registration and mounted state; explicitly opening one reveals it again. Overflow keeps both views and actions accessible at small widths.

The same position choices appear immediately above Panel Alignment in Customize Layout and call the same APIs.

```ts
const frame = createFrame({panel: {position: 'bottom', alignment: 'center', display: 'both'}});
frame.panel.setPosition('right');
frame.panel.setAlignment('justify'); // Returns false while docked left/right; saved alignment is unchanged.
frame.panel.setPosition('top');
frame.panel.setAlignment('justify');
frame.panel.setDisplay('icons');
frame.panel.setVisible('terminal', false);
frame.panel.setBadgeVisible('terminal', false);
frame.panel.setBadge('terminal', 2);
frame.openBottomPanel('terminal'); // Reveals the registered view at the current physical position.
frame.closeBottomPanel();
```

`frame.panel.position`, `alignment`, `display`, `canAlign` and `items` are reactive computed refs. These preferences belong to each Frame instance and are disposed with it. Layout reset restores the configured presentation defaults. Applications own persistence across sessions and the domain state inside their views.
