# FrameOptions

Optional built-in features chosen when creating an isolated Frame instance.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ navigation: true, settings: true, notifications: true });
```

## Reference

<!-- frame:generated type="FrameOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **navigation** (boolean): Enable page/view navigation history and the Back/Forward arrows. Default false.
- **settings** (boolean): Enable built-in Settings UI. Default true.
- **notifications** (boolean): Enable transient notifications. Default true.
- **toolbar** (ToolbarOptions): Initial title-bar control visibility; runtime changes use frame.toolbar. See [ToolbarOptions](ToolbarOptions.md).
- **primaryViewBar** (PrimaryViewBarOptions): Initial view-bar position, size, hidden items and badges; runtime changes use frame.primaryViewBar. See [PrimaryViewBarOptions](PrimaryViewBarOptions.md).
- **secondaryViewBar** (SecondaryViewBarOptions): Initial secondary view-bar display, size, position, and item visibility. See [SecondaryViewBarOptions](SecondaryViewBarOptions.md).
- **panelViewBar** (PanelViewBarOptions): Panel view-item presentation, independent of its container. See [PanelViewBarOptions](PanelViewBarOptions.md).
- **navigationBar** (boolean | NavigationBarOptions): Optional navigation-only bar; supports all four docking edges. See [NavigationBarOptions](NavigationBarOptions.md).
- **status** (StatusOptions): Initial status text, bar visibility, hidden items and hidden badges; runtime changes use frame.status. See [StatusOptions](StatusOptions.md).
