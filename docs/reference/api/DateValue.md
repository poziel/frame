# DateValue

Calendar-aware date model used by calendar, date, month and year controls.

## Usage

Import the model type and its constructors or parsers from @frame/core. The application chooses its storage format, locale and time zone.

```typescript
import { CalendarDate, type DateValue } from '@frame/core';
const date: DateValue = new CalendarDate(2026, 10, 21);
```

## Reference

<!-- frame:generated type="DateValue" -->

```ts
export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **year** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
- **month** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
- **day** (number): A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.
