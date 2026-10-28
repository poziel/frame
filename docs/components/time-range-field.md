# FrameTimeRangeField

A segmented field for entering a starting and ending time with a shared format.

## Features

### Anatomy

- **Root**: Coordinates time formatting, bounds and validation state.
- **Start and end inputs**: Focusable hour, minute and optional second or day-period segments support direct typing.

- Edit segments with digits and arrow keys.
- Use either a twelve-hour or twenty-four-hour clock.
- Choose the precision needed by the task.

[Underlying Reka reference](https://reka-ui.com/docs/components/time-range-field). Frame exposes the contract documented below.

### Twelve-hour time ranges

A twelve-hour clock includes a day-period segment. Focus it and use A or P to change the period.

<!-- frame:example id="time-range-field.twelve-hour" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTimeRangeField, parseTime, type TimeRange } from '@frame/core';
const demoModelValue = shallowRef<TimeRange | null>({ start: parseTime("09:30:00"), end: parseTime("17:00:00") });
const demoHourCycle = 12;
</script>
<template>
<FrameTimeRangeField v-model="demoModelValue" :locale="&quot;en-US&quot;" :hour-cycle="demoHourCycle" :label="&quot;Opening hours&quot;" />
</template>
```

### Second-level precision

Second granularity exposes an additional segment for precise timing, using a twenty-four-hour clock.

<!-- frame:example id="time-range-field.seconds" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTimeRangeField, parseTime, type TimeRange } from '@frame/core';
const demoModelValue = shallowRef<TimeRange | null>({ start: parseTime("09:30:15"), end: parseTime("10:00:45") });
const demoHourCycle = 24;
</script>
<template>
<FrameTimeRangeField v-model="demoModelValue" :hour-cycle="demoHourCycle" :granularity="&quot;second&quot;" :label="&quot;Precise schedule&quot;" />
</template>
```

### Minimum and maximum times

Times before 09:00 or after 18:00 produce invalid state. Bounds express availability rather than silently changing the host schedule.

<!-- frame:example id="time-range-field.time-bounds" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameTimeRangeField, parseTime, type TimeRange } from '@frame/core';
const demoModelValue = shallowRef<TimeRange | null>({ start: parseTime("09:30:00"), end: parseTime("17:00:00") });
const demoMinValue = parseTime("09:00:00");
const demoMaxValue = parseTime("18:00:00");
const demoHourCycle = 24;
</script>
<template>
<FrameTimeRangeField v-model="demoModelValue" :min-value="demoMinValue" :max-value="demoMaxValue" :hour-cycle="demoHourCycle" :label="&quot;Office schedule&quot;" />
</template>
```

## APIs

<!-- frame:generated api="time-range-field" -->

### FrameTimeRangeField

Source: `packages/core/src/components/forms/dates-and-times/FrameTimeRangeField.vue`

#### Properties

| Name                 | Type                                          | Default | Description                                                                                                                                                                                          |
| -------------------- | --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled`           | `boolean \| undefined`                        | false   | Whether or not the time field is disabled                                                                                                                                                            |
| `name`               | `string \| undefined`                         | Omitted | The name of the field. Submitted with its owning form as part of a name/value pair.                                                                                                                  |
| `required`           | `boolean \| undefined`                        | false   | When `true`, indicates that the user must set the value before the owning form can be submitted.                                                                                                     |
| `placeholder`        | `TimeValue \| undefined`                      | Omitted | The placeholder time, which is used to determine what time to display when no time is selected. This updates as the user navigates the field                                                         |
| `asChild`            | `boolean \| undefined`                        | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`                 | `Component \| AsTag \| undefined`             | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |
| `dir`                | `Direction \| undefined`                      | Omitted | The reading direction of the time field when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                       |
| `step`               | `DateStep \| undefined`                       | Omitted | The stepping interval for the time fields. Defaults to `1`.                                                                                                                                          |
| `id`                 | `string \| undefined`                         | Omitted | Id of the element                                                                                                                                                                                    |
| `readonly`           | `boolean \| undefined`                        | false   | Whether or not the time field is readonly                                                                                                                                                            |
| `locale`             | `string \| undefined`                         | Omitted | The locale to use for formatting times                                                                                                                                                               |
| `defaultPlaceholder` | `TimeValue \| undefined`                      | Omitted | The default placeholder time                                                                                                                                                                         |
| `maxValue`           | `TimeValue \| undefined`                      | Omitted | The maximum time that can be selected                                                                                                                                                                |
| `minValue`           | `TimeValue \| undefined`                      | Omitted | The minimum time that can be selected                                                                                                                                                                |
| `hourCycle`          | `HourCycle`                                   | Omitted | The hour cycle used for formatting times. Defaults to the local preference                                                                                                                           |
| `granularity`        | `"hour" \| "minute" \| "second" \| undefined` | Omitted | The granularity to use for formatting times. Defaults to minute. The field will render segments for each part of the time up to and including the specified granularity                              |
| `hideTimeZone`       | `boolean \| undefined`                        | false   | Whether or not to hide the time zone segment of the field                                                                                                                                            |
| `isTimeUnavailable`  | `Matcher \| undefined`                        | Omitted | A function that returns whether or not a time is unavailable                                                                                                                                         |
| `modelValue`         | `TimeRange \| null \| undefined`              | Omitted | Controlled start and end times; null leaves the range empty.                                                                                                                                         |
| `defaultValue`       | `TimeRange \| undefined`                      | Omitted | Initial start and end times when the range is uncontrolled.                                                                                                                                          |
| `label`              | `string \| undefined`                         | Omitted | Accessible name of the date or time control.                                                                                                                                                         |

#### Events

| Name                 | Parameters         | Return type | Description                                                   |
| -------------------- | ------------------ | ----------- | ------------------------------------------------------------- |
| `update:modelValue`  | `value: TimeRange` | `void`      | Requests the new application-owned value after interaction.   |
| `update:placeholder` | `value: TimeValue` | `void`      | Requests the date or time used as the navigation placeholder. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="time-range-field" -->

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
| `--frame-gap`                       | `frame.gap`                       | No declared default; supplied by context.                                                | Standard space between related content items and control children.                                           | `.frame-date-separator`                                                                           |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context.                                                | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-date-separator`                                                                           |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
