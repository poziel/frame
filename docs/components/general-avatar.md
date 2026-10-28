# Avatar

A themed avatar powered by Reka UI.

## Features

### Identify a collaborator

Initials remain visible when an account has no image. Supply a useful accessible label for the person.

<!-- frame:example id="general-avatar.task-0" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAvatar } from '@frame/core';

</script>
<template>
<FrameAvatar :fallback="&quot;JD&quot;" :alt="&quot;Jane Doe&quot;" />
</template>
```

### Recover from an unavailable image

A failed image request falls back to the supplied initials so the identity remains recognizable.

<!-- frame:example id="general-avatar.task-1" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameAvatar } from '@frame/core';

</script>
<template>
<FrameAvatar :src="&quot;data:image/png;base64,invalid&quot;" :fallback="&quot;MK&quot;" :alt="&quot;Morgan Kim&quot;" />
</template>
```

## APIs

<!-- frame:generated api="general-avatar" -->

### FrameAvatar

Source: `packages/core/src/components/data-display/FrameAvatar.vue`

#### Properties

| Name             | Type                                                  | Default | Description                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`            | `string \| undefined`                                 | Omitted | Image URL. The fallback appears while unavailable or loading.                                                                                                                                        |
| `alt`            | `string \| undefined`                                 | Omitted | Alternative text describing the avatar image.                                                                                                                                                        |
| `fallback`       | `string \| undefined`                                 | Omitted | Initials or text displayed when the image is unavailable.                                                                                                                                            |
| `delayMs`        | `number \| undefined`                                 | Omitted | Milliseconds before showing the fallback during image loading.                                                                                                                                       |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy \| undefined`            | Omitted | Referrer policy passed to the avatar image request.                                                                                                                                                  |
| `crossOrigin`    | `"" \| "anonymous" \| "use-credentials" \| undefined` | Omitted | Cross-origin request mode passed to the avatar image.                                                                                                                                                |
| `asChild`        | `boolean \| undefined`                                | false   | Change the default rendered element for the one passed as a child, merging their props and behavior. Read our [Composition](https://www.reka-ui.com/docs/guides/composition) guide for more details. |
| `as`             | `Component \| AsTag \| undefined`                     | "div"   | The element or component this component should render as. Can be overwritten by `asChild`. defaultValue: "div"                                                                                       |

#### Events

| Name                  | Parameters                  | Return type | Description                                                                                                                                                                    |
| --------------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `loadingStatusChange` | `value: ImageLoadingStatus` | `void`      | A callback providing information about the loading status of the image. <br> This is useful in case you want to control more precisely what to render as the image is loading. |

#### Slots

| Name      | Parameters | Return type  | Description                                                                      |
| --------- | ---------- | ------------ | -------------------------------------------------------------------------------- |
| `default` | `None`     | `VNodeChild` | Fallback content used while the image is unavailable; defaults to fallback text. |

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="general-avatar" -->

| CSS variable                 | Theme path                 | Default expression                        | Purpose                                                                              | Context                  |
| ---------------------------- | -------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| `--frame-font-body`          | `frame.font.body`          | No declared default; supplied by context. | Primary font family inherited by shell content and ordinary controls.                | `.frame-layout-text`     |
| `--frame-font-size-body`     | `frame.font.size.body`     | No declared default; supplied by context. | Base text size inherited by shell content and ordinary controls.                     | `.frame-layout-text`     |
| `--frame-text`               | `frame.text`               | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content. | `.frame-layout-text`     |
| `--frame-avatar-size`        | `frame.avatar.size`        | `36px`                                    | Equal width and height of the avatar surface.                                        | `.frame-avatar`          |
| `--frame-avatar-radius`      | `frame.avatar.radius`      | `50%`                                     | Corner radius of the avatar surface.                                                 | `.frame-avatar`          |
| `--frame-avatar-background`  | `frame.avatar.background`  | `var(--frame-control-background)`         | Surface behind the avatar image or fallback.                                         | `.frame-avatar`          |
| `--frame-control-background` | `frame.control.background` | No declared default; supplied by context. | Resting fill of text-entry controls and other control surfaces.                      | `.frame-avatar`          |
| `--frame-avatar-color`       | `frame.avatar.color`       | `var(--frame-text)`                       | Foreground of the avatar fallback.                                                   | `.frame-avatar-fallback` |
| `--frame-text`               | `frame.text`               | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content. | `.frame-avatar-fallback` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
