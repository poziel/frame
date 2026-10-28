# FrameMonthPicker

A calendar grid for choosing a month without selecting individual days.

## Features

### Anatomy

- **Root**: Coordinates month selection and the visible page.
- **Header**: Previous and next actions move between years.
- **Grid and cells**: Focusable month choices show selected values.
- **footer slot**: Adds application context below the grid.

- Select one or several months.
- Navigate choices with managed keyboard focus.
- Use localized month labels.

[Underlying Reka reference](https://reka-ui.com/docs/components/month-picker). Frame exposes the contract documented below.

### Single month selection

Choose the month directly instead of navigating through days.

<!-- frame:example id="month-picker.report-period" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMonthPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
</script>
<template>
<FrameMonthPicker v-model="demoModelValue" :label="&quot;Reporting period&quot;" />
</template>
```

### Bounded period selection

Only periods from 2024 through 2029 are available for reporting.

<!-- frame:example id="month-picker.available-history" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMonthPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
const demoMinValue = parseDate("2024-01-01");
const demoMaxValue = parseDate("2029-12-31");
</script>
<template>
<FrameMonthPicker v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :label="&quot;Available reports&quot;" />
</template>
```

### Localized month labels

Localized month names help readers choose the reporting period in their familiar language.

<!-- frame:example id="month-picker.localized-months" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMonthPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-01-01"));
</script>
<template>
<FrameMonthPicker v-model="demoModelValue" :locale="&quot;fr-FR&quot;" :label="&quot;Période du rapport&quot;" />
</template>
```

### Multiple month selection

Select several non-adjacent months. The array model represents separate comparisons rather than a continuous range.

<!-- frame:example id="month-picker.comparison-periods" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameMonthPicker, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>([parseDate("2025-01-01"), parseDate("2025-06-01")]);
const demoMultiple = true;
</script>
<template>
<FrameMonthPicker v-model="demoModelValue" :multiple="demoMultiple" :label="&quot;Comparison periods&quot;" />
</template>
```

## APIs

<!-- frame:generated api="month-picker" -->

### FrameMonthPicker

Source: `packages/core/src/components/forms/dates-and-times/FrameMonthPicker.vue`

#### Properties

| Name                 | Type                                                   | Default | Description                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue`       | `DateValue \| undefined`                               | Omitted | The default value for the month picker                                                                                                                                                               |
| `defaultPlaceholder` | `DateValue \| undefined`                               | Omitted | The default placeholder date                                                                                                                                                                         |
| `placeholder`        | `DateValue \| undefined`                               | Omitted | The placeholder date, which is used to determine what year to display when no date is selected                                                                                                       |
| `preventDeselect`    | `boolean \| undefined`                                 | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                      |
| `calendarLabel`      | `string \| undefined`                                  | Omitted | The accessible label for the month picker                                                                                                                                                            |
| `maxValue`           | `DateValue \| undefined`                               | Omitted | The maximum date that can be selected                                                                                                                                                                |
| `minValue`           | `DateValue \| undefined`                               | Omitted | The minimum date that can be selected                                                                                                                                                                |
| `locale`             | `string \| undefined`                                  | Omitted | The locale to use for formatting dates                                                                                                                                                               |
| `disabled`           | `boolean \| undefined`                                 | false   | Whether the month picker is disabled                                                                                                                                                                 |
| `readonly`           | `boolean \| undefined`                                 | false   | Whether the month picker is readonly                                                                                                                                                                 |
| `initialFocus`       | `boolean \| undefined`                                 | false   | If true, the month picker will focus the selected month, today, or the first month of the year on mount                                                                                              |
| `isMonthDisabled`    | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a month is disabled                                                                                                                                           |
| `isMonthUnavailable` | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a month is unavailable                                                                                                                                        |
| `dir`                | `Direction \| undefined`                               | Omitted | The reading direction of the calendar when applicable. If omitted, inherits globally from `ConfigProvider` or assumes LTR.                                                                           |
| `nextPage`           | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the next page of the month picker. Receives the current placeholder as an argument.                                                                                          |
| `prevPage`           | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the previous page of the month picker. Receives the current placeholder as an argument.                                                                                      |
| `modelValue`         | `DateValue \| DateValue[] \| null \| undefined`        | Omitted | The controlled selected month value of the month picker. Can be bound as `v-model`.                                                                                                                  |
| `multiple`           | `boolean \| undefined`                                 | false   | Whether multiple months can be selected                                                                                                                                                              |
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

<!-- frame:generated styles="month-picker" -->

| CSS variable                | Theme path                | Default expression                       | Purpose                                                                                                      | Context                                                                                                      |
| --------------------------- | ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `--frame-font-body`         | `frame.font.body`         | `"Segoe UI", sans-serif`                 | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-calendar, .frame-date-field, .frame-date-popover`                                                    |
| `--frame-font-size-body`    | `frame.font.size.body`    | `12px`                                   | Base text size inherited by shell content and ordinary controls.                                             | `.frame-calendar, .frame-date-field, .frame-date-popover`                                                    |
| `--frame-text`              | `frame.text`              | `#cccccc`                                | Primary foreground for readable text and icons across shell and application content.                         | `.frame-calendar, .frame-date-field, .frame-date-popover`                                                    |
| `--frame-gap`               | `frame.gap`               | `calc(var(--frame-spacing-unit) * 1.5)`  | Standard space between related content items and control children.                                           | `.frame-calendar`                                                                                            |
| `--frame-content-padding`   | `frame.content.padding`   | `calc(var(--frame-spacing-unit) * 3)`    | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-calendar`                                                                                            |
| `--frame-surface`           | `frame.surface`           | `#181818`                                | Neutral raised surface behind grouped content and control compositions.                                      | `.frame-calendar`                                                                                            |
| `--frame-line`              | `frame.line`              | `#2b2b2b`                                | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-calendar`                                                                                            |
| `--frame-control-radius`    | `frame.control.radius`    | `var(--frame-radius-medium)`             | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-calendar`                                                                                            |
| `--frame-gap`               | `frame.gap`               | `calc(var(--frame-spacing-unit) * 1.5)`  | Standard space between related content items and control children.                                           | `.frame-date-header`                                                                                         |
| `--frame-content-padding`   | `frame.content.padding`   | `calc(var(--frame-spacing-unit) * 3)`    | Standard inset around content in panels, disclosures, and application surfaces.                              | `.frame-date-months`                                                                                         |
| `--frame-control-radius`    | `frame.control.radius`    | `var(--frame-radius-medium)`             | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-y` | `frame.control.padding.y` | `calc(var(--frame-spacing-unit) * 1.25)` | Vertical inset inside ordinary controls and text-entry surfaces.                                             | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-x` | `frame.control.padding.x` | `calc(var(--frame-spacing-unit) * 2.5)`  | Horizontal inset inside ordinary controls and text-entry surfaces.                                           | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-menu-hover`        | `frame.menu.hover`        | `#303336`                                | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-date-day:hover, .frame-date-nav:hover`                                                               |
| `--frame-accent`            | `frame.accent`            | `#0078d4`                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-day:focus-visible, .frame-date-nav:focus-visible, .frame-date-segment:focus-visible`            |
| `--frame-accent-foreground` | `frame.accent.foreground` | `#fff`                                   | Foreground of the selected date and the date-range endpoints.                                                | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`            | `frame.accent`            | `#0078d4`                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`            | `frame.accent`            | `#0078d4`                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-day[data-highlighted]`                                                                          |
| `--frame-accent`            | `frame.accent`            | `#0078d4`                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-day[data-today]`                                                                                |
| `--frame-muted`             | `frame.muted`             | `#8e9496`                                | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-date-day[data-outside-view]`                                                                         |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
