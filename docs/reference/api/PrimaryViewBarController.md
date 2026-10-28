# PrimaryViewBarController

Per-instance view-bar presentation, visibility, and badge controls.

## Usage

Use the public package export for this contract.

```typescript
frame.primaryViewBar.setPosition('top');
frame.primaryViewBar.setSize('compact');
frame.primaryViewBar.movePrimarySide('right');
const position = frame.primaryViewBar.position.value;
```

## Reference

<!-- frame:generated type="PrimaryViewBarController" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **position / size** (ComputedRef<ViewBarPosition> / ComputedRef<ViewBarSize>): Reactive current presentation. Read .value in script.
- **setPosition** ((position: ViewBarPosition) => boolean): Change placement or hide; non-hidden positions show the bar. See [ViewBarPosition](ViewBarPosition.md).
- **setSize** ((size: ViewBarSize) => boolean): Change only view item size. See [ViewBarSize](ViewBarSize.md).
- **movePrimarySide** ((side: 'left' | 'right') => boolean): Move the primary sidebar and view-bar presentation together.
- **setVisible / setBadgeVisible / setBadge** (methods): Control registered contributions by their view/action key; hiding does not dispose content.
