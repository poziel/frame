/** Date objects preserve calendar/time-zone semantics; no implicit JS Date conversion. */
export { CalendarDate, CalendarDateTime, ZonedDateTime, Time, parseDate, parseDateTime, parseTime, parseZonedDateTime, today, getLocalTimeZone } from '@internationalized/date';
export type { DateValue } from '@internationalized/date';
export type { DateRange, TimeValue } from 'reka-ui';

import type { TimeValue } from 'reka-ui';
export interface TimeRange { start: TimeValue | undefined; end: TimeValue | undefined }
