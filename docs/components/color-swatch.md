# FrameColorSwatch

Represent a color as a visible sample with an accessible name. A swatch displays a value; it does not select or edit it.

## Features

### Anatomy

- **ColorSwatch**: Renders the color sample and its accessible description.

- Display CSS color values.
- Provide a readable color name for assistive technology.
- Show both opaque and translucent samples.

[Underlying Reka reference](https://reka-ui.com/docs/components/color-swatch). Frame exposes the contract documented below.

### Named color sample

Pair the stored color with a meaningful label rather than relying on color alone.

<!-- frame:example id="color-swatch.named-sample" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSwatch } from '@frame/core';

</script>
<template>
<FrameColorSwatch :color="&quot;#0078d4&quot;" :label="&quot;Application accent&quot;" />
</template>
```

### Translucent sample

Pass an alpha color to display a partially transparent sample.

<!-- frame:example id="color-swatch.alpha-sample" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameColorSwatch } from '@frame/core';

</script>
<template>
<FrameColorSwatch :color="&quot;rgba(0, 120, 212, 0.5)&quot;" :label="&quot;Half-opacity accent&quot;" />
</template>
```

## APIs

<!-- frame:generated api="color-swatch" -->

### FrameColorSwatch

Source: `packages/core/src/components/forms/colors/FrameColorSwatch.vue`

#### Properties

| Name      | Type                              | Default | Description                                                                                                                                                                                          |
| --------- | --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`   | `string \| Color \| undefined`    | Omitted | The color to display in the swatch as a hex string or Color object. Example: `#16a372`, `#ff5733`, or `{ space: 'hsl', h: 120, s: 100, l: 50, alpha: 1 }`.                                           |
| `label`   | `string \| undefined`             | Omitted | Optional accessible label for the color. If omitted, the color name will be derived from the color value.                                                                                            |
| `asChild` | `boolean \| undefined`            | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`      | `Component \| AsTag \| undefined` | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

No declared entries.

#### Slots

| Name      | Parameters | Return type  | Description                              |
| --------- | ---------- | ------------ | ---------------------------------------- |
| `default` | `None`     | `VNodeChild` | Content over the displayed color swatch. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="color-swatch" -->

| CSS variable             | Theme path             | Default expression                        | Purpose                                                                                                      | Context               |
| ------------------------ | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------- |
| `--frame-line`           | `frame.line`           | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.                             | `.frame-color-swatch` |
| `--frame-control-radius` | `frame.control.radius` | No declared default; supplied by context. | Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. | `.frame-color-swatch` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
