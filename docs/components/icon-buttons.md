# Icon Buttons

Centered icon actions with a shared hit area, hover state, and tooltip.

## Features

### Fit a save action into a toolbar

The icon remains compact while the accessible label and tooltip identify its purpose.

<!-- frame:example id="icon-buttons.toolbar-save" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIconButton } from '@frame/core';

</script>
<template>
<FrameIconButton :label="&quot;Save project&quot;" :icon="&quot;save&quot;" :shortcut="&quot;Ctrl+S&quot;" />
</template>
```

### Explain a history action on hover

A custom tooltip provides more context than the short accessible button label.

<!-- frame:example id="icon-buttons.inspect-history" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIconButton } from '@frame/core';

</script>
<template>
<FrameIconButton :label="&quot;History&quot;" :icon="&quot;history&quot;" :tooltip="&quot;Review recent workspace changes&quot;" :tooltip-placement="&quot;right&quot;" />
</template>
```

### Make a prominent icon action

Choose the button and icon sizes independently when an action needs more room.

<!-- frame:example id="icon-buttons.larger-action" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameIconButton } from '@frame/core';
const demoSize = 36;
const demoIconSize = 22;
</script>
<template>
<FrameIconButton :label="&quot;Add workspace&quot;" :icon="&quot;add&quot;" :size="demoSize" :icon-size="demoIconSize" />
</template>
```

## APIs

<!-- frame:generated api="icon-buttons" -->

### FrameIconButton

Source: `packages/core/src/components/actions/FrameIconButton.vue`

#### Properties

| Name               | Type                                                  | Default  | Description                                                                        |
| ------------------ | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `label`            | `string`                                              | Required | Accessible button name and fallback tooltip text.                                  |
| `angle`            | `number \| undefined`                                 | Omitted  | Rotation of the icon in degrees.                                                   |
| `flipHorizontal`   | `boolean \| undefined`                                | false    | Mirrors the icon horizontally.                                                     |
| `flipVertical`     | `boolean \| undefined`                                | false    | Mirrors the icon vertically.                                                       |
| `variant`          | `"icon" \| "ghost" \| undefined`                      | Omitted  | Selects the icon-button visual treatment.                                          |
| `showLabel`        | `boolean \| undefined`                                | false    | Displays the label beside the icon.                                                |
| `shortcut`         | `string \| undefined`                                 | Omitted  | Keyboard shortcut displayed in the tooltip.                                        |
| `icon`             | `string \| Component \| undefined`                    | Omitted  | Iconify name or Vue component used as the icon; absent icons use the default slot. |
| `size`             | `number \| undefined`                                 | 26       | Button width and height in pixels.                                                 |
| `iconRatio`        | `number \| undefined`                                 | 0.62     | Fraction of the button size used for the icon when iconSize is omitted.            |
| `iconSize`         | `number \| undefined`                                 | Omitted  | Explicit icon size in pixels; overrides size multiplied by iconRatio.              |
| `hoverHighlight`   | `boolean \| undefined`                                | true     | Displays the button highlight on hover.                                            |
| `tooltip`          | `string \| boolean \| undefined`                      | true     | Tooltip text, true to use title or label, or false to disable it.                  |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right" \| undefined` | "bottom" | Preferred side for the tooltip.                                                    |
| `disabled`         | `boolean \| undefined`                                | false    | Prevents user interaction with the control.                                        |

#### Events

| Name    | Parameters          | Return type | Description                         |
| ------- | ------------------- | ----------- | ----------------------------------- |
| `click` | `event: MouseEvent` | `void`      | Native click event from the button. |

#### Slots

| Name      | Parameters | Return type  | Description                                                          |
| --------- | ---------- | ------------ | -------------------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Icon content used when the icon prop is omitted.                     |
| `tooltip` | `None`     | `VNodeChild` | Custom tooltip content; replaces the text and shortcut presentation. |

#### Exposed API

| Name      | Parameters | Return type                      | Description                                                                               |
| --------- | ---------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `element` | `None`     | `HTMLButtonElement \| undefined` | Underlying native button element; undefined before mount and unwrapped on component refs. |
| `focus`   | `None`     | `void \| undefined`              | Focuses the underlying button when mounted.                                               |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="icon-buttons" -->

| CSS variable                                                                        | Theme path                                                                        | Default expression                                                 | Purpose                                                                                                                                                                | Context                                                                                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `--frame-icon-button-width`                                                         | `frame.icon.button.width`                                                         | `25px`                                                             | Width for .icon-button.                                                                                                                                                | `.icon-button`                                                                                                               |
| `--frame-icon-button-height`                                                        | `frame.icon.button.height`                                                        | `25px`                                                             | Height for .icon-button.                                                                                                                                               | `.icon-button`                                                                                                               |
| `--frame-icon-button-border-radius`                                                 | `frame.icon.button.border.radius`                                                 | `var(     --frame-radius-medium   )`                               | Corner radius for .icon-button.                                                                                                                                        | `.icon-button`                                                                                                               |
| `--frame-radius-medium`                                                             | `frame.radius.medium`                                                             | `4px`                                                              | Medium shared corner radius used by ordinary controls.                                                                                                                 | `.icon-button`                                                                                                               |
| `--frame-muted`                                                                     | `frame.muted`                                                                     | `#8e9496`                                                          | Secondary foreground for descriptions, hints, and visually subordinate content.                                                                                        | `.icon-button`                                                                                                               |
| `--frame-icon-button-hover-background`                                              | `frame.icon.button.hover.background`                                              | `#ffffff0b`                                                        | Background for .icon-button:hover.                                                                                                                                     | `.icon-button:hover`                                                                                                         |
| `--frame-panel-actions-icon-button-min-width`                                       | `frame.panel.actions.icon.button.min.width`                                       | `24px`                                                             | Minimum width for .panel-actions .icon-button.                                                                                                                         | `.panel-actions .icon-button`                                                                                                |
| `--frame-panel-actions-icon-button-padding`                                         | `frame.panel.actions.icon.button.padding`                                         | `0 5px`                                                            | Internal spacing for .panel-actions .icon-button.                                                                                                                      | `.panel-actions .icon-button`                                                                                                |
| `--frame-icon-button-padding`                                                       | `frame.icon.button.padding`                                                       | `0`                                                                | Internal spacing for .frame-icon-button.                                                                                                                               | `.frame-icon-button`                                                                                                         |
| `--frame-icon-button-gap`                                                           | `frame.icon.button.gap`                                                           | `0`                                                                | Space between children for .frame-icon-button.                                                                                                                         | `.frame-icon-button`                                                                                                         |
| `--frame-icon-button-line-height`                                                   | `frame.icon.button.line.height`                                                   | `0`                                                                | Text line height for .frame-icon-button.                                                                                                                               | `.frame-icon-button`                                                                                                         |
| `--frame-icon-button-no-hover-highlight-hover-background`                           | `frame.icon.button.no.hover.highlight.hover.background`                           | `transparent`                                                      | Background for .frame-icon-button.no-hover-highlight:hover.                                                                                                            | `.frame-icon-button.no-hover-highlight:hover`                                                                                |
| `--frame-icon-button-frame-icon-margin`                                             | `frame.icon.button.frame.icon.margin`                                             | `0`                                                                | Outer spacing for .frame-icon-button > .frame-icon.                                                                                                                    | `.frame-icon-button > .frame-icon`                                                                                           |
| `--frame-panel-actions-frame-icon-button-has-span-not-frame-icon-padding`           | `frame.panel.actions.frame.icon.button.has.span.not.frame.icon.padding`           | `0     5px`                                                        | Internal spacing for .panel-actions .frame-icon-button:has(> span:not(.frame-icon):not(.frame-icon-button-icon)).                                                      | `.panel-actions   .frame-icon-button:has(> span:not(.frame-icon):not(.frame-icon-button-icon))`                              |
| `--frame-button-frame-button-frame-icon-button-padding`                             | `frame.button.frame.button.frame.icon.button.padding`                             | `0`                                                                | Internal padding of the icon button specialization.                                                                                                                    | `button.frame-button.frame-icon-button`                                                                                      |
| `--frame-button-frame-button-frame-icon-button-min-height`                          | `frame.button.frame.button.frame.icon.button.min.height`                          | `0`                                                                | Minimum height before the icon button geometry applies.                                                                                                                | `button.frame-button.frame-icon-button`                                                                                      |
| `--frame-button-frame-button-frame-icon-button-border`                              | `frame.button.frame.button.frame.icon.button.border`                              | `0`                                                                | Border of the icon button specialization.                                                                                                                              | `button.frame-button.frame-icon-button`                                                                                      |
| `--frame-button-frame-button-frame-icon-button-gap`                                 | `frame.button.frame.button.frame.icon.button.gap`                                 | `0`                                                                | Gap between content in the icon button specialization.                                                                                                                 | `button.frame-button.frame-icon-button`                                                                                      |
| `--frame-button-frame-button-frame-icon-button-no-hover-highlight-hover-background` | `frame.button.frame.button.frame.icon.button.no.hover.highlight.hover.background` | `transparent`                                                      | Background for button.frame-button.frame-icon-button.no-hover-highlight:hover.                                                                                         | `button.frame-button.frame-icon-button.no-hover-highlight:hover`                                                             |
| `--frame-icon-button-size`                                                          | `frame.icon.button.size`                                                          | `26px`                                                             | Value of block-size for button.frame-button.frame-icon-button.                                                                                                         | `button.frame-button.frame-icon-button`                                                                                      |
| `--frame-icon-button-icon-size`                                                     | `frame.icon.button.icon.size`                                                     | `16px`                                                             | Value of inline-size for .frame-icon-button-icon.                                                                                                                      | `.frame-icon-button-icon`                                                                                                    |
| `--frame-spacing-small`                                                             | `frame.spacing.small`                                                             | `4px`                                                              | Value of padding-inline for button.frame-button.frame-icon-button.frame-icon-button-labeled. Used when --frame-icon-button-label-padding is unset.                     | `button.frame-button.frame-icon-button.frame-icon-button-labeled`                                                            |
| `--frame-icon-button-label-gap`                                                     | `frame.icon.button.label.gap`                                                     | `var(     --frame-spacing-small,     4px   )`                      | Space between children for button.frame-button.frame-icon-button.frame-icon-button-labeled.                                                                            | `button.frame-button.frame-icon-button.frame-icon-button-labeled`                                                            |
| `--frame-icon-button-label-padding`                                                 | `frame.icon.button.label.padding`                                                 | `var(     --frame-spacing-small,     4px   )`                      | Value of padding-inline for button.frame-button.frame-icon-button.frame-icon-button-labeled.                                                                           | `button.frame-button.frame-icon-button.frame-icon-button-labeled`                                                            |
| `--frame-icon-button-label-end-padding`                                             | `frame.icon.button.label.end.padding`                                             | `2px`                                                              | Value of padding-inline-end for .frame-icon-button-label.                                                                                                              | `.frame-icon-button-label`                                                                                                   |
| `--frame-icon-button-label-font-size`                                               | `frame.icon.button.label.font.size`                                               | `inherit`                                                          | Text size for .frame-icon-button-label. CSS-wide keywords stay at the property use site so they inherit or reset the actual property rather than the private variable. | `.frame-icon-button-label`                                                                                                   |
| `--frame-muted`                                                                     | `frame.muted`                                                                     | `#8e9496`                                                          | Secondary foreground for descriptions, hints, and visually subordinate content.                                                                                        | `button.frame-button.frame-icon-button.frame-icon-button-icon-only`                                                          |
| `--frame-icon-button-icon-hover-color`                                              | `frame.icon.button.icon.hover.color`                                              | `color-mix(     in srgb,     var(--frame-text) 65%,     white   )` | Foreground for button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not( :disabled ) > .frame-icon-button-icon.                                     | `button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not(     :disabled   )   > .frame-icon-button-icon` |
| `--frame-text`                                                                      | `frame.text`                                                                      | `#cccccc`                                                          | Primary foreground for readable text and icons across shell and application content.                                                                                   | `button.frame-button.frame-icon-button.frame-icon-button-icon-only:hover:not(     :disabled   )   > .frame-icon-button-icon` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
