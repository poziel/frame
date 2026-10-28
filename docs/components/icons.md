# Icons

Microsoft Codicons offline and Iconify collection names on demand.

## Features

### Identify a source file

Use a bundled icon beside content without loading a separate icon library in the host.

<!-- frame:example id="icons.file-icon" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIcon } from '@frame/core';
const demoSize = 20;
</script>
<template>
<FrameIcon :name="&quot;file-code&quot;" :size="demoSize" />
</template>
```

### Mark an application action

A small action icon aligns with compact toolbar content. Supply the surrounding action’s accessible name separately.

<!-- frame:example id="icons.action-icon" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIcon } from '@frame/core';
const demoSize = 16;
</script>
<template>
<FrameIcon :name="&quot;refresh&quot;" :size="demoSize" />
</template>
```

### Choose an icon collection explicitly

An explicit collection prefix keeps icon selection deliberate when several collections share a name.

<!-- frame:example id="icons.explicit-pack" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIcon } from '@frame/core';
const demoSize = 24;
</script>
<template>
<FrameIcon :name="&quot;home&quot;" :pack="&quot;codicon&quot;" :size="demoSize" />
</template>
```

## APIs

<!-- frame:generated api="icons" -->

### FrameIcon

Source: `packages/core/src/components/data-display/FrameIcon.vue`

#### Properties

| Name               | Type                                                  | Default  | Description                                                                        |
| ------------------ | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `tooltip`          | `string \| false \| undefined`                        | Omitted  | Tooltip text; false disables it. When omitted, the native title attribute is used. |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | Omitted  | Preferred tooltip side; positioning falls back when space is limited.              |
| `name`             | `string`                                              | Required | Iconify icon name; unprefixed names use the codicon collection.                    |
| `pack`             | `string \| undefined`                                 | Omitted  | Iconify collection prefix; overrides any prefix in name.                           |
| `size`             | `string \| number \| undefined`                       | 16       | Width and height; numeric values are pixels and strings retain their CSS units.    |
| `angle`            | `number \| undefined`                                 | Omitted  | Rotation of the icon in degrees.                                                   |
| `flipHorizontal`   | `boolean \| undefined`                                | false    | Mirrors the icon horizontally.                                                     |
| `flipVertical`     | `boolean \| undefined`                                | false    | Mirrors the icon vertically.                                                       |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                                     |
| --------- | ---------- | ------------ | ----------------------------------------------- |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content for the decorative icon. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="icons" -->

| CSS variable                                 | Theme path                                 | Default expression                                          | Purpose                                                                                                                        | Context                                                                              |
| -------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `--frame-icon-line-height`                   | `frame.icon.line.height`                   | `1`                                                         | Text line height for .frame-icon.                                                                                              | `.frame-icon`                                                                        |
| `--frame-icon-svg-width`                     | `frame.icon.svg.width`                     | `100%`                                                      | Width for .frame-icon > svg.                                                                                                   | `.frame-icon > svg`                                                                  |
| `--frame-icon-svg-height`                    | `frame.icon.svg.height`                    | `100%`                                                      | Height for .frame-icon > svg.                                                                                                  | `.frame-icon > svg`                                                                  |
| `--frame-icon-button-frame-icon-margin`      | `frame.icon.button.frame.icon.margin`      | `0`                                                         | Outer spacing for .frame-icon-button > .frame-icon.                                                                            | `.frame-icon-button > .frame-icon`                                                   |
| `--frame-settings-category-frame-icon-width` | `frame.settings.category.frame.icon.width` | `16px`                                                      | Width for .settings-category > .frame-icon, .settings-category > .settings-disclosure-spacer.                                  | `.settings-category > .frame-icon, .settings-category > .settings-disclosure-spacer` |
| `--frame-activity-icon-size`                 | `frame.activity.icon.size`                 | `28px`                                                      | Height for .view-bar .rail-button > :is(svg, .frame-icon). Used when --frame-view-icon-size is unset.                          | `.view-bar .rail-button > :is(svg, .frame-icon)`                                     |
| `--frame-view-icon-size`                     | `frame.view.icon.size`                     | `var(     --frame-activity-icon-size,     28px   )`         | Height for .view-bar .rail-button > :is(svg, .frame-icon).                                                                     | `.view-bar .rail-button > :is(svg, .frame-icon)`                                     |
| `--frame-activity-compact-icon-size`         | `frame.activity.compact.icon.size`         | `18px`                                                      | Height for .view-bar.view-bar-compact .rail-button > :is(svg, .frame-icon). Used when --frame-view-compact-icon-size is unset. | `.view-bar.view-bar-compact .rail-button > :is(svg, .frame-icon)`                    |
| `--frame-view-compact-icon-size`             | `frame.view.compact.icon.size`             | `var(     --frame-activity-compact-icon-size,     18px   )` | Height for .view-bar.view-bar-compact .rail-button > :is(svg, .frame-icon).                                                    | `.view-bar.view-bar-compact .rail-button > :is(svg, .frame-icon)`                    |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
