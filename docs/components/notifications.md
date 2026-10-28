# Notifications

Transient application notifications in the bottom-left corner.

## Features

### Basic usage

Notifications disappear after five seconds by default. Hover or keyboard focus pauses the timer. Set duration to 0 for a persistent notification. An optional action runs once and closes the notification on success. Notification history is available separately from @frame/core/modules/notifications.

<!-- frame:example id="notifications.basic" -->

```vue
frame.notify({ title: 'Project saved', severity: 'success', details: 'All changes are saved.', duration: 5000, action: { label: 'Open settings', run: () => frame.openSettings() } });
```

### Composition and configuration

Compose this API with application-owned content. Use the actions in this example to inspect the behavior.

<!-- frame:example id="notifications.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameNotifications, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
const demoBottom = 24;
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame"><template #overlays>
<FrameNotifications :bottom="demoBottom" />
</template></FrameShell>
</template>
```

## APIs

<!-- frame:generated api="notifications" -->

### FrameNotifications

Source: `packages/core/src/components/feedback/FrameNotifications.vue`

#### Properties

| Name     | Type     | Default  | Description                                                                    |
| -------- | -------- | -------- | ------------------------------------------------------------------------------ |
| `bottom` | `number` | Required | Minimum distance in pixels between the notification stack and viewport bottom. |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

No declared entries.

### frame.notify

Source: `packages/core/src/framework/views/notifications.ts`

#### Properties

| Name       | Type                   | Default  | Description                                                              |
| ---------- | ---------------------- | -------- | ------------------------------------------------------------------------ |
| `id`       | `string`               | Omitted  | Stable identity used to address this contribution.                       |
| `title`    | `string`               | Required | Heading displayed by the owning presentation.                            |
| `severity` | `NotificationSeverity` | "info"   | Semantic severity used to style the notification.                        |
| `details`  | `string`               | Omitted  | Optional expanded notification content.                                  |
| `source`   | `string`               | Omitted  | Optional application source identifying the notification origin.         |
| `priority` | `string`               | Omitted  | Optional host priority annotation retained with the notification.        |
| `duration` | `number`               | 5000     | Dismissal delay in milliseconds; zero keeps the notification persistent. |
| `action`   | `NotificationAction`   | Omitted  | Optional application action offered by the notification.                 |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name           | Parameters                     | Return type                          | Description                                                                            |
| -------------- | ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `frame.notify` | `options: NotificationOptions` | `{ id: string; close: () => void; }` | Shares the existing notifications.notify operation or state with the public shell API. |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="notifications" -->

| CSS variable                                                     | Theme path                                                     | Default expression                          | Purpose                                                                          | Context                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `--frame-overlay-backdrop-filter`                                | `frame.overlay.backdrop.filter`                                | No declared default; supplied by context.   | Blur and saturation treatment behind shared translucent floating surfaces.       | `.frame-overlay-surface`                                   |
| `--frame-notifications-width`                                    | `frame.notifications.width`                                    | `min(     420px,     calc(100% - 16px)   )` | Width for .frame-notifications.                                                  | `.frame-notifications`                                     |
| `--frame-notifications-max-height`                               | `frame.notifications.max.height`                               | `calc(100% - 80px)`                         | Maximum height for .frame-notifications.                                         | `.frame-notifications`                                     |
| `--frame-notifications-gap`                                      | `frame.notifications.gap`                                      | `8px`                                       | Space between children for .frame-notifications.                                 | `.frame-notifications`                                     |
| `--frame-notification-gap`                                       | `frame.notification.gap`                                       | `10px`                                      | Space between children for .frame-notification.                                  | `.frame-notification`                                      |
| `--frame-notification-padding`                                   | `frame.notification.padding`                                   | `12px`                                      | Internal spacing for .frame-notification.                                        | `.frame-notification`                                      |
| `--frame-notification-border-radius`                             | `frame.notification.border.radius`                             | `var(     --frame-panel-radius   )`         | Corner radius for .frame-notification.                                           | `.frame-notification`                                      |
| `--frame-notification-box-shadow`                                | `frame.notification.box.shadow`                                | `var(     --frame-overlay-shadow   )`       | Elevation shadow for .frame-notification.                                        | `.frame-notification`                                      |
| `--frame-notification-font-size`                                 | `frame.notification.font.size`                                 | `var(     --frame-font-size-body   )`       | Text size for .frame-notification.                                               | `.frame-notification`                                      |
| `--frame-notification-line-height`                               | `frame.notification.line.height`                               | `1.5`                                       | Text line height for .frame-notification.                                        | `.frame-notification`                                      |
| `--frame-panel-radius`                                           | `frame.panel.radius`                                           | No declared default; supplied by context.   | Shared corner radius of panel containers and larger floating surfaces.           | `.frame-notification`                                      |
| `--frame-line`                                                   | `frame.line`                                                   | No declared default; supplied by context.   | Neutral divider color for content boundaries, tracks, and structural separators. | `.frame-notification`                                      |
| `--frame-overlay-background`                                     | `frame.overlay.background`                                     | No declared default; supplied by context.   | Shared translucent fill for floating surfaces over the application canvas.       | `.frame-notification`                                      |
| `--frame-overlay-shadow`                                         | `frame.overlay.shadow`                                         | No declared default; supplied by context.   | Elevation shadow separating floating overlays from underlying content.           | `.frame-notification`                                      |
| `--frame-font-size-body`                                         | `frame.font.size.body`                                         | No declared default; supplied by context.   | Base text size inherited by shell content and ordinary controls.                 | `.frame-notification`                                      |
| `--frame-notification-content-min-width`                         | `frame.notification.content.min.width`                         | `0`                                         | Minimum width for .frame-notification-content.                                   | `.frame-notification-content`                              |
| `--frame-notification-content-strong-font-weight`                | `frame.notification.content.strong.font.weight`                | `500`                                       | Text weight for .frame-notification-content strong.                              | `.frame-notification-content strong`                       |
| `--frame-notification-content-p-margin`                          | `frame.notification.content.p.margin`                          | `6px 0`                                     | Outer spacing for .frame-notification-content p.                                 | `.frame-notification-content p`                            |
| `--frame-notification-content-small-margin-top`                  | `frame.notification.content.small.margin.top`                  | `8px`                                       | Top outer spacing for .frame-notification-content small.                         | `.frame-notification-content small`                        |
| `--frame-muted`                                                  | `frame.muted`                                                  | No declared default; supplied by context.   | Secondary foreground for descriptions, hints, and visually subordinate content.  | `.frame-notification-content small`                        |
| `--frame-notification-content-frame-button-margin-top`           | `frame.notification.content.frame.button.margin.top`           | `10px`                                      | Top outer spacing for .frame-notification-content .frame-button.                 | `.frame-notification-content .frame-button`                |
| `--frame-notification-severity-margin-top`                       | `frame.notification.severity.margin.top`                       | `3px`                                       | Top outer spacing for .frame-notification-severity.                              | `.frame-notification-severity`                             |
| `--frame-notification-severity-color`                            | `frame.notification.severity.color`                            | `#4da7d4`                                   | Foreground for .frame-notification-severity.                                     | `.frame-notification-severity`                             |
| `--frame-notification-error-frame-notification-severity-color`   | `frame.notification.error.frame.notification.severity.color`   | `#f48771`                                   | Foreground for .frame-notification.error .frame-notification-severity.           | `.frame-notification.error .frame-notification-severity`   |
| `--frame-notification-warning-frame-notification-severity-color` | `frame.notification.warning.frame.notification.severity.color` | `#dcca79`                                   | Foreground for .frame-notification.warning .frame-notification-severity.         | `.frame-notification.warning .frame-notification-severity` |
| `--frame-notification-success-frame-notification-severity-color` | `frame.notification.success.frame.notification.severity.color` | `#89bb8b`                                   | Foreground for .frame-notification.success .frame-notification-severity.         | `.frame-notification.success .frame-notification-severity` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
