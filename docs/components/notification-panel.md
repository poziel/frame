# Notification History

An optional ready-made notification panel from @frame/core/modules/notifications.

## Features

### Basic usage

Create a history store before emitting notifications, mount NotificationPanel in the shell overlays slot and NotificationIndicator in status-actions. The history keeps up to 200 entries by default, independently of core expiry and dismissal. Its clear button changes history only.

<!-- frame:example id="notification-panel.basic" -->

```vue
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/core/modules/notifications';

const history = createNotificationHistory(frame);
// <FrameShell :frame="frame">
//   <template #overlays><NotificationPanel :frame="frame" :history="history" :bottom="38" /></template>
//   <template #status-actions><NotificationIndicator :history="history" /></template>
// </FrameShell>
// Call history.dispose() when the host is unmounted.
```

### Composition and configuration

Set bottom explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="notification-panel.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { NotificationPanel } from '@frame/core/modules/notifications';
import { createFrame, FrameShell } from '@frame/core';
import { createNotificationHistory } from '@frame/core/modules/notifications';
const frame = createFrame();
const history = createNotificationHistory(frame);
const demoBottom = 24;
onBeforeUnmount(() => { history.dispose(); frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<NotificationPanel :frame="frame" :history="history" :bottom="demoBottom" />
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="notification-panel" -->

### NotificationPanel

Source: `packages/core/src/modules/notifications/components/NotificationPanel.vue`

#### Properties

| Name      | Type                  | Default  | Description                                                                                  |
| --------- | --------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `frame`   | `Frame`               | Required | Stable caller-owned Frame instance; shell state and service ownership remain with this root. |
| `history` | `NotificationHistory` | Required | Caller-owned notification history; this presentation does not dispose it.                    |
| `bottom`  | `number \| undefined` | 8        | Bottom inset in pixels for bottom-anchored notification placement; defaults to eight.        |

#### Events

| Name    | Parameters | Return type | Description                                                                      |
| ------- | ---------- | ----------- | -------------------------------------------------------------------------------- |
| `close` | `None`     | `void`      | Requests dismissal of this presentation without disposing its owning controller. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

### NotificationIndicator

Source: `packages/core/src/modules/notifications/components/NotificationIndicator.vue`

#### Properties

| Name      | Type                  | Default  | Description                                                               |
| --------- | --------------------- | -------- | ------------------------------------------------------------------------- |
| `history` | `NotificationHistory` | Required | Caller-owned notification history; this presentation does not dispose it. |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="notification-panel" -->

| CSS variable                                                    | Theme path                                                    | Default expression                                                                | Purpose                                                                              | Context                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `--frame-sr-only-width`                                         | `frame.sr.only.width`                                         | `1px`                                                                             | Width for .sr-only.                                                                  | `.sr-only`                                          |
| `--frame-sr-only-height`                                        | `frame.sr.only.height`                                        | `1px`                                                                             | Height for .sr-only.                                                                 | `.sr-only`                                          |
| `--frame-notification-center-width`                             | `frame.notification.center.width`                             | `min(     450px,     calc(100% - 16px)   )`                                       | Width for .notification-center.                                                      | `.notification-center`                              |
| `--frame-notification-center-border`                            | `frame.notification.center.border`                            | `1px solid     var(--frame-line)`                                                 | Border for .notification-center.                                                     | `.notification-center`                              |
| `--frame-notification-center-border-radius`                     | `frame.notification.center.border.radius`                     | `6px`                                                                             | Corner radius for .notification-center.                                              | `.notification-center`                              |
| `--frame-notification-center-box-shadow`                        | `frame.notification.center.box.shadow`                        | `0 6px 25px #0005`                                                                | Elevation shadow for .notification-center.                                           | `.notification-center`                              |
| `--frame-line`                                                  | `frame.line`                                                  | `#2b2b2b`                                                                         | Neutral divider color for content boundaries, tracks, and structural separators.     | `.notification-center`                              |
| `--frame-overlay-background`                                    | `frame.overlay.background`                                    | `color-mix(in srgb, var(--frame-overlay-surface) 83%, transparent)`               | Shared translucent fill for floating surfaces over the application canvas.           | `.notification-center`                              |
| `--frame-overlay-backdrop-filter`                               | `frame.overlay.backdrop.filter`                               | `blur(10px) saturate(110%)`                                                       | Blur and saturation treatment behind shared translucent floating surfaces.           | `.notification-center`                              |
| `--frame-notification-center-header-gap`                        | `frame.notification.center.header.gap`                        | `4px`                                                                             | Space between children for .notification-center > header.                            | `.notification-center > header`                     |
| `--frame-notification-center-header-background`                 | `frame.notification.center.header.background`                 | `color-mix(     in srgb,     var(--frame-surface) 92%,     var(--frame-text)   )` | Background for .notification-center > header.                                        | `.notification-center > header`                     |
| `--frame-notification-center-header-min-height`                 | `frame.notification.center.header.min.height`                 | `38px`                                                                            | Minimum height for .notification-center > header.                                    | `.notification-center > header`                     |
| `--frame-notification-center-header-padding`                    | `frame.notification.center.header.padding`                    | `3px 8px`                                                                         | Internal spacing for .notification-center > header.                                  | `.notification-center > header`                     |
| `--frame-surface`                                               | `frame.surface`                                               | `#181818`                                                                         | Neutral raised surface behind grouped content and control compositions.              | `.notification-center > header`                     |
| `--frame-text`                                                  | `frame.text`                                                  | `#cccccc`                                                                         | Primary foreground for readable text and icons across shell and application content. | `.notification-center > header`                     |
| `--frame-notification-center-h2-font-size`                      | `frame.notification.center.h2.font.size`                      | `12px`                                                                            | Text size for .notification-center h2.                                               | `.notification-center h2`                           |
| `--frame-notification-center-h2-font-weight`                    | `frame.notification.center.h2.font.weight`                    | `500`                                                                             | Text weight for .notification-center h2.                                             | `.notification-center h2`                           |
| `--frame-notification-list-max-height`                          | `frame.notification.list.max.height`                          | `min(420px, 60dvh)`                                                               | Maximum height for .notification-list.                                               | `.notification-list`                                |
| `--frame-notification-item-padding`                             | `frame.notification.item.padding`                             | `8px`                                                                             | Internal spacing for .notification-item.                                             | `.notification-item`                                |
| `--frame-notification-item-border-top`                          | `frame.notification.item.border.top`                          | `1px solid #ffffff0b`                                                             | Top border for .notification-item.                                                   | `.notification-item`                                |
| `--frame-notification-item-outline-offset`                      | `frame.notification.item.outline.offset`                      | `-1px`                                                                            | Outline offset for .notification-item.                                               | `.notification-item`                                |
| `--frame-notification-row-gap`                                  | `frame.notification.row.gap`                                  | `8px`                                                                             | Space between children for .notification-row.                                        | `.notification-row`                                 |
| `--frame-notification-row-min-height`                           | `frame.notification.row.min.height`                           | `26px`                                                                            | Minimum height for .notification-row.                                                | `.notification-row`                                 |
| `--frame-notification-title-min-width`                          | `frame.notification.title.min.width`                          | `0`                                                                               | Minimum width for .notification-title.                                               | `.notification-title`                               |
| `--frame-notification-title-font-size`                          | `frame.notification.title.font.size`                          | `12px`                                                                            | Text size for .notification-title.                                                   | `.notification-title`                               |
| `--frame-notification-title-line-height`                        | `frame.notification.title.line.height`                        | `24px`                                                                            | Text line height for .notification-title.                                            | `.notification-title`                               |
| `--frame-notification-severity-margin-top-2`                    | `frame.notification.severity.margin.top.2`                    | `4px`                                                                             | Top outer spacing for .notification-severity.                                        | `.notification-severity`                            |
| `--frame-notification-severity-color-2`                         | `frame.notification.severity.color.2`                         | `#4da7d4`                                                                         | Foreground for .notification-severity.                                               | `.notification-severity`                            |
| `--frame-notification-item-error-notification-severity-color`   | `frame.notification.item.error.notification.severity.color`   | `#f48771`                                                                         | Foreground for .notification-item.error .notification-severity.                      | `.notification-item.error .notification-severity`   |
| `--frame-notification-item-warning-notification-severity-color` | `frame.notification.item.warning.notification.severity.color` | `#dcca79`                                                                         | Foreground for .notification-item.warning .notification-severity.                    | `.notification-item.warning .notification-severity` |
| `--frame-notification-item-success-notification-severity-color` | `frame.notification.item.success.notification.severity.color` | `#89bb8b`                                                                         | Foreground for .notification-item.success .notification-severity.                    | `.notification-item.success .notification-severity` |
| `--frame-notification-item-hover-background`                    | `frame.notification.item.hover.background`                    | `#ffffff06`                                                                       | Background for .notification-item:hover.                                             | `.notification-item:hover`                          |
| `--frame-notification-details-padding`                          | `frame.notification.details.padding`                          | `5px 58px 4px 24px`                                                               | Internal spacing for .notification-details.                                          | `.notification-details`                             |
| `--frame-notification-details-font-size`                        | `frame.notification.details.font.size`                        | `12px`                                                                            | Text size for .notification-details.                                                 | `.notification-details`                             |
| `--frame-notification-details-line-height`                      | `frame.notification.details.line.height`                      | `1.6`                                                                             | Text line height for .notification-details.                                          | `.notification-details`                             |
| `--frame-notification-details-small-color`                      | `frame.notification.details.small.color`                      | `#9ba2a5`                                                                         | Foreground for .notification-details small.                                          | `.notification-details small`                       |
| `--frame-notification-details-small-margin-top`                 | `frame.notification.details.small.margin.top`                 | `8px`                                                                             | Top outer spacing for .notification-details small.                                   | `.notification-details small`                       |
| `--frame-notification-row-small-font-size`                      | `frame.notification.row.small.font.size`                      | `10px`                                                                            | Text size for .notification-row > small.                                             | `.notification-row > small`                         |
| `--frame-notification-row-small-line-height`                    | `frame.notification.row.small.line.height`                    | `24px`                                                                            | Text line height for .notification-row > small.                                      | `.notification-row > small`                         |
| `--frame-muted`                                                 | `frame.muted`                                                 | `#8e9496`                                                                         | Secondary foreground for descriptions, hints, and visually subordinate content.      | `.notification-row > small`                         |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
