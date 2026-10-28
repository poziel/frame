# FrameCalendar

An inline day grid for choosing dates with managed focus and localized calendar labels.

## Features

### Anatomy

- **Root**: Coordinates selection, the visible period and keyboard focus.
- **Header**: Previous and next buttons flank the period heading.
- **Grid and cells**: Rows contain focusable day choices and their selection states.
- **footer slot**: Adds application help below the calendar.

- Navigate days with arrow keys and select with the keyboard.
- Select one day or several independent days.
- Localize headings and weekdays; display adjacent months together.

[Underlying Reka reference](https://reka-ui.com/docs/components/calendar). Frame exposes the contract documented below.

### Multiple date selection

Choose training days without selecting every day between them. Activate a selected day again to remove it.

<!-- frame:example id="calendar.multiple-days" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCalendar, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>([parseDate("2026-10-21"), parseDate("2026-10-26")]);
const demoMultiple = true;
</script>
<template>
<FrameCalendar v-model="demoModelValue" :multiple="demoMultiple" :label="&quot;Training days&quot;" />
</template>
```

### Multiple months and paged navigation

Two fixed-height months keep late October and early November visible. Navigation advances a full page.

<!-- frame:example id="calendar.two-months" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCalendar, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-10-21"));
const demoNumberOfMonths = 2;
const demoFixedWeeks = true;
const demoPagedNavigation = true;
</script>
<template>
<FrameCalendar v-model="demoModelValue" :number-of-months="demoNumberOfMonths" :fixed-weeks="demoFixedWeeks" :paged-navigation="demoPagedNavigation" :label="&quot;Travel date&quot;" />
</template>
```

### Locale and first day of the week

French labels and a Monday-first grid adapt the same selected day to a regional calendar.

<!-- frame:example id="calendar.localized-week" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCalendar, parseDate, type DateValue } from '@frame/core';
const demoModelValue = shallowRef<DateValue | DateValue[] | null>(parseDate("2026-10-21"));
const demoWeekStartsOn = 1;
</script>
<template>
<FrameCalendar v-model="demoModelValue" :locale="&quot;fr-FR&quot;" :week-starts-on="demoWeekStartsOn" :label="&quot;Date du rendez-vous&quot;" />
</template>
```

## APIs

<!-- frame:generated api="calendar" -->

### FrameCalendar

Source: `packages/core/src/components/forms/dates-and-times/FrameCalendar.vue`

#### Properties

| Name                            | Type                                                   | Default | Description                                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multiple`                      | `boolean \| undefined`                                 | false   | Whether multiple dates can be selected                                                                                                                                                               |
| `modelValue`                    | `DateValue \| DateValue[] \| null \| undefined`        | Omitted | The controlled selected date value of the calendar. Can be bound as `v-model`.                                                                                                                       |
| `disabled`                      | `boolean \| undefined`                                 | false   | Whether the calendar is disabled                                                                                                                                                                     |
| `placeholder`                   | `DateValue \| undefined`                               | Omitted | The placeholder date, which is used to determine what month to display when no date is selected                                                                                                      |
| `defaultValue`                  | `DateValue \| undefined`                               | Omitted | The default value for the calendar                                                                                                                                                                   |
| `asChild`                       | `boolean \| undefined`                                 | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `dir`                           | `Direction \| undefined`                               | Omitted | The reading direction of the calendar when applicable. <br> If omitted, inherits globally from `ConfigProvider` or assumes LTR (left-to-right) reading mode.                                         |
| `readonly`                      | `boolean \| undefined`                                 | false   | Whether the calendar is readonly                                                                                                                                                                     |
| `locale`                        | `string \| undefined`                                  | Omitted | The locale to use for formatting dates                                                                                                                                                               |
| `defaultPlaceholder`            | `DateValue \| undefined`                               | Omitted | The default placeholder date                                                                                                                                                                         |
| `pagedNavigation`               | `boolean \| undefined`                                 | false   | This property causes the previous and next buttons to navigate by the number of months displayed at once, rather than one month                                                                      |
| `preventDeselect`               | `boolean \| undefined`                                 | false   | Whether or not to prevent the user from deselecting a date without selecting another date first                                                                                                      |
| `weekStartsOn`                  | `WeekStartsOn \| undefined`                            | Omitted | The day of the week to start the calendar on                                                                                                                                                         |
| `weekdayFormat`                 | `WeekDayFormat \| undefined`                           | Omitted | The format to use for the weekday strings provided via the weekdays slot prop                                                                                                                        |
| `calendarLabel`                 | `string \| undefined`                                  | Omitted | The accessible label for the calendar                                                                                                                                                                |
| `fixedWeeks`                    | `boolean \| undefined`                                 | false   | Whether or not to always display 6 weeks in the calendar                                                                                                                                             |
| `maxValue`                      | `DateValue \| undefined`                               | Omitted | The maximum date that can be selected                                                                                                                                                                |
| `minValue`                      | `DateValue \| undefined`                               | Omitted | The minimum date that can be selected                                                                                                                                                                |
| `initialFocus`                  | `boolean \| undefined`                                 | false   | If true, the calendar will focus the selected day, today, or the first day of the month depending on what is visible when the calendar is mounted                                                    |
| `isDateDisabled`                | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a date is disabled                                                                                                                                            |
| `isDateUnavailable`             | `Matcher \| undefined`                                 | Omitted | A function that returns whether or not a date is unavailable                                                                                                                                         |
| `nextPage`                      | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the next page of the calendar. It receives the current placeholder as an argument inside the component.                                                                      |
| `prevPage`                      | `((placeholder: DateValue) => DateValue) \| undefined` | Omitted | A function that returns the previous page of the calendar. It receives the current placeholder as an argument inside the component.                                                                  |
| `disableDaysOutsideCurrentView` | `boolean \| undefined`                                 | false   | Whether or not to disable days outside the current view.                                                                                                                                             |
| `numberOfMonths`                | `number \| undefined`                                  | 1       | Number of month grids displayed; omission uses the forwarded CalendarRoot default. defaultValue: 1                                                                                                   |
| `as`                            | `Component \| AsTag \| undefined`                      | "div"   | Element or component rendered by the calendar root; omission uses its upstream default. defaultValue: "div"                                                                                          |
| `label`                         | `string \| undefined`                                  | Omitted | Accessible name of the date or time control.                                                                                                                                                         |

#### Events

| Name                 | Parameters                                     | Return type | Description                                                   |
| -------------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `update:modelValue`  | `value: DateValue \| DateValue[] \| undefined` | `void`      | Requests the new application-owned value after interaction.   |
| `update:placeholder` | `value: DateValue`                             | `void`      | Requests the date or time used as the navigation placeholder. |

#### Slots

| Name     | Parameters | Return type  | Description                                 |
| -------- | ---------- | ------------ | ------------------------------------------- |
| `footer` | `None`     | `VNodeChild` | Additional content below the calendar grid. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="calendar" -->

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
| `--frame-muted`             | `frame.muted`             | `#8e9496`                                | Secondary foreground for descriptions, hints, and visually subordinate content.                              | `.frame-date-weekday`                                                                                        |
| `--frame-control-padding-y` | `frame.control.padding.y` | `calc(var(--frame-spacing-unit) * 1.25)` | Vertical inset inside ordinary controls and text-entry surfaces.                                             | `.frame-date-weekday`                                                                                        |
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
