# SelectSeparator

A runtime class extending SelectItem. Represents a non-selectable divider.

## Usage

Pass a stable unique group ID to the constructor. Separators have no value and cannot become the selected option.

```typescript
import { SelectSeparator } from '@frame/core';
const divider = new SelectSeparator('remote-group');
```

## Reference

<!-- frame:generated type="SelectSeparator" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **id** (string): Stable unique key supplied to the constructor.
- **type** (readonly "separator"): Automatically initialized discriminant used to skip selection.
