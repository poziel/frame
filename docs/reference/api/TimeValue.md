# TimeValue

Structured time model used by the time field; it is not a formatted display string.

## Usage

Import the model type and its constructors or parsers from @frame/core. The application chooses its storage format, locale and time zone.

```typescript
import { Time, type TimeValue } from '@frame/core';
const time: TimeValue = new Time(9, 30);
```

## Reference

<!-- frame:generated type="TimeValue" -->

```ts
type TimeValue = Time | CalendarDateTime | ZonedDateTime;
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **hour** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
- **minute** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
- **second** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
