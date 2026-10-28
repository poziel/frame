# ViewBarPosition

View-bar placement or visibility selected through options or frame.primaryViewBar.setPosition.

## Usage

Use the public package export for this contract.

```typescript
import type { ViewBarPosition } from '@frame/core';
const position: ViewBarPosition = 'top';
frame.primaryViewBar.setPosition(position);
```

## Reference

<!-- frame:generated type="ViewBarPosition" -->

This contract is described by the authored notes below.

<!-- /frame:generated -->

## Notes

- **default** (literal): Normal view bar placement.
- **top / bottom** (literal): Horizontal view-bar placement.
- **hidden** (literal): Hide through layout.primaryViewBarVisible while retaining the last visible position.
