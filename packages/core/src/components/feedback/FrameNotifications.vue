<script setup lang="ts">
import {computed} from 'vue';
import {useFrame} from '../../framework/useFrame';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import FrameButton from '../actions/FrameButton.vue';
import {useOverlayBoundary, viewportBounds} from '../overlays/overlays';

const frame = useFrame();
const props = defineProps<{bottom: number}>();
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
  width: var(--frame-notifications-width, min(420px, calc(100% - 16px)));
  max-height: var(--frame-notifications-max-height, calc(100% - 80px));
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  gap: var(--frame-notifications-gap, 8px);
  pointer-events: none;
}
.frame-notification {
  display: flex;
  align-items: flex-start;
  gap: var(--frame-notification-gap, 10px);
  padding: var(--frame-notification-padding, 12px);
  @include surfaces.framed-surface(
    1px solid var(--frame-line),
    var(--frame-notification-border-radius, var(--frame-panel-radius)),
    var(--frame-overlay-background)
  );
  box-shadow: var(--frame-notification-box-shadow, var(--frame-overlay-shadow));
  pointer-events: auto;
  font-size: var(--frame-notification-font-size, var(--frame-font-size-body));
  line-height: var(--frame-notification-line-height, 1.5);
}
.frame-notification-content {
  flex: 1;
  min-width: var(--frame-notification-content-min-width, 0);
  overflow-wrap: anywhere;
}
.frame-notification-content strong {
  font-weight: var(--frame-notification-content-strong-font-weight, 500);
}
.frame-notification-content p {
  margin: var(--frame-notification-content-p-margin, 6px 0);
  white-space: pre-wrap;
}
.frame-notification-content small {
  display: block;
  color: var(--frame-muted);
  margin-top: var(--frame-notification-content-small-margin-top, 8px);
}
.frame-notification-content .frame-button {
  margin-top: var(--frame-notification-content-frame-button-margin-top, 10px);
}
.frame-notification-severity {
  margin-top: var(--frame-notification-severity-margin-top, 3px);
  color: var(--frame-notification-severity-color, #4da7d4);
  flex-shrink: 0;
}
.frame-notification.error .frame-notification-severity {
  color: var(
    --frame-notification-error-frame-notification-severity-color,
    #f48771
  );
}
.frame-notification.warning .frame-notification-severity {
  color: var(
    --frame-notification-warning-frame-notification-severity-color,
    #dcca79
  );
}
.frame-notification.success .frame-notification-severity {
  color: var(
    --frame-notification-success-frame-notification-severity-color,
    #89bb8b
  );
}
</style>
