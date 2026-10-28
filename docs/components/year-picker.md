# FrameYearPicker

A calendar grid for choosing a year without selecting individual days.

## Features

### Anatomy

- **Root**: Coordinates year selection and the visible page.
- **Header**: Previous and next actions page through groups of years.
- **Grid and cells**: Focusable year choices show selected values.
- **footer slot**: Adds application context below the grid.

- Select one or several years.
- Navigate choices with managed keyboard focus.
- Choose how many years each page displays.

[Underlying Reka reference](https://reka-ui.com/docs/components/year-picker). Frame exposes the contract documented below.

### Single year selection

Choose the year directly instead of navigating through days.

<!-- frame:example id="year-picker.report-period" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
</script>
<template>
<FrameYearPicker v-model="demoModelValue" :label="&quot;Reporting period&quot;" />
</template>
```

### Bounded period selection

Only periods from 2024 through 2029 are available for reporting.

<!-- frame:example id="year-picker.available-history" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
const demoMinValue = parseDate("2024-01-01");
const demoMaxValue = parseDate("2029-12-31");
</script>
<template>
<FrameYearPicker v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :label="&quot;Available reports&quot;" />
</template>
```

### Configurable years per page

A shorter page offers a focused set of years. Previous and next move through the configured page size.

<!-- frame:example id="year-picker.year-page" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
const demoYearsPerPage = 6;
</script>
<template>
<FrameYearPicker v-model="demoModelValue" :years-per-page="demoYearsPerPage" :label="&quot;Reporting years&quot;" />
</template>
```

### Multiple year selection

Select several non-adjacent years. The array model represents separate comparisons rather than a continuous range.

<!-- frame:example id="year-picker.comparison-periods" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameYearPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>([parseDate("2025-01-01"), parseDate("2027-01-01")]);
const demoMultiple = true;
</script>
<template>
<FrameYearPicker v-model="demoModelValue" :multiple="demoMultiple" :label="&quot;Comparison periods&quot;" />
</template>
```

## APIs

<!-- frame:generated api="year-picker" -->

### FrameYearPicker

Source: `packages/core/src/components/forms/dates-and-times/FrameYearPicker.vue`

#### Properties

| Name                 | Type                                                   | Default | Description                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue`       | `DateValue \| undefined`                               | Omitted | The default value for the year picker                                                                                                                                                                |
| `defaultPlaceholder` | `DateValue \| undefined`                               | Omitted | The default placeholder date                                                                                                                                                                         |
| `placeholder`        | `DateValue \| undefined`                               | Omitted | The placeholder date, which is used to determine what year range to display when no date is selected                                                                                                 |
| `preventDeselect`    | `boolean \| undefined`                                 | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                      |
| `calendarLabel`      | `string \| undefined`                                  | Omitted | The accessible label for the year picker                                                                                                                                                             |
| `maxValue`           | `DateValue \| undefined`                               | Omitted | The maximum date that can be selected                                                                                                                                                                |
| `minValue`           | `DateValue \| undefined`                               | Omitted | The minimum date that can be selected                                                                                                                                                                |
| `locale`             | `string \| undefined`                                  | Omitted | The locale to use for formatting dates                                                                                                                                                               |
| `disabled`           | `boolean \| undefined`                                 | false   | Whether the year picker is disabled                                                                                                                                                                  |
| `readonly`           | `boolean \| undefined`                                 | false   | Whether the year picker is readonly                                                                                                                                                                  |
| `initialFocus`       | `boolean \| undefined`                                 | false   | If true, the year picker will focus the selected year, today, or the first year of the range on mount                                                                                                |
| `isYearDisabled`     | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a year is disabled                                                                                                                                            |
| `isYearUnavailable`  | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a year is unavailable                                                                                                                                         |
| `dir`                | `Direction \| undefined`                               | Omitted | The reading direction of the calendar when applicable. If omitted, inherits globally from `ConfigProvider` or assumes LTR.                                                                           |
| `nextPage`           | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the next page of the year picker. Receives the current placeholder as an argument.                                                                                           |
| `prevPage`           | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the previous page of the year picker. Receives the current placeholder as an argument.                                                                                       |
| `modelValue`         | `DateValue \| DateValue[] \| null \| undefined`        | Omitted | The controlled selected year value of the year picker. Can be bound as `v-model`.                                                                                                                    |
| `multiple`           | `boolean \| undefined`                                 | false   | Whether multiple years can be selected                                                                                                                                                               |
| `yearsPerPage`       | `number \| undefined`                                  | Omitted | Number of years to display per page                                                                                                                                                                  |
| `asChild`            | `boolean \| undefined`                                 | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                 | `Component \| AsTag \| undefined`                      | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `label`              | `string \| undefined`                                  | Omitted | Accessible name of the date or time control.                                                                                                                                                         |

#### Events

| Name                 | Parameters                                    | Return type | Description                                                 |
| -------------------- | --------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `update:modelValue`  | `date: DateValue \| DateValue[] \| undefined` | `void`      | Event handler called whenever the model value changes       |
| `update:placeholder` | `date: DateValue`                             | `void`      | Event handler called whenever the placeholder value changes |

#### Slots

| Name     | Parameters | Return type  | Description                                 |
| -------- | ---------- | ------------ | ------------------------------------------- |
| `footer` | `None`     | `VNodeChild` | Additional content below the calendar grid. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="year-picker" -->

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
