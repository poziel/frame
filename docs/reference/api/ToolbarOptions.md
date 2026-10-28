# ToolbarOptions

Initial visibility of instance-owned title-bar controls.

## Usage

Use the public package export for this contract.

```typescript
const frame = createFrame({ toolbar: { primary: true, commandCenter: false } });
frame.toolbar.setVisible('bottom', true);
```

## Reference

<!-- frame:generated type="ToolbarOptions" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **customize** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
- **primary** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
- **bottom** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
- **secondary** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
- **commandCenter** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
- **layoutControls** (boolean): Whether this title-bar control is rendered; hiding it does not disable its command.
