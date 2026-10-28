# FrameRangeCalendar

An inline calendar for choosing a start and end date, with the intervening range shown in the grid.

## Features

### Anatomy

- **Root**: Coordinates selection, the visible period and keyboard focus.
- **Header**: Previous and next buttons flank the period heading.
- **Grid and cells**: Rows contain focusable day choices and their selection states.
- **footer slot**: Adds application help below the calendar.

- Select range endpoints through the calendar grid.
- Navigate days and months without a pointer.
- Share locale, bounds and focus behavior across the interval.

[Underlying Reka reference](https://reka-ui.com/docs/components/range-calendar). Frame exposes the contract documented below.

### Range selection

Select the first day, then the last day. The highlighted interval makes the full stay visible.

<!-- frame:example id="range-calendar.stay-dates" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRangeCalendar, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-21"), end: parseDate("2026-10-26") });
</script>
<template>
<FrameRangeCalendar v-model="demoModelValue" :label="&quot;Stay dates&quot;" />
</template>
```

### Minimum and maximum dates

Dates outside October and November are disabled. Try choosing an endpoint beyond the available season.

<!-- frame:example id="range-calendar.bounded-stay" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRangeCalendar, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-21"), end: parseDate("2026-10-26") });
const demoMinValue = parseDate("2026-10-01");
const demoMaxValue = parseDate("2026-11-30");
</script>
<template>
<FrameRangeCalendar v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :label="&quot;Seasonal booking&quot;" />
</template>
```

### Multiple visible months

Both months stay visible while choosing endpoints across the October–November boundary.

<!-- frame:example id="range-calendar.adjacent-months" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameRangeCalendar, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-28"), end: parseDate("2026-11-04") });
const demoNumberOfMonths = 2;
const demoFixedWeeks = true;
</script>
<template>
<FrameRangeCalendar v-model="demoModelValue" :number-of-months="demoNumberOfMonths" :fixed-weeks="demoFixedWeeks" :label="&quot;Cross-month stay&quot;" />
</template>
```

## APIs

<!-- frame:generated api="range-calendar" -->

### FrameRangeCalendar

Source: `packages/core/src/components/forms/dates-and-times/FrameRangeCalendar.vue`

#### Properties

| Name                            | Type                                                   | Default | Description                                                                                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultPlaceholder`            | `DateValue \| undefined`                               | Omitted | The default placeholder date                                                                                                                                                                                   |
| `defaultValue`                  | `DateRange \| undefined`                               | Omitted | The default value for the calendar                                                                                                                                                                             |
| `modelValue`                    | `DateRange \| null \| undefined`                       | Omitted | The controlled selected date range of the calendar. Can be bound as `v-model`.                                                                                                                                 |
| `placeholder`                   | `DateValue \| undefined`                               | Omitted | The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programmatically control the calendar view |
| `allowNonContiguousRanges`      | `boolean \| undefined`                                 | false   | When combined with `isDateUnavailable`, determines whether non-contiguous ranges, i.e. ranges containing unavailable dates, may be selected.                                                                   |
| `pagedNavigation`               | `boolean \| undefined`                                 | false   | This property causes the previous and next buttons to navigate by the number of months displayed at once, rather than one month                                                                                |
| `preventDeselect`               | `boolean \| undefined`                                 | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                                |
| `maximumDays`                   | `number \| undefined`                                  | Omitted | The maximum number of days that can be selected in a range                                                                                                                                                     |
| `weekStartsOn`                  | `WeekStartsOn \| undefined`                            | Omitted | The day of the week to start the calendar on                                                                                                                                                                   |
| `weekdayFormat`                 | `WeekDayFormat \| undefined`                           | Omitted | The format to use for the weekday strings provided via the weekdays slot prop                                                                                                                                  |
| `calendarLabel`                 | `string \| undefined`                                  | Omitted | The accessible label for the calendar                                                                                                                                                                          |
| `fixedWeeks`                    | `boolean \| undefined`                                 | false   | Whether or not to always display 6 weeks in the calendar                                                                                                                                                       |
| `maxValue`                      | `DateValue \| undefined`                               | Omitted | The maximum date that can be selected                                                                                                                                                                          |
| `minValue`                      | `DateValue \| undefined`                               | Omitted | The minimum date that can be selected                                                                                                                                                                          |
| `locale`                        | `string \| undefined`                                  | Omitted | The locale to use for formatting dates                                                                                                                                                                         |
| `numberOfMonths`                | `number \| undefined`                                  | Omitted | The number of months to display at once                                                                                                                                                                        |
| `disabled`                      | `boolean \| undefined`                                 | false   | Whether or not the calendar is disabled                                                                                                                                                                        |
| `readonly`                      | `boolean \| undefined`                                 | false   | Whether or not the calendar is readonly                                                                                                                                                                        |
| `initialFocus`                  | `boolean \| undefined`                                 | false   | If true, the calendar will focus the selected day, today, or the first day of the month depending on what is visible when the calendar is mounted                                                              |
| `isDateDisabled`                | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a date is disabled                                                                                                                                                      |
| `isDateUnavailable`             | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a date is unavailable                                                                                                                                                   |
| `isDateHighlightable`           | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a date is hightable                                                                                                                                                     |
| `dir`                           | `Direction \| undefined`                               | Omitted | The reading direction of the calendar when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                                   |
| `nextPage`                      | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the next page of the calendar. It receives the current placeholder as an argument inside the component.                                                                                |
| `prevPage`                      | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the previous page of the calendar. It receives the current placeholder as an argument inside the component.                                                                            |
| `disableDaysOutsideCurrentView` | `boolean \| undefined`                                 | false   | Whether or not to disable days outside the current view.                                                                                                                                                       |
| `fixedDate`                     | `"start" \| "end" \| undefined`                        | Omitted | Which part of the range should be fixed                                                                                                                                                                        |
| `asChild`                       | `boolean \| undefined`                                 | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.           |
| `as`                            | `Component \| AsTag \| undefined`                      | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                                 |
| `label`                         | `string \| undefined`                                  | Omitted | Accessible name of the date or time control.                                                                                                                                                                   |

#### Events

| Name                     | Parameters                     | Return type | Description                                                 |
| ------------------------ | ------------------------------ | ----------- | ----------------------------------------------------------- |
| `update:modelValue`      | `date: DateRange`              | `void`      | Event handler called whenever the model value changes       |
| `update:placeholder`     | `date: DateValue`              | `void`      | Event handler called whenever the placeholder value changes |
| `update:validModelValue` | `date: DateRange`              | `void`      | Event handler called whenever there is a new validModel     |
| `update:startValue`      | `date: DateValue \| undefined` | `void`      | Event handler called whenever the start value changes       |

#### Slots

| Name     | Parameters | Return type  | Description                                 |
| -------- | ---------- | ------------ | ------------------------------------------- |
| `footer` | `None`     | `VNodeChild` | Additional content below the calendar grid. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="range-calendar" -->

| CSS variable                | Theme path                | Default expression                        | Purpose                                                                                                                    | Context                                                                                                      |
| --------------------------- | ------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--frame-font-body`         | `frame.font.body`         | No declared default; supplied by context. | Primary font family inherited by shell content and ordinary controls.                                                      | `.frame-date-text`                                                                                           |
| `--frame-font-size-body`    | `frame.font.size.body`    | No declared default; supplied by context. | Base text size inherited by shell content and ordinary controls.                                                           | `.frame-date-text`                                                                                           |
| `--frame-text`              | `frame.text`              | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.                                       | `.frame-date-text`                                                                                           |
| `--frame-gap`               | `frame.gap`               | No declared default; supplied by context. | Standard space between related content items and control children.                                                         | `.frame-calendar`                                                                                            |
| `--frame-content-padding`   | `frame.content.padding`   | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                                            | `.frame-calendar`                                                                                            |
| `--frame-surface`           | `frame.surface`           | No declared default; supplied by context. | Neutral raised surface behind grouped content and control compositions.                                                    | `.frame-calendar`                                                                                            |
| `--frame-line`              | `frame.line`              | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                                           | `.frame-calendar`                                                                                            |
| `--frame-control-radius`    | `frame.control.radius`    | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-calendar`                                                                                            |
| `--frame-gap`               | `frame.gap`               | No declared default; supplied by context. | Standard space between related content items and control children.                                                         | `.frame-date-header`                                                                                         |
| `--frame-content-padding`   | `frame.content.padding`   | No declared default; supplied by context. | Standard inset around content in panels, disclosures, and application surfaces.                                            | `.frame-date-months`                                                                                         |
| `--frame-muted`             | `frame.muted`             | No declared default; supplied by context. | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-weekday`                                                                                        |
| `--frame-control-padding-y` | `frame.control.padding.y` | No declared default; supplied by context. | Vertical inset inside ordinary controls and text-entry surfaces.                                                           | `.frame-date-weekday`                                                                                        |
| `--frame-control-radius`    | `frame.control.radius`    | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-y` | `frame.control.padding.y` | No declared default; supplied by context. | Vertical inset inside ordinary controls and text-entry surfaces.                                                           | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-x` | `frame.control.padding.x` | No declared default; supplied by context. | Horizontal inset inside ordinary controls and text-entry surfaces.                                                         | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-menu-hover`        | `frame.menu.hover`        | No declared default; supplied by context. | Neutral hover and highlight fill for ordinary menu rows.                                                                   | `.frame-date-day:hover, .frame-date-nav:hover`                                                               |
| `--frame-accent`            | `frame.accent`            | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day:focus-visible, .frame-date-nav:focus-visible, .frame-date-segment:focus-visible`            |
| `--frame-accent-foreground` | `frame.accent.foreground` | `#fff`                                    | Foreground for .frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]. | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`            | `frame.accent`            | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`            | `frame.accent`            | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-highlighted]`                                                                          |
| `--frame-accent`            | `frame.accent`            | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-today]`                                                                                |
| `--frame-muted`             | `frame.muted`             | No declared default; supplied by context. | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-day[data-outside-view]`                                                                         |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
