# FrameDateField

A segmented date input for typing dates and date-times without parsing a free-form string.

## Features

### Anatomy

- **Root**: Groups the value, formatting and validation state.
- **Input segments**: Separate date parts support direct typing and arrow-key editing.

- Move between segments with Left and Right; change them with Up and Down.
- Follow locale-specific segment order.
- Include time segments when the model contains a date-time.

[Underlying Reka reference](https://reka-ui.com/docs/components/date-field). Frame exposes the contract documented below.

### Keyboard segment editing

Focus a segment and type digits or use Up and Down. Left and Right move between month, day and year.

<!-- frame:example id="date-field.keyboard-date" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateField, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | null>(parseDate("2026-10-21"));
</script>
<template>
<FrameDateField v-model="demoModelValue" :label="&quot;Appointment date&quot;" :locale="&quot;en-US&quot;" />
</template>
```

### Date and time granularity

A date-time value and minute granularity add hour and minute segments beside the date.

<!-- frame:example id="date-field.date-time" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateField, parseDateTime, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | null>(parseDateTime("2026-10-21T14:30:00"));
const demoHourCycle = 24;
</script>
<template>
<FrameDateField v-model="demoModelValue" :granularity="&quot;minute&quot;" :hour-cycle="demoHourCycle" :label="&quot;Appointment date and time&quot;" />
</template>
```

### Locale-aware segment order

French formatting presents the same model in day/month/year order.

<!-- frame:example id="date-field.localized-entry" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameDateField, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | null>(parseDate("2026-10-21"));
</script>
<template>
<FrameDateField v-model="demoModelValue" :locale="&quot;fr-FR&quot;" :label="&quot;Date du rendez-vous&quot;" />
</template>
```

## APIs

<!-- frame:generated api="date-field" -->

### FrameDateField

Source: `packages/core/src/components/forms/dates-and-times/FrameDateField.vue`

#### Properties

| Name                 | Type                              | Default | Description                                                                                                                                                                                                                      |
| -------------------- | --------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultValue`       | `DateValue \| undefined`          | Omitted | The default value for the calendar                                                                                                                                                                                               |
| `defaultPlaceholder` | `DateValue \| undefined`          | Omitted | The default placeholder date                                                                                                                                                                                                     |
| `placeholder`        | `DateValue \| undefined`          | Omitted | The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programmatically control the calendar view                   |
| `modelValue`         | `DateValue \| null \| undefined`  | Omitted | The controlled value of the field. Can be bound as `v-model`.                                                                                                                                                                    |
| `hourCycle`          | `HourCycle`                       | Omitted | The hour cycle used for formatting times. Defaults to the local preference                                                                                                                                                       |
| `step`               | `DateStep \| undefined`           | Omitted | The stepping interval for the time fields. Defaults to `1`.                                                                                                                                                                      |
| `stepSnapping`       | `boolean \| undefined`            | false   | Whether to enforce snapping the time value to the nearest step increment after input. Defaults to `false`.                                                                                                                       |
| `granularity`        | `Granularity \| undefined`        | Omitted | The granularity to use for formatting times. Defaults to day if a CalendarDate is provided, otherwise defaults to minute. The field will render segments for each part of the date up to and including the specified granularity |
| `hideTimeZone`       | `boolean \| undefined`            | false   | Whether or not to hide the time zone segment of the field                                                                                                                                                                        |
| `maxValue`           | `DateValue \| undefined`          | Omitted | The maximum date that can be selected                                                                                                                                                                                            |
| `minValue`           | `DateValue \| undefined`          | Omitted | The minimum date that can be selected                                                                                                                                                                                            |
| `locale`             | `string \| undefined`             | Omitted | The locale to use for formatting dates                                                                                                                                                                                           |
| `disabled`           | `boolean \| undefined`            | false   | Whether or not the date field is disabled                                                                                                                                                                                        |
| `readonly`           | `boolean \| undefined`            | false   | Whether or not the date field is readonly                                                                                                                                                                                        |
| `isDateUnavailable`  | `Matcher \| undefined`            | Omitted | A function that returns whether or not a date is unavailable                                                                                                                                                                     |
| `id`                 | `string \| undefined`             | Omitted | Id of the element                                                                                                                                                                                                                |
| `dir`                | `Direction \| undefined`          | Omitted | The reading direction of the date field when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                                                   |
| `asChild`            | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details.                             |
| `as`                 | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                                                   |
| `name`               | `string \| undefined`             | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                                              |
| `required`           | `boolean \| undefined`            | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                                                 |
| `label`              | `string \| undefined`             | Omitted | Accessible name of the date or time control.                                                                                                                                                                                     |

#### Events

| Name                 | Parameters                     | Return type | Description                                                 |
| -------------------- | ------------------------------ | ----------- | ----------------------------------------------------------- |
| `update:modelValue`  | `date: DateValue \| undefined` | `void`      | Event handler called whenever the model value changes       |
| `update:placeholder` | `date: DateValue`              | `void`      | Event handler called whenever the placeholder value changes |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="date-field" -->

| CSS variable                        | Theme path                        | Default expression                                                                       | Purpose                                                                                                      | Context                                                                                           |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `--frame-input-border`              | `frame.input.border`              | `1px solid     var(--frame-control-border)`                                              | Fallback for: Resting border of the text input.                                                              | `.frame-date-field`                                                                               |
| `--frame-date-field-border`         | `frame.date.field.border`         | `var(     --frame-input-border,     1px solid     var(--frame-control-border)   )`       | Resting border of the date-field text surface.                                                               | `.frame-date-field`                                                                               |
| `--frame-control-border`            | `frame.control.border`            | No declared default; supplied by context.                                                | Resting border color of form controls, independently overridable from menu borders.                          | `.frame-date-field`                                                                               |
| `--frame-date-field-border-radius`  | `frame.date.field.border.radius`  | `var(     --frame-input-radius   )`                                                      | Corner radius of the date-field text surface.                                                                | `.frame-date-field`                                                                               |
| `--frame-input-radius`              | `frame.input.radius`              | No declared default; supplied by context.                                                | Shared corner radius for text fields, text areas, selects, and composed input surfaces.                      | `.frame-date-field`                                                                               |
| `--frame-input-hover-border`        | `frame.input.hover.border`        | `1px solid     var(--frame-control-border)`                                              | Fallback for: Border while the pointer hovers over the text input.                                           | `.frame-date-field`                                                                               |
| `--frame-date-field-hover-border`   | `frame.date.field.hover.border`   | `var(     --frame-input-hover-border,     1px solid     var(--frame-control-border)   )` | Border while the pointer hovers of the date-field text surface.                                              | `.frame-date-field`                                                                               |
| `--frame-input-hover-outline`       | `frame.input.hover.outline`       | `none`                                                                                   | Fallback for: Outline while the pointer hovers over the text input.                                          | `.frame-date-field`                                                                               |
| `--frame-date-field-hover-outline`  | `frame.date.field.hover.outline`  | `var(     --frame-input-hover-outline,     none   )`                                     | Outline while the pointer hovers of the date-field text surface.                                             | `.frame-date-field`                                                                               |
| `--frame-input-focus-border`        | `frame.input.focus.border`        | `1px solid var(--frame-accent)`                                                          | Fallback for: Border while focus is within the text input.                                                   | `.frame-date-field`                                                                               |
| `--frame-date-field-focus-border`   | `frame.date.field.focus.border`   | `var(     --frame-input-focus-border,     1px solid var(--frame-accent)   )`             | Border while focus is within the input of the date-field text surface.                                       | `.frame-date-field`                                                                               |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-field`                                                                               |
| `--frame-input-focus-outline`       | `frame.input.focus.outline`       | `1px solid var(--frame-accent)`                                                          | Fallback for: Focus outline of the text input.                                                               | `.frame-date-field`                                                                               |
| `--frame-date-field-focus-outline`  | `frame.date.field.focus.outline`  | `var(     --frame-input-focus-outline,     1px solid var(--frame-accent)   )`            | Outline while focus is within the input of the date-field text surface.                                      | `.frame-date-field`                                                                               |
| `--frame-input-outline-offset`      | `frame.input.outline.offset`      | `0px`                                                                                    | Fallback for: Offset between the outline and the text input.                                                 | `.frame-date-field`                                                                               |
| `--frame-date-field-outline-offset` | `frame.date.field.outline.offset` | `var(     --frame-input-outline-offset,     0px   )`                                     | Offset between the outline and input of the date-field text surface.                                         | `.frame-date-field`                                                                               |
| `--frame-font-body`                 | `frame.font.body`                 | No declared default; supplied by context.                                                | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-date-text`                                                                                |
| `--frame-font-size-body`            | `frame.font.size.body`            | No declared default; supplied by context.                                                | Base text size inherited by shell content and ordinary controls.                                             | `.frame-date-text`                                                                                |
| `--frame-text`                      | `frame.text`                      | No declared default; supplied by context.                                                | Primary foreground for readable text and icons across shell and application content.                         | `.frame-date-text`                                                                                |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-day:focus-visible, .frame-date-nav:focus-visible, .frame-date-segment:focus-visible` |
| `--frame-control-padding-y`         | `frame.control.padding.y`         | No declared default; supplied by context.                                                | Vertical inset inside ordinary controls and text-entry surfaces.                                             | `.frame-date-field`                                                                               |
| `--frame-control-padding-x`         | `frame.control.padding.x`         | No declared default; supplied by context.                                                | Horizontal inset inside ordinary controls and text-entry surfaces.                                           | `.frame-date-field`                                                                               |
| `--frame-control-background`        | `frame.control.background`        | No declared default; supplied by context.                                                | Resting fill of text-entry controls and other control surfaces.                                              | `.frame-date-field`                                                                               |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-date-field`                                                                               |
| `--frame-accent`                    | `frame.accent`                    | No declared default; supplied by context.                                                | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-date-field:focus-within`                                                                  |
| `--frame-danger`                    | `frame.danger`                    | `#f48771`                                                                                | Foreground of field validation messages.                                                                     | `.frame-date-field[data-invalid]`                                                                 |
| `--frame-control-radius`            | `frame.control.radius`            | No declared default; supplied by context.                                                | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-date-segment`                                                                             |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-date-segment[data-placeholder]`                                                           |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
