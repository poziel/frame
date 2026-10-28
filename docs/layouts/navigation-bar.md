# Navigation bar

Add application actions, links, dropdowns, and separators around the workspace. The navigation bar has its own presentation controller, independent of Back/Forward history.

## Features

Enable it at creation with `navigationBar: true` or an options object. Dock it on any edge and choose icons, text, or both. Vertical icons-and-text bars can collapse to icons without changing the saved display preference.

Registering a navigation item does not create a sidebar or workspace component. An action invokes application behavior; a link uses browser navigation unless the host supplies `onNavigate`; a dropdown owns a nested item tree. IDs are unique throughout that tree.

Hiding the bar preserves registrations and preferences. `features: { navigationBar: false }` instead makes the feature unavailable and blocks presentation actions. Each Frame owns its own items; unregister contributions when their owning feature ends and dispose the root on application teardown.

The Playground uses an isolated Frame instance. Changes reset when you leave this page.

## APIs

```ts
import {createFrame} from '@frame/core';

const frame = createFrame({
  navigationBar: {position: 'top', display: 'both'},
});
const remove = frame.registerNavigationItem({
  id: 'app.refresh',
  type: 'action',
  label: 'Refresh',
  run: () => frame.status.set('Refresh requested'),
});

frame.navigationBar.setPosition('left');
frame.navigationBar.setDisplay('both');
frame.navigationBar.setCollapsed(true);
frame.navigationBar.setVisible(true);

// When the contribution ends:
remove();
// When the owning shell ends:
frame.dispose();
```

Use `setItemVisible(id, value)` for one item, `setBadge(id, badge)` and `setBadgeVisible(id, value)` for badges, and `activate(id)` for controller activation. Hidden or disabled ancestors prevent descendant activation. `moveItem(id, beforeId?)` reorders root items.

Set `navigationBar.allowAddSeparator` to permit user-created separators. Host registrations retain their explicit disposer. See [navigation items](../shell/navigation-bar.md) and [creation options](../configuration/frame-options.md#navigation-bar) for complete fields and defaults.

Render the stable instance with `FrameShell :frame="frame"`; application views access it through `useFrame()`.

## Styling

Use `setDisplay`, `setSize('compact')`, and `setJustification('center')` for presentation rather than changing shell DOM. Navigation icons are Vue components. `--frame-navigation-label-gap` and `--frame-navigation-label-end-padding` control vertical label spacing.

Content and controls share [theme variables](../styling/theme-variables.md). Runtime theme changes affect the shell and its overlay menus. See [layout](../configuration/layout.md) for density and overlay boundaries.
