# SelectItem

The shared runtime base for SelectOption and SelectSeparator. In TypeScript, SelectItem is the union of these two concrete classes.

## Usage

Construct options and separators, then pass a SelectItem array to FrameSelect or SettingDefinition.options. Options hold values; separators only divide groups. Existing plain object inputs remain supported. Use the concrete subclasses rather than constructing the empty base directly.

```typescript
import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'local', label: 'Local' }),
  new SelectSeparator('remote-group'),
  new SelectOption({ value: 'remote', label: 'Remote', description: 'Sync online.' }),
];
```

## Reference

<!-- frame:generated type="SelectItem" -->

```ts
export type SelectItem = SelectOption | SelectSeparator;
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **option** (SelectOption): Value-bearing choice, optionally disabled. See [SelectOption](SelectOption.md).
- **separator** (SelectSeparator): Non-selectable group divider. See [SelectSeparator](SelectSeparator.md).
