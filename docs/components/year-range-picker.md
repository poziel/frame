# FrameYearRangePicker

A calendar grid for choosing an interval of years without selecting individual days.

## Features

### Anatomy

- **Root**: Coordinates year selection and the visible page.
- **Header**: Previous and next actions page through groups of years.
- **Grid and cells**: Focusable year choices show range endpoints and the intervening period.
- **footer slot**: Adds application context below the grid.

- Select a contiguous year interval.
- Navigate choices with managed keyboard focus.
- Choose how many years each page displays.

[Underlying Reka reference](https://reka-ui.com/docs/components/year-range-picker). Frame exposes the contract documented below.

### Year range selection

Select the first and last year; the grid highlights the period between them.

<!-- frame:example id="year-range-picker.report-period" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-01-01"), end: parseDate("2028-01-01") });
</script>
<template>
<FrameYearRangePicker v-model="demoModelValue" :label="&quot;Reporting period&quot;" />
</template>
```

### Bounded period selection

Only periods from 2024 through 2029 are available for reporting.

<!-- frame:example id="year-range-picker.available-history" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-01-01"), end: parseDate("2028-01-01") });
const demoMinValue = parseDate("2024-01-01");
const demoMaxValue = parseDate("2029-12-31");
</script>
<template>
<FrameYearRangePicker v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :label="&quot;Available reports&quot;" />
</template>
```

### Configurable years per page

A shorter page offers a focused set of years. Previous and next move through the configured page size.

<!-- frame:example id="year-range-picker.year-page" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-01-01"), end: parseDate("2028-01-01") });
const demoYearsPerPage = 6;
</script>
<template>
<FrameYearRangePicker v-model="demoModelValue" :years-per-page="demoYearsPerPage" :label="&quot;Reporting years&quot;" />
</template>
```

## APIs

<!-- frame:generated api="year-range-picker" -->

### FrameYearRangePicker

Source: `packages/core/src/components/forms/dates-and-times/FrameYearRangePicker.vue`

#### Properties

| Name                       | Type                                                   | Default | Description                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultPlaceholder`       | `DateValue \| undefined`                               | Omitted | The default placeholder date                                                                                                                                                                         |
| `defaultValue`             | `DateRange \| undefined`                               | Omitted | The default value for the calendar                                                                                                                                                                   |
| `modelValue`               | `DateRange \| null \| undefined`                       | Omitted | The controlled selected year range of the year range picker. Can be bound as `v-model`.                                                                                                              |
| `placeholder`              | `DateValue \| undefined`                               | Omitted | The placeholder date, which is used to determine what year range to display when no date is selected.                                                                                                |
| `allowNonContiguousRanges` | `boolean \| undefined`                                 | false   | When combined with `isYearUnavailable`, determines whether non-contiguous ranges may be selected.                                                                                                    |
| `preventDeselect`          | `boolean \| undefined`                                 | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                      |
| `maximumYears`             | `number \| undefined`                                  | Omitted | The maximum number of years that can be selected in a range                                                                                                                                          |
| `calendarLabel`            | `string \| undefined`                                  | Omitted | The accessible label for the calendar                                                                                                                                                                |
| `maxValue`                 | `DateValue \| undefined`                               | Omitted | The maximum date that can be selected                                                                                                                                                                |
| `minValue`                 | `DateValue \| undefined`                               | Omitted | The minimum date that can be selected                                                                                                                                                                |
| `locale`                   | `string \| undefined`                                  | Omitted | The locale to use for formatting dates                                                                                                                                                               |
| `disabled`                 | `boolean \| undefined`                                 | false   | Whether or not the calendar is disabled                                                                                                                                                              |
| `readonly`                 | `boolean \| undefined`                                 | false   | Whether or not the calendar is readonly                                                                                                                                                              |
| `initialFocus`             | `boolean \| undefined`                                 | false   | If true, the calendar will focus the selected year on mount                                                                                                                                          |
| `isYearDisabled`           | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a year is disabled                                                                                                                                            |
| `isYearUnavailable`        | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a year is unavailable                                                                                                                                         |
| `dir`                      | `Direction \| undefined`                               | Omitted | The reading direction of the calendar when applicable.                                                                                                                                               |
| `nextPage`                 | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the next page of the calendar.                                                                                                                                               |
| `prevPage`                 | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the previous page of the calendar.                                                                                                                                           |
| `fixedDate`                | `"start" \| "end" \| undefined`                        | Omitted | Which part of the range should be fixed                                                                                                                                                              |
| `yearsPerPage`             | `number \| undefined`                                  | Omitted | Number of years to display per page                                                                                                                                                                  |
| `asChild`                  | `boolean \| undefined`                                 | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                       | `Component \| AsTag \| undefined`                      | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `label`                    | `string \| undefined`                                  | Omitted | Accessible name of the date or time control.                                                                                                                                                         |

#### Events

| Name                 | Parameters                     | Return type | Description                                                 |
| -------------------- | ------------------------------ | ----------- | ----------------------------------------------------------- |
| `update:modelValue`  | `date: DateRange`              | `void`      | Event handler called whenever the model value changes       |
| `update:placeholder` | `date: DateValue`              | `void`      | Event handler called whenever the placeholder value changes |
| `update:startValue`  | `date: DateValue \| undefined` | `void`      | Event handler called whenever the start value changes       |

#### Slots

| Name     | Parameters | Return type  | Description                                 |
| -------- | ---------- | ------------ | ------------------------------------------- |
| `footer` | `None`     | `VNodeChild` | Additional content below the calendar grid. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="year-range-picker" -->

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
