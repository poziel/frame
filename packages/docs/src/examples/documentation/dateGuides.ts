import type { ComponentGuide } from './formGuides';

const example = (id: string, title: string, description: string, values: Record<string, unknown>) => ({ id, title, description, values });
const date = '2026-10-21';
const range = { start: '2026-10-21', end: '2026-10-26' };
const source = (id: string) => `https://reka-ui.com/docs/components/${id}`;
const calendarAnatomy = [
  { part: 'Root', description: 'Coordinates selection, the visible period and keyboard focus.' },
  { part: 'Header', description: 'Previous and next buttons flank the period heading.' },
  { part: 'Grid and cells', description: 'Rows contain focusable day choices and their selection states.' },
  { part: 'footer slot', description: 'Adds application help below the calendar.' },
];
const fieldAnatomy = [
  { part: 'Root', description: 'Groups the value, formatting and validation state.' },
  { part: 'Input segments', description: 'Separate date parts support direct typing and arrow-key editing.' },
];
const pickerAnatomy = [
  { part: 'Field and inputs', description: 'Editable date segments share the selected value with the calendar.' },
  { part: 'Trigger and content', description: 'The field button opens an anchored calendar popover.' },
  { part: 'Calendar', description: 'Navigation, heading and day grid support visual selection.' },
  { part: 'footer slot', description: 'Adds help inside the calendar content.' },
];

export const dateGuides: Record<string, ComponentGuide> = {
  calendar: {
    description: 'An inline day grid for choosing dates with managed focus and localized calendar labels.',
    anatomy: calendarAnatomy,
    capabilities: ['Navigate days with arrow keys and select with the keyboard.', 'Select one day or several independent days.', 'Localize headings and weekdays; display adjacent months together.'],
    source: source('calendar'),
    examples: [
      example('multiple-days', 'Multiple date selection', 'Choose training days without selecting every day between them. Activate a selected day again to remove it.', { modelValue: ['2026-10-21', '2026-10-26'], multiple: true, label: 'Training days' }),
      example('two-months', 'Multiple months and paged navigation', 'Two fixed-height months keep late October and early November visible. Navigation advances a full page.', { modelValue: date, numberOfMonths: 2, fixedWeeks: true, pagedNavigation: true, label: 'Travel date' }),
      example('localized-week', 'Locale and first day of the week', 'French labels and a Monday-first grid adapt the same selected day to a regional calendar.', { modelValue: date, locale: 'fr-FR', weekStartsOn: 1, label: 'Date du rendez-vous' }),
    ],
  },
  'range-calendar': {
    description: 'An inline calendar for choosing a start and end date, with the intervening range shown in the grid.',
    anatomy: calendarAnatomy,
    capabilities: ['Select range endpoints through the calendar grid.', 'Navigate days and months without a pointer.', 'Share locale, bounds and focus behavior across the interval.'],
    source: source('range-calendar'),
    examples: [
      example('stay-dates', 'Range selection', 'Select the first day, then the last day. The highlighted interval makes the full stay visible.', { modelValue: range, label: 'Stay dates' }),
      example('bounded-stay', 'Minimum and maximum dates', 'Dates outside October and November are disabled. Try choosing an endpoint beyond the available season.', { modelValue: range, minValue: '2026-10-01', maxValue: '2026-11-30', label: 'Seasonal booking' }),
      example('adjacent-months', 'Multiple visible months', 'Both months stay visible while choosing endpoints across the October–November boundary.', { modelValue: { start: '2026-10-28', end: '2026-11-04' }, numberOfMonths: 2, fixedWeeks: true, label: 'Cross-month stay' }),
    ],
  },
  'date-field': {
    description: 'A segmented date input for typing dates and date-times without parsing a free-form string.',
    anatomy: fieldAnatomy,
    capabilities: ['Move between segments with Left and Right; change them with Up and Down.', 'Follow locale-specific segment order.', 'Include time segments when the model contains a date-time.'],
    source: source('date-field'),
    examples: [
      example('keyboard-date', 'Keyboard segment editing', 'Focus a segment and type digits or use Up and Down. Left and Right move between month, day and year.', { modelValue: date, label: 'Appointment date', locale: 'en-US' }),
      example('date-time', 'Date and time granularity', 'A date-time value and minute granularity add hour and minute segments beside the date.', { modelValue: '2026-10-21T14:30:00', granularity: 'minute', hourCycle: 24, label: 'Appointment date and time' }),
      example('localized-entry', 'Locale-aware segment order', 'French formatting presents the same model in day/month/year order.', { modelValue: date, locale: 'fr-FR', label: 'Date du rendez-vous' }),
    ],
  },
  'date-picker': {
    description: 'A segmented date field paired with a popover calendar, allowing typed entry and visual day selection.',
    anatomy: pickerAnatomy,
    capabilities: ['Edit the field or choose the same value from its calendar.', 'Manage focus when opening and closing the popover.', 'Support localized dates and date-times.'],
    source: source('date-picker'),
    examples: [
      example('typed-or-picked', 'Synchronized field and calendar', 'Edit individual segments, then open the calendar to find that same selected day.', { modelValue: date, label: 'Appointment date', triggerLabel: 'Open appointment calendar' }),
      example('booking-limits', 'Shared date bounds', 'Minimum and maximum dates constrain calendar selection and field validity together.', { modelValue: date, minValue: '2026-10-01', maxValue: '2026-11-30', label: 'Booking date' }),
      example('date-and-time', 'Date-time entry', 'The field includes time segments while the calendar remains a convenient way to change the day.', { modelValue: '2026-10-21T14:30:00', granularity: 'minute', hourCycle: 24, label: 'Appointment date and time' }),
    ],
  },
  'date-range-field': {
    description: 'Two sets of date segments in one field for entering the beginning and end of an interval.',
    anatomy: [fieldAnatomy[0]!, { part: 'Start and end inputs', description: 'Each endpoint has independently editable date segments, separated visually.' }],
    capabilities: ['Edit both endpoints with the keyboard.', 'Format both dates using the same locale.', 'Include time segments for date-time intervals.'],
    source: source('date-range-field'),
    examples: [
      example('typed-stay', 'Keyboard editing of both endpoints', 'Move through the start and end segments to edit arrival and departure directly.', { modelValue: range, label: 'Booking dates' }),
      example('meeting-interval', 'Date-time ranges', 'Minute granularity adds times to both endpoints for an interval shorter than a day.', { modelValue: { start: '2026-10-21T09:00:00', end: '2026-10-21T11:30:00' }, granularity: 'minute', hourCycle: 24, label: 'Meeting interval' }),
      example('localized-interval', 'Localized range segments', 'French segment ordering applies consistently to the beginning and end of the range.', { modelValue: range, locale: 'fr-FR', label: 'Dates du séjour' }),
    ],
  },
  'date-range-picker': {
    description: 'A date-range field with a popover calendar for entering or visually choosing both endpoints.',
    anatomy: pickerAnatomy,
    capabilities: ['Synchronize typed endpoints and calendar range selection.', 'Manage popover and calendar focus.', 'Show several months for ranges that cross month boundaries.'],
    source: source('date-range-picker'),
    examples: [
      example('booking-range', 'Typed and visual range selection', 'Open the calendar and choose the start and end days, or edit either endpoint in the field.', { modelValue: range, label: 'Booking dates', triggerLabel: 'Open booking calendar' }),
      example('cross-month', 'Ranges across adjacent months', 'Show two months so both ends of the interval can be selected without paging back and forth.', { modelValue: { start: '2026-10-28', end: '2026-11-04' }, numberOfMonths: 2, fixedWeeks: true, label: 'Cross-month booking' }),
      example('season', 'Shared range bounds', 'The same bounds apply to the field and calendar when choosing dates in the available season.', { modelValue: range, minValue: '2026-10-01', maxValue: '2026-11-30', label: 'Available booking season' }),
    ],
  },
};

for (const id of ['time-field', 'time-range-field']) {
  const isRange = id === 'time-range-field';
  dateGuides[id] = {
    description: isRange ? 'A segmented field for entering a starting and ending time with a shared format.' : 'A segmented time input for entering hours, minutes and optional seconds.',
    anatomy: [
      { part: 'Root', description: 'Coordinates time formatting, bounds and validation state.' },
      { part: isRange ? 'Start and end inputs' : 'Input segments', description: 'Focusable hour, minute and optional second or day-period segments support direct typing.' },
    ],
    capabilities: ['Edit segments with digits and arrow keys.', 'Use either a twelve-hour or twenty-four-hour clock.', 'Choose the precision needed by the task.'],
    source: source(id),
    examples: [
      example('twelve-hour', isRange ? 'Twelve-hour time ranges' : 'Twelve-hour time entry', 'A twelve-hour clock includes a day-period segment. Focus it and use A or P to change the period.', { modelValue: isRange ? { start: '09:30:00', end: '17:00:00' } : '09:30:00', locale: 'en-US', hourCycle: 12, label: isRange ? 'Opening hours' : 'Reminder time' }),
      example('seconds', 'Second-level precision', 'Second granularity exposes an additional segment for precise timing, using a twenty-four-hour clock.', { modelValue: isRange ? { start: '09:30:15', end: '10:00:45' } : '09:30:15', hourCycle: 24, granularity: 'second', label: 'Precise schedule' }),
      example('time-bounds', 'Minimum and maximum times', 'Times before 09:00 or after 18:00 produce invalid state. Bounds express availability rather than silently changing the host schedule.', { modelValue: isRange ? { start: '09:30:00', end: '17:00:00' } : '09:30:00', minValue: '09:00:00', maxValue: '18:00:00', hourCycle: 24, label: 'Office schedule' }),
    ],
  };
}

for (const id of ['month-picker', 'month-range-picker', 'year-picker', 'year-range-picker']) {
  const isYear = id.startsWith('year');
  const isRange = id.includes('range');
  const unit = isYear ? 'year' : 'month';
  const modelValue = isRange ? { start: '2026-01-01', end: isYear ? '2028-01-01' : '2026-06-01' } : '2026-01-01';
  dateGuides[id] = {
    description: `A calendar grid for choosing ${isRange ? `an interval of ${unit}s` : `a ${unit}`} without selecting individual days.`,
    anatomy: [
      { part: 'Root', description: `Coordinates ${unit} selection and the visible page.` },
      { part: 'Header', description: isYear ? 'Previous and next actions page through groups of years.' : 'Previous and next actions move between years.' },
      { part: 'Grid and cells', description: `Focusable ${unit} choices show ${isRange ? 'range endpoints and the intervening period' : 'selected values'}.` },
      { part: 'footer slot', description: 'Adds application context below the grid.' },
    ],
    capabilities: [`Select ${isRange ? `a contiguous ${unit} interval` : `one or several ${unit}s`}.`, 'Navigate choices with managed keyboard focus.', isYear ? 'Choose how many years each page displays.' : 'Use localized month labels.'],
    source: source(id),
    examples: [
      example('report-period', isRange ? `${isYear ? "Year" : "Month"} range selection` : `Single ${unit} selection`, isRange ? `Select the first and last ${unit}; the grid highlights the period between them.` : `Choose the ${unit} directly instead of navigating through days.`, { modelValue, label: 'Reporting period' }),
      example('available-history', 'Bounded period selection', 'Only periods from 2024 through 2029 are available for reporting.', { modelValue, minValue: '2024-01-01', maxValue: '2029-12-31', label: 'Available reports' }),
      isYear
        ? example('year-page', 'Configurable years per page', 'A shorter page offers a focused set of years. Previous and next move through the configured page size.', { modelValue, yearsPerPage: 6, label: 'Reporting years' })
        : example('localized-months', 'Localized month labels', 'Localized month names help readers choose the reporting period in their familiar language.', { modelValue, locale: 'fr-FR', label: 'Période du rapport' }),
      ...(!isRange ? [example('comparison-periods', `Multiple ${unit} selection`, `Select several non-adjacent ${unit}s. The array model represents separate comparisons rather than a continuous range.`, { modelValue: ['2025-01-01', isYear ? '2027-01-01' : '2025-06-01'], multiple: true, label: 'Comparison periods' })] : []),
    ],
  };
}
