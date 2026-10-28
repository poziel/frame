<script setup lang="ts">
import {computed} from 'vue';
import {useFrame} from '../../framework/useFrame';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import FrameButton from '../actions/FrameButton.vue';
import {useOverlayBoundary, viewportBounds} from '../overlays/overlays';

const frame = useFrame();
const props = defineProps<{
  /** Minimum distance in pixels between the notification stack and viewport bottom. */
  bottom: number;
}>();
const {getBounds} = useOverlayBoundary();
const style = computed(() => {
  const area = getBounds(),
    viewport = viewportBounds();
  return {
    left: `${area.left + 6}px`,
    bottom: `${Math.max(props.bottom, viewport.height - area.top - area.height + 4)}px`,
    maxWidth: `${Math.max(0, area.width - 12)}px`,
    maxHeight: `${Math.max(0, Math.min(viewport.height * 0.6, area.height - 8))}px`,
  };
});
const icons = {
  info: 'info',
  success: 'pass',
  warning: 'warning',
  error: 'error',
};
function focusOut(id: string, event: FocusEvent) {
  if (
    !(event.currentTarget as HTMLElement).contains(
      event.relatedTarget as Node | null
    )
  )
    frame.notifications.resume(id, 'focus');
}
</script>
<template>
  <section
    class="frame-notifications frame-overlay-interactive"
    :style="style"
    aria-label="Application notifications"
    aria-live="polite"
    aria-relevant="additions"
    ><article
      v-for="item in frame.notifications.state.items"
      :key="item.id"
      class="frame-notification frame-overlay-surface"
      :class="item.severity"
      @mouseenter="frame.notifications.pause(item.id, 'pointer')"
      @mouseleave="frame.notifications.resume(item.id, 'pointer')"
      @focusin="frame.notifications.pause(item.id, 'focus')"
      @focusout="focusOut(item.id, $event)"
      ><FrameIcon
        :name="icons[item.severity]"
        class="frame-notification-severity" /><div
        class="frame-notification-content"
        ><strong>{{ item.title }}</strong
        ><p v-if="item.details">{{ item.details }}</p
        ><small v-if="item.source">Source: {{ item.source }}</small
        ><FrameButton
          v-if="item.action"
          variant="primary"
          :disabled="item.running"
          @click="frame.notifications.runAction(item.id)"
          >{{ item.action.label }}</FrameButton
        ></div
      ><FrameIconButton
        :label="`Dismiss notification: ${item.title}`"
        icon="close"
        @click="frame.notifications.dismiss(item.id)" /></article
  ></section>
</template>

<style lang="scss">
@use '../../styles/mixins/surfaces';
.frame-notifications {
  position: absolute;
  left: 8px;
  z-index: 60;
  /* Width for .frame-notifications. @token --frame-notifications-width */
  --_frame-default-notifications-width-595ff55607: min(
    420px,
    calc(100% - 16px)
  );
  width: var(
    --frame-notifications-width,
    var(--_frame-default-notifications-width-595ff55607)
  ); /* Maximum height for .frame-notifications. @token --frame-notifications-max-height */
  --_frame-default-notifications-max-height-4d1a0c709b: calc(100% - 80px);
  max-height: var(
    --frame-notifications-max-height,
    var(--_frame-default-notifications-max-height-4d1a0c709b)
  );
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  /* Space between children for .frame-notifications. @token --frame-notifications-gap */
  --_frame-default-notifications-gap-1f0b242ce8: 8px;
  gap: var(
    --frame-notifications-gap,
    var(--_frame-default-notifications-gap-1f0b242ce8)
  );
  pointer-events: none;
}
.frame-notification {
  display: flex;
  align-items: flex-start;
  /* Space between children for .frame-notification. @token --frame-notification-gap */
  --_frame-default-notification-gap-b03c5cb7d4: 10px;
  gap: var(
    --frame-notification-gap,
    var(--_frame-default-notification-gap-b03c5cb7d4)
  ); /* Internal spacing for .frame-notification. @token --frame-notification-padding */
  --_frame-default-notification-padding-8099f5d8f6: 12px;
  padding: var(
    --frame-notification-padding,
    var(--_frame-default-notification-padding-8099f5d8f6)
  ); /* Corner radius for .frame-notification. @token --frame-notification-border-radius */
  --_frame-default-notification-border-radius-be4c450156: var(
    --frame-panel-radius
  );
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  /* Shared corner radius of panel containers and larger floating surfaces. @token --frame-panel-radius @context */
  /* Shared translucent fill for floating surfaces over the application canvas. @token --frame-overlay-background @context */
  @include surfaces.framed-surface(
    1px solid var(--frame-line),
    var(
      --frame-notification-border-radius,
      var(--_frame-default-notification-border-radius-be4c450156)
    ),
    var(--frame-overlay-background)
  ); /* Elevation shadow for .frame-notification. @token --frame-notification-box-shadow */
  --_frame-default-notification-box-shadow-919222e71e: var(
    --frame-overlay-shadow
  );
  /* Elevation shadow separating floating overlays from underlying content. @token --frame-overlay-shadow @context */
  box-shadow: var(
    --frame-notification-box-shadow,
    var(--_frame-default-notification-box-shadow-919222e71e)
  );
  pointer-events: auto;
  /* Text size for .frame-notification. @token --frame-notification-font-size */
  --_frame-default-notification-font-size-71b05f0879: var(
    --frame-font-size-body
  );
  /* Base text size inherited by shell content and ordinary controls. @token --frame-font-size-body @context */
  font-size: var(
    --frame-notification-font-size,
    var(--_frame-default-notification-font-size-71b05f0879)
  ); /* Text line height for .frame-notification. @token --frame-notification-line-height */
  --_frame-default-notification-line-height-e759d3e518: 1.5;
  line-height: var(
    --frame-notification-line-height,
    var(--_frame-default-notification-line-height-e759d3e518)
  );
}
.frame-notification-content {
  flex: 1;
  /* Minimum width for .frame-notification-content. @token --frame-notification-content-min-width */
  --_frame-default-notification-content-min-width-7e5a7f64d7: 0;
  min-width: var(
    --frame-notification-content-min-width,
    var(--_frame-default-notification-content-min-width-7e5a7f64d7)
  );
  overflow-wrap: anywhere;
}
.frame-notification-content strong {
  /* Text weight for .frame-notification-content strong. @token --frame-notification-content-strong-font-weight */
  --_frame-default-notification-content-strong-font-weight-92291fbf45: 500;
  font-weight: var(
    --frame-notification-content-strong-font-weight,
    var(--_frame-default-notification-content-strong-font-weight-92291fbf45)
  );
}
.frame-notification-content p {
  /* Outer spacing for .frame-notification-content p. @token --frame-notification-content-p-margin */
  --_frame-default-notification-content-p-margin-9b44069992: 6px 0;
  margin: var(
    --frame-notification-content-p-margin,
    var(--_frame-default-notification-content-p-margin-9b44069992)
  );
  white-space: pre-wrap;
}
.frame-notification-content small {
  display: block;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(
    --frame-muted
  ); /* Top outer spacing for .frame-notification-content small. @token --frame-notification-content-small-margin-top */
  --_frame-default-notification-content-small-margin-top-c73ab093b6: 8px;
  margin-top: var(
    --frame-notification-content-small-margin-top,
    var(--_frame-default-notification-content-small-margin-top-c73ab093b6)
  );
}
.frame-notification-content .frame-button {
  /* Top outer spacing for .frame-notification-content .frame-button. @token --frame-notification-content-frame-button-margin-top */
  --_frame-default-notification-content-frame-button-margin-top-f84c202309: 10px;
  margin-top: var(
    --frame-notification-content-frame-button-margin-top,
    var(
      --_frame-default-notification-content-frame-button-margin-top-f84c202309
    )
  );
}
.frame-notification-severity {
  /* Top outer spacing for .frame-notification-severity. @token --frame-notification-severity-margin-top */
  --_frame-default-notification-severity-margin-top-582121fe73: 3px;
  margin-top: var(
    --frame-notification-severity-margin-top,
    var(--_frame-default-notification-severity-margin-top-582121fe73)
  ); /* Foreground for .frame-notification-severity. @token --frame-notification-severity-color */
  --_frame-default-notification-severity-color-b786291240: #4da7d4;
  color: var(
    --frame-notification-severity-color,
    var(--_frame-default-notification-severity-color-b786291240)
  );
  flex-shrink: 0;
}
.frame-notification.error .frame-notification-severity {
  /* Foreground for .frame-notification.error .frame-notification-severity. @token --frame-notification-error-frame-notification-severity-color */
  --_frame-default-notification-error-frame-notification-severity-color-13ef13abe1: #f48771;
  color: var(
    --frame-notification-error-frame-notification-severity-color,
    var(
      --_frame-default-notification-error-frame-notification-severity-color-13ef13abe1
    )
  );
}
.frame-notification.warning .frame-notification-severity {
  /* Foreground for .frame-notification.warning .frame-notification-severity. @token --frame-notification-warning-frame-notification-severity-color */
  --_frame-default-notification-warning-frame-notification-severity-color-e458910de8: #dcca79;
  color: var(
    --frame-notification-warning-frame-notification-severity-color,
    var(
      --_frame-default-notification-warning-frame-notification-severity-color-e458910de8
    )
  );
}
.frame-notification.success .frame-notification-severity {
  /* Foreground for .frame-notification.success .frame-notification-severity. @token --frame-notification-success-frame-notification-severity-color */
  --_frame-default-notification-success-frame-notification-severity-color-c4eb0a0dc6: #89bb8b;
  color: var(
    --frame-notification-success-frame-notification-severity-color,
    var(
      --_frame-default-notification-success-frame-notification-severity-color-c4eb0a0dc6
    )
  );
}
</style>
