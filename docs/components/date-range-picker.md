# FrameDateRangePicker

A date-range field with a popover calendar for entering or visually choosing both endpoints.

## Features

### Anatomy

- **Field and inputs**: Editable date segments share the selected value with the calendar.
- **Trigger and content**: The field button opens an anchored calendar popover.
- **Calendar**: Navigation, heading and day grid support visual selection.
- **footer slot**: Adds help inside the calendar content.

- Synchronize typed endpoints and calendar range selection.
- Manage popover and calendar focus.
- Show several months for ranges that cross month boundaries.

[Underlying Reka reference](https://reka-ui.com/docs/components/date-range-picker). Frame exposes the contract documented below.

### Typed and visual range selection

Open the calendar and choose the start and end days, or edit either endpoint in the field.

<!-- frame:example id="date-range-picker.booking-range" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-21"), end: parseDate("2026-10-26") });
</script>
<template>
<FrameDateRangePicker v-model="demoModelValue" :label="&quot;Booking dates&quot;" :trigger-label="&quot;Open booking calendar&quot;" />
</template>
```

### Ranges across adjacent months

Show two months so both ends of the interval can be selected without paging back and forth.

<!-- frame:example id="date-range-picker.cross-month" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-28"), end: parseDate("2026-11-04") });
const demoNumberOfMonths = 2;
const demoFixedWeeks = true;
</script>
<template>
<FrameDateRangePicker v-model="demoModelValue" :number-of-months="demoNumberOfMonths" :fixed-weeks="demoFixedWeeks" :label="&quot;Cross-month booking&quot;" />
</template>
```

### Shared range bounds

The same bounds apply to the field and calendar when choosing dates in the available season.

<!-- frame:example id="date-range-picker.season" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateRangePicker, parseDate, type DateRange } from '@frame/core';
const demoModelValue = shallowRef<DateRange | null>({ start: parseDate("2026-10-21"), end: parseDate("2026-10-26") });
const demoMinValue = parseDate("2026-10-01");
const demoMaxValue = parseDate("2026-11-30");
</script>
<template>
<FrameDateRangePicker v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :label="&quot;Available booking season&quot;" />
</template>
```

## APIs

<!-- frame:generated api="date-range-picker" -->

### FrameDateRangePicker

Source: `packages/core/src/components/forms/dates-and-times/FrameDateRangePicker.vue`

#### Properties

| Name                       | Type                             | Default | Description                                                                                                                                                                                                                      |
| -------------------------- | -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`               | `DateRange \| null \| undefined` | Omitted | The controlled value of the field. Can be bound as `v-model`.                                                                                                                                                                    |
| `disabled`                 | `boolean \| undefined`           | false   | Whether or not the date field is disabled                                                                                                                                                                                        |
| `name`                     | `string \| undefined`            | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                                              |
| `required`                 | `boolean \| undefined`           | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                                                 |
| `placeholder`              | `DateValue \| undefined`         | Omitted | The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programmatically control the calendar view                   |
| `defaultValue`             | `DateRange \| undefined`         | Omitted | The default value for the calendar                                                                                                                                                                                               |
| `dir`                      | `Direction \| undefined`         | Omitted | The reading direction of the date field when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                                                   |
| `step`                     | `DateStep \| undefined`          | Omitted | The stepping interval for the time fields. Defaults to `1`.                                                                                                                                                                      |
| `id`                       | `string \| undefined`            | Omitted | Id of the element                                                                                                                                                                                                                |
| `readonly`                 | `boolean \| undefined`           | false   | Whether or not the date field is readonly                                                                                                                                                                                        |
| `locale`                   | `string \| undefined`            | Omitted | The locale to use for formatting dates                                                                                                                                                                                           |
| `defaultPlaceholder`       | `DateValue \| undefined`         | Omitted | The default placeholder date                                                                                                                                                                                                     |
| `maxValue`                 | `DateValue \| undefined`         | Omitted | The maximum date that can be selected                                                                                                                                                                                            |
| `minValue`                 | `DateValue \| undefined`         | Omitted | The minimum date that can be selected                                                                                                                                                                                            |
| `isDateUnavailable`        | `Matcher \| undefined`           | Omitted | A function that returns whether or not a date is unavailable                                                                                                                                                                     |
| `hourCycle`                | `HourCycle`                      | Omitted | The hour cycle used for formatting times. Defaults to the local preference                                                                                                                                                       |
| `granularity`              | `Granularity \| undefined`       | Omitted | The granularity to use for formatting times. Defaults to day if a CalendarDate is provided, otherwise defaults to minute. The field will render segments for each part of the date up to and including the specified granularity |
| `hideTimeZone`             | `boolean \| undefined`           | false   | Whether or not to hide the time zone segment of the field                                                                                                                                                                        |
| `defaultOpen`              | `boolean \| undefined`           | false   | The open state of the popover when it is initially rendered. Use when you do not need to control its open state.                                                                                                                 |
| `open`                     | `boolean \| undefined`           | false   | The controlled open state of the popover.                                                                                                                                                                                        |
| `modal`                    | `boolean \| undefined`           | false   | The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers. defaultValue: false                                                |
| `numberOfMonths`           | `number \| undefined`            | Omitted | The number of months to display at once                                                                                                                                                                                          |
| `pagedNavigation`          | `boolean \| undefined`           | false   | This property causes the previous and next buttons to navigate by the number of months displayed at once, rather than one month                                                                                                  |
| `preventDeselect`          | `boolean \| undefined`           | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                                                  |
| `weekStartsOn`             | `WeekStartsOn \| undefined`      | Omitted | The day of the week to start the calendar on                                                                                                                                                                                     |
| `weekdayFormat`            | `WeekDayFormat \| undefined`     | Omitted | The format to use for the weekday strings provided via the weekdays slot prop                                                                                                                                                    |
| `fixedWeeks`               | `boolean \| undefined`           | false   | Whether or not to always display 6 weeks in the calendar                                                                                                                                                                         |
| `isDateDisabled`           | `Matcher \| undefined`           | Omitted | A function that returns whether or not a date is disabled                                                                                                                                                                        |
| `allowNonContiguousRanges` | `boolean \| undefined`           | false   | When combined with `isDateUnavailable`, determines whether non-contiguous ranges, i.e. ranges containing unavailable dates, may be selected.                                                                                     |
| `maximumDays`              | `number \| undefined`            | Omitted | The maximum number of days that can be selected in a range                                                                                                                                                                       |
| `isDateHighlightable`      | `Matcher \| undefined`           | Omitted | A function that returns whether or not a date is hightable                                                                                                                                                                       |
| `fixedDate`                | `"start" \| "end" \| undefined`  | Omitted | Which part of the range should be fixed                                                                                                                                                                                          |
| `closeOnSelect`            | `boolean \| undefined`           | false   | Whether or not to close the popover on range select                                                                                                                                                                              |
| `label`                    | `string \| undefined`            | Omitted | Accessible name of the date or time control.                                                                                                                                                                                     |
| `triggerLabel`             | `string \| undefined`            | Omitted | Accessible name of the button that opens the calendar.                                                                                                                                                                           |

#### Events

| Name                 | Parameters                     | Return type | Description                                                      |
| -------------------- | ------------------------------ | ----------- | ---------------------------------------------------------------- |
| `update:modelValue`  | `date: DateRange`              | `void`      | Event handler called whenever the model value changes            |
| `update:open`        | `value: boolean`               | `void`      | Event handler called when the open state of the popover changes. |
| `update:placeholder` | `date: DateValue`              | `void`      | Event handler called whenever the placeholder value changes      |
| `update:startValue`  | `date: DateValue \| undefined` | `void`      | Event handler called whenever the start value changes            |

#### Slots

| Name     | Parameters | Return type  | Description                                 |
| -------- | ---------- | ------------ | ------------------------------------------- |
| `footer` | `None`     | `VNodeChild` | Additional content below the calendar grid. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="date-range-picker" -->

| CSS variable                        | Theme path                        | Default expression                                                                       | Purpose                                                                                                                    | Context                                                                                                      |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `--frame-input-border`              | `frame.input.border`              | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                                                            | `.frame-date-field`                                                                                          |
| `--frame-date-field-border`         | `frame.date.field.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the date-field text surface.                                                                             | `.frame-date-field`                                                                                          |
| `--frame-control-border`            | `frame.control.border`            | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.                                        | `.frame-date-field`                                                                                          |
| `--frame-date-field-border-radius`  | `frame.date.field.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the date-field text surface.                                                                              | `.frame-date-field`                                                                                          |
| `--frame-input-radius`              | `frame.input.radius`              | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                                    | `.frame-date-field`                                                                                          |
| `--frame-input-hover-border`        | `frame.input.hover.border`        | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                                                         | `.frame-date-field`                                                                                          |
| `--frame-date-field-hover-border`   | `frame.date.field.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the date-field text surface.                                                            | `.frame-date-field`                                                                                          |
| `--frame-input-hover-outline`       | `frame.input.hover.outline`       | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                                                        | `.frame-date-field`                                                                                          |
| `--frame-date-field-hover-outline`  | `frame.date.field.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the date-field text surface.                                                           | `.frame-date-field`                                                                                          |
| `--frame-input-focus-border`        | `frame.input.focus.border`        | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                                                                 | `.frame-date-field`                                                                                          |
| `--frame-date-field-focus-border`   | `frame.date.field.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the date-field text surface.                                                     | `.frame-date-field`                                                                                          |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-field`                                                                                          |
| `--frame-input-focus-outline`       | `frame.input.focus.outline`       | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                                                             | `.frame-date-field`                                                                                          |
| `--frame-date-field-focus-outline`  | `frame.date.field.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the date-field text surface.                                                    | `.frame-date-field`                                                                                          |
| `--frame-input-outline-offset`      | `frame.input.outline.offset`      | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                                                               | `.frame-date-field`                                                                                          |
| `--frame-date-field-outline-offset` | `frame.date.field.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the date-field text surface.                                                       | `.frame-date-field`                                                                                          |
| `--frame-font-body`                 | `frame.font.body`                 | No declared default; supplied by context.                                                | Primary font family inherited by shell content and ordinary controls.                                                      | `.frame-date-text`                                                                                           |
| `--frame-font-size-body`            | `frame.font.size.body`            | No declared default; supplied by context.                                                | Base text size inherited by shell content and ordinary controls.                                                           | `.frame-date-text`                                                                                           |
| `--frame-text`                      | `frame.text`                      | No declared default; supplied by context.                                                | Primary foreground for readable text and icons across shell and application content.                                       | `.frame-date-text`                                                                                           |
| `--frame-gap`                       | `frame.gap`                       | No declared default; supplied by context.                                                | Standard space between related content items and control children.                                                         | `.frame-calendar`                                                                                            |
| `--frame-content-padding`           | `frame.content.padding`           | No declared default; supplied by context.                                                | Standard inset around content in panels, disclosures, and application surfaces.                                            | `.frame-calendar`                                                                                            |
| `--frame-surface`                   | `frame.surface`                   | No declared default; supplied by context.                                                | Neutral raised surface behind grouped content and control compositions.                                                    | `.frame-calendar`                                                                                            |
| `--frame-line`                      | `frame.line`                      | No declared default; supplied by context.                                                | Neutral divider color for content boundaries, tracks, and structural separators.                                           | `.frame-calendar`                                                                                            |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-calendar`                                                                                            |
| `--frame-gap`                       | `frame.gap`                       | No declared default; supplied by context.                                                | Standard space between related content items and control children.                                                         | `.frame-date-header`                                                                                         |
| `--frame-content-padding`           | `frame.content.padding`           | No declared default; supplied by context.                                                | Standard inset around content in panels, disclosures, and application surfaces.                                            | `.frame-date-months`                                                                                         |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-weekday`                                                                                        |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | No declared default; supplied by context.                                                | Vertical inset inside ordinary controls and text-entry surfaces.                                                           | `.frame-date-weekday`                                                                                        |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | No declared default; supplied by context.                                                | Vertical inset inside ordinary controls and text-entry surfaces.                                                           | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-control-padding-x`         | `frame.control.padding.x`         | No declared default; supplied by context.                                                | Horizontal inset inside ordinary controls and text-entry surfaces.                                                         | `.frame-date-day, .frame-date-nav`                                                                           |
| `--frame-menu-hover`                | `frame.menu.hover`                | No declared default; supplied by context.                                                | Neutral hover and highlight fill for ordinary menu rows.                                                                   | `.frame-date-day:hover, .frame-date-nav:hover`                                                               |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day:focus-visible, .frame-date-nav:focus-visible, .frame-date-segment:focus-visible`            |
| `--frame-accent-foreground`         | `frame.accent.foreground`         | `#fff`                                                                                   | Foreground for .frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]. | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-selected], .frame-date-day[data-selection-start], .frame-date-day[data-selection-end]` |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-highlighted]`                                                                          |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-day[data-today]`                                                                                |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-day[data-outside-view]`                                                                         |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | No declared default; supplied by context.                                                | Vertical inset inside ordinary controls and text-entry surfaces.                                                           | `.frame-date-field`                                                                                          |
| `--frame-control-padding-x`         | `frame.control.padding.x`         | No declared default; supplied by context.                                                | Horizontal inset inside ordinary controls and text-entry surfaces.                                                         | `.frame-date-field`                                                                                          |
| `--frame-control-background`        | `frame.control.background`        | No declared default; supplied by context.                                                | Resting fill of text-entry controls and other control surfaces.                                                            | `.frame-date-field`                                                                                          |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-date-field`                                                                                          |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                                   | `.frame-date-field:focus-within`                                                                             |
| `--frame-danger`                    | `frame.danger`                    | `#f48771`                                                                                | Foreground of field validation messages.                                                                                   | `.frame-date-field[data-invalid]`                                                                            |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead.               | `.frame-date-segment`                                                                                        |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-segment[data-placeholder]`                                                                      |
| `--frame-gap`                       | `frame.gap`                       | No declared default; supplied by context.                                                | Standard space between related content items and control children.                                                         | `.frame-date-separator`                                                                                      |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                                            | `.frame-date-separator`                                                                                      |
| `--frame-overlay-background`        | `frame.overlay.background`        | No declared default; supplied by context.                                                | Shared translucent fill for floating surfaces over the application canvas.                                                 | `.frame-date-popover`                                                                                        |
| `--frame-panel-radius`              | `frame.panel.radius`              | No declared default; supplied by context.                                                | Shared corner radius of panel containers and larger floating surfaces.                                                     | `.frame-date-popover`                                                                                        |
| `--frame-overlay-shadow`            | `frame.overlay.shadow`            | No declared default; supplied by context.                                                | Elevation shadow separating floating overlays from underlying content.                                                     | `.frame-date-popover`                                                                                        |
| `--frame-overlay-backdrop-filter`   | `frame.overlay.backdrop.filter`   | No declared default; supplied by context.                                                | Blur and saturation treatment behind shared translucent floating surfaces.                                                 | `.frame-overlay-surface`                                                                                     |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
