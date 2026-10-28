# TimeRange

Start and end time values controlled by the application.

## Usage

Import the model type and its constructors or parsers from @frame/core. The application chooses its storage format, locale and time zone.

```typescript
import { Time, type TimeRange } from '@frame/core';
const range: TimeRange = { start: new Time(9, 30), end: new Time(17) };
```

## Reference

<!-- frame:generated type="TimeRange" -->

```ts
export interface TimeRange { start: TimeValue | undefined; end: TimeValue | undefined }
```

| Name    | Type                     | Description                 |
| ------- | ------------------------ | --------------------------- |
| `start` | `TimeValue \| undefined` | Source description pending. |
| `end`   | `TimeValue \| undefined` | Source description pending. |

<!-- /frame:generated -->

## Notes

- **start** (TimeValue | undefined): A structured value, or undefined while this end of the range is incomplete. See [TimeValue](TimeValue.md).
- **end** (TimeValue | undefined): A structured value, or undefined while this end of the range is incomplete. See [TimeValue](TimeValue.md).
