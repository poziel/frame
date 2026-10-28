# StatusController

Frame-owned text/button registration, side placement and centered application status.

## Usage

Use the public package export for this contract.

```typescript
frame.status.register({ id: 'app.save', kind: 'button', label: 'Save', text: 'Save', side: 'right', run: save });
frame.status.set('Saving document');
frame.status.show('Could not save', { severity: 'error', duration: 4000 });
```

## Reference

<!-- frame:generated type="StatusController" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **register** ((item: StatusItemDefinition) => () => void): Register a text or button item and return an idempotent disposer.
- **update** ((id: string, patch: StatusItemUpdate) => boolean): Update an item; getter-backed values remain owned by their source.
- **move** ((id: string, side: "left" | "right") => boolean): Move a side item without replacing its registration.
- **setVisible / setBadgeVisible** ((id: string, visible: boolean) => boolean): Control item and badge presentation independently.
- **set** ((text: string) => void): Update the persistent center status.
- **show** ((text: string, options?: StatusMessageOptions) => () => void): Show temporary status text. Defaults to 4000 ms, then restores the persistent status.
- **clear** (() => void): Clear persistent and temporary status text.
- **setBarVisible** ((visible: boolean) => boolean): Show or hide the entire status bar through its existing layout state.
