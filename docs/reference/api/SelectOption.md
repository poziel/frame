# SelectOption

A runtime class extending SelectItem. Represents a selectable value.

## Usage

Pass an object with value and label to the constructor. Optional metadata controls supporting text and availability. Each value should be unique in the list.

```typescript
import { SelectOption } from '@frame/core';
const option = new SelectOption({ value: 'remote', label: 'Remote', detail: 'Cloud', description: 'Sync online.', disabled: false });
```

## Reference

<!-- frame:generated type="SelectOption" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **value** (string): Required value emitted by v-model when selected.
- **label** (string): Required visible option text.
- **description** (string | undefined): Optional explanation below the list for the active option.
- **detail** (string | undefined): Optional secondary inline text.
- **disabled** (boolean | undefined): When true, pointer selection and keyboard navigation skip this option.
