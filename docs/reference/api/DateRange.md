# DateRange

Start and end date values used by range calendars, fields and pickers.

## Usage

Import the model type and its constructors or parsers from @frame/core. The application chooses its storage format, locale and time zone.

```typescript
import { CalendarDate, type DateRange } from '@frame/core';
const range: DateRange = { start: new CalendarDate(2026, 10, 21), end: new CalendarDate(2026, 10, 26) };
```

## Reference

<!-- frame:generated type="DateRange" -->

```ts
type DateRange = {
  start: DateValue$1 | undefined;
  end: DateValue$1 | undefined;
};
```

No declared entries.

<!-- /frame:generated -->

## Notes

- **start** (DateValue | undefined): A structured value, or undefined while this end of the range is incomplete. See [DateValue](DateValue.md).
- **end** (DateValue | undefined): A structured value, or undefined while this end of the range is incomplete. See [DateValue](DateValue.md).
