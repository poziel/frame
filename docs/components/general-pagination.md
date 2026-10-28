# Pagination

A themed pagination powered by Reka UI.

## Features

### Browse a result set

Move between pages of ten records. Page changes are emitted to the host, which owns fetching and result data.

<!-- frame:example id="general-pagination.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePagination } from '@frame/core';
const demoTotal = 120;
const demoItemsPerPage = 10;
const demoDefaultPage = 1;
</script>
<template>
<FramePagination :total="demoTotal" :items-per-page="demoItemsPerPage" :default-page="demoDefaultPage" />
</template>
```

### Use larger result pages

Twenty-five records per page reduces navigation for dense result lists without changing the total number of records.

<!-- frame:example id="general-pagination.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FramePagination } from '@frame/core';
const demoTotal = 250;
const demoItemsPerPage = 25;
const demoDefaultPage = 4;
</script>
<template>
<FramePagination :total="demoTotal" :items-per-page="demoItemsPerPage" :default-page="demoDefaultPage" />
</template>
```

## APIs

<!-- frame:generated api="general-pagination" -->

### FramePagination

Source: `packages/core/src/components/navigation/FramePagination.vue`

#### Properties

| Name           | Type                              | Default  | Description                                                                                                                                                                                          |
| -------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`         | `number \| undefined`             | Omitted  | The controlled value of the current page. Can be binded as `v-model:page`.                                                                                                                           |
| `defaultPage`  | `number \| undefined`             | Omitted  | The value of the page that should be active when initially rendered. Use when you do not need to control the value state.                                                                            |
| `itemsPerPage` | `number`                          | Required | Number of items per page                                                                                                                                                                             |
| `total`        | `number \| undefined`             | Omitted  | Number of items in your list                                                                                                                                                                         |
| `siblingCount` | `number \| undefined`             | Omitted  | Number of sibling should be shown around the current page                                                                                                                                            |
| `disabled`     | `boolean \| undefined`            | false    | When `true`, prevents the user from interacting with item                                                                                                                                            |
| `showEdges`    | `boolean \| undefined`            | false    | When `true`, always show first page, last page, and ellipsis                                                                                                                                         |
| `asChild`      | `boolean \| undefined`            | false    | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`           | `Component \| AsTag \| undefined` | "div"    | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

| Name          | Parameters      | Return type | Description                                      |
| ------------- | --------------- | ----------- | ------------------------------------------------ |
| `update:page` | `value: number` | `void`      | Event handler called when the page value changes |

#### Slots

| Name      | Parameters                             | Return type  | Description                                                               |
| --------- | -------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `default` | `{ page: number; pageCount: number; }` | `VNodeChild` | Replaces the built-in page controls with the current page and page count. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-pagination" -->

| CSS variable                    | Theme path                    | Default expression                      | Purpose                                                                                                      | Context                                                                                                                                                               |
| ------------------------------- | ----------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--frame-font-body`             | `frame.font.body`             | `"Segoe UI", sans-serif`                | Primary font family inherited by shell content and ordinary controls.                                        | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-font-size-body`        | `frame.font.size.body`        | `12px`                                  | Base text size inherited by shell content and ordinary controls.                                             | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-text`                  | `frame.text`                  | `#cccccc`                               | Primary foreground for readable text and icons across shell and application content.                         | `.frame-accordion, .frame-collapsible, .frame-pagination, .frame-avatar, .frame-scroll-area`                                                                          |
| `--frame-accent`                | `frame.accent`                | `#0078d4`                               | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-accordion-trigger:focus-visible, .frame-collapsible-trigger:focus-visible, .frame-pagination-button:focus-visible, .frame-scroll-area-viewport:focus-visible` |
| `--frame-gap`                   | `frame.gap`                   | `calc(var(--frame-spacing-unit) * 1.5)` | Standard space between related content items and control children.                                           | `.frame-pagination-list`                                                                                                                                              |
| `--frame-pagination-background` | `frame.pagination.background` | `var(--frame-control-background)`       | Resting surface of a pagination button.                                                                      | `.frame-pagination-button`                                                                                                                                            |
| `--frame-control-padding-x`     | `frame.control.padding.x`     | `calc(var(--frame-spacing-unit) * 2.5)` | Horizontal inset inside ordinary controls and text-entry surfaces.                                           | `.frame-pagination-button`                                                                                                                                            |
| `--frame-control-border`        | `frame.control.border`        | `var(--frame-border-color)`             | Resting border color of form controls, independently overridable from menu borders.                          | `.frame-pagination-button`                                                                                                                                            |
| `--frame-control-radius`        | `frame.control.radius`        | `var(--frame-radius-medium)`            | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-pagination-button`                                                                                                                                            |
| `--frame-control-background`    | `frame.control.background`    | `#1d1d1d`                               | Resting fill of text-entry controls and other control surfaces.                                              | `.frame-pagination-button`                                                                                                                                            |
| `--frame-control-text`          | `frame.control.text`          | `#d4d4d4`                               | Foreground for text and icons on resting control surfaces.                                                   | `.frame-pagination-button`                                                                                                                                            |
| `--frame-menu-hover`            | `frame.menu.hover`            | `#303336`                               | Neutral hover and highlight fill for ordinary menu rows.                                                     | `.frame-pagination-button:hover`                                                                                                                                      |
| `--frame-accent`                | `frame.accent`                | `#0078d4`                               | Shared interaction color for keyboard focus, active actions, and accent-filled controls.                     | `.frame-pagination-button[data-selected]`                                                                                                                             |
| `--frame-accent-foreground`     | `frame.accent.foreground`     | `#ffffff`                               | Readable text and icon foreground on accent-filled surfaces.                                                 | `.frame-pagination-button[data-selected]`                                                                                                                             |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
