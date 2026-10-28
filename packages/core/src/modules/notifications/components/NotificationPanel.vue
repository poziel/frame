<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  computed,
  shallowRef,
} from 'vue';
import {
  FrameIconButton,
  FrameIcon,
  FrameMenu,
  type Frame,
  type FrameMenuItem,
} from '../../../index';
import type {
  NotificationHistory,
  NotificationIndicatorPosition,
} from '../controllers/notificationHistory';

const props = withDefaults(
  defineProps<{frame: Frame; history: NotificationHistory; bottom?: number}>(),
  {bottom: 8}
);
const frame = props.frame;
const history = props.history;
const panel = ref<HTMLElement>();
const positionAnchor = shallowRef<HTMLElement>();
const positions: {id: NotificationIndicatorPosition; label: string}[] = [
  {id: 'bottom-right', label: 'Bottom Right'},
  {id: 'bottom-left', label: 'Bottom Left'},
  {id: 'top-right', label: 'Top Right'},
];
const positionItems = computed<FrameMenuItem[]>(() =>
  positions.map((item) => ({
    ...item,
    checked: history.state.indicatorPosition === item.id,
  }))
);
const panelStyle = computed(() =>
  history.state.indicatorPosition === 'top-right'
    ? {top: '8px', bottom: 'auto', right: '8px', left: 'auto'}
    : {
        bottom: `${props.bottom}px`,
        top: 'auto',
        left:
          history.state.indicatorPosition === 'bottom-left' ? '8px' : 'auto',
        right:
          history.state.indicatorPosition === 'bottom-left' ? 'auto' : '8px',
      }
);
function move(item: FrameMenuItem) {
  if (positions.some((position) => position.id === item.id))
    history.setPosition(item.id as NotificationIndicatorPosition);
}
function choosePosition(event: MouseEvent) {
  positionAnchor.value = positionAnchor.value
    ? undefined
    : (event.currentTarget as HTMLElement);
}

const emit = defineEmits<{close: []}>();
const icons = {
  info: 'info',
  success: 'pass',
  warning: 'warning',
  error: 'error',
};
function close() {
  history.state.open = false;
  emit('close');
}
function key(event: KeyboardEvent) {
  if (event.defaultPrevented || frame.modals.length) return;
  if (event.key === 'Escape' && history.state.open) {
    event.preventDefault();
    event.stopPropagation();
    close();
  }
}
function dismiss(id: number) {
  const index = history.state.items.findIndex((item) => item.historyId === id);
  history.dismiss(id);
  void nextTick(() => {
    const rows =
      panel.value?.querySelectorAll<HTMLElement>('.notification-item');
    (
      rows?.[Math.min(index, rows.length - 1)] ??
      panel.value?.querySelector<HTMLElement>(
        "[aria-label='Hide notifications']"
      )
    )?.focus();
  });
}
function clear() {
  history.clear();
  void nextTick(() =>
    panel.value
      ?.querySelector<HTMLElement>("[aria-label='Hide notifications']")
      ?.focus()
  );
}
onMounted(() => window.addEventListener('keydown', key));
onBeforeUnmount(() => window.removeEventListener('keydown', key));
</script>
<template>
  <section
    ref="panel"
    v-if="history.state.open && history.state.indicatorEnabled"
    class="notification-center"
    :style="panelStyle"
    aria-label="Notifications"
    ><header
      ><h2>{{
        history.state.items.length ? 'Notifications' : 'No new notification.'
      }}</h2
      ><span class="notification-spacer" /><FrameIconButton
        label="Clear all notifications"
        icon="clear-all"
        :disabled="!history.state.items.length"
        @click="clear" /><FrameIconButton
        label="Change notification position"
        icon="arrow-swap"
        aria-haspopup="menu"
        :aria-expanded="!!positionAnchor"
        @click="choosePosition" /><FrameIconButton
        label="Hide notifications"
        icon="chevron-down"
        @click="close" /></header
    ><div v-if="history.state.items.length" class="notification-list"
      ><article
        v-for="item in history.state.items"
        :key="item.historyId"
        class="notification-item"
        :class="item.severity"
        tabindex="0"
        @dblclick="item.expanded = !item.expanded"
        @keydown.enter.self.prevent="item.expanded = !item.expanded"
        @keydown.space.self.prevent="item.expanded = !item.expanded"
        ><div class="notification-row"
          ><FrameIcon
            :name="icons[item.severity]"
            class="notification-severity" /><span class="sr-only"
            >{{ item.severity }}: </span
          ><span class="notification-title">{{ item.title }}</span
          ><small v-if="item.priority">{{ item.priority }}</small
          ><div class="notification-actions"
            ><FrameIconButton
              :label="`${item.expanded ? 'Collapse' : 'Expand'} notification: ${item.title}`"
              :icon="item.expanded ? 'chevron-up' : 'chevron-down'"
              :aria-expanded="item.expanded"
              @click.stop="item.expanded = !item.expanded"
              @dblclick.stop /><FrameIconButton
              :label="`Clear notification: ${item.title}`"
              icon="close"
              @click.stop="dismiss(item.historyId)"
              @dblclick.stop /></div></div
        ><div v-if="item.expanded" class="notification-details"
          ><p v-if="item.details">{{ item.details }}</p
          ><small v-if="item.source">Source: {{ item.source }}</small
          ><p v-if="!item.details && !item.source"
            >No additional details.</p
          ></div
        ></article
      ></div
    ><FrameMenu
      v-if="positionAnchor"
      :anchor="positionAnchor"
      :items="positionItems"
      label="Notification position"
      @select="move"
      @close="positionAnchor = undefined"
  /></section>
</template>

<style lang="scss">
@use '../../../styles/mixins/surfaces';

.notification-center {
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 16px);
  position: absolute;
  right: 8px;
  z-index: 50;
  width: var(--frame-notification-center-width, min(450px, calc(100% - 16px)));
  @include surfaces.framed-surface(
    var(--frame-notification-center-border, 1px solid var(--frame-line)),
    var(--frame-notification-center-border-radius, 6px),
    var(--frame-overlay-background)
  );
  backdrop-filter: var(--frame-overlay-backdrop-filter);
  -webkit-backdrop-filter: var(--frame-overlay-backdrop-filter);
  box-shadow: var(--frame-notification-center-box-shadow, 0 6px 25px #0005);
  overflow: hidden;
}

.notification-center > header {
  display: flex;
  align-items: center;
  gap: var(--frame-notification-center-header-gap, 4px);
  flex-shrink: 0;
  background: var(
    --frame-notification-center-header-background,
    color-mix(in srgb, var(--frame-surface) 92%, var(--frame-text))
  );
  min-height: var(--frame-notification-center-header-min-height, 38px);
  padding: var(--frame-notification-center-header-padding, 3px 8px);
}

.notification-center h2 {
  margin: 0;
  font-size: var(--frame-notification-center-h2-font-size, 12px);
  font-weight: var(--frame-notification-center-h2-font-weight, 500);
}

.notification-spacer {
  flex: 1;
}

.notification-list {
  min-height: 0;
  overflow: auto;
  max-height: var(--frame-notification-list-max-height, min(420px, 60dvh));
}

.notification-item {
  padding: var(--frame-notification-item-padding, 8px);
  border-top: var(--frame-notification-item-border-top, 1px solid #ffffff0b);
  outline-offset: var(--frame-notification-item-outline-offset, -1px);
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: var(--frame-notification-row-gap, 8px);
  min-height: var(--frame-notification-row-min-height, 26px);
}

.notification-title {
  flex: 1;
  min-width: var(--frame-notification-title-min-width, 0);
  font-size: var(--frame-notification-title-font-size, 12px);
  line-height: var(--frame-notification-title-line-height, 24px);
  overflow-wrap: anywhere;
}

.notification-severity {
  margin-top: var(--frame-notification-severity-margin-top-2, 4px);
  color: var(--frame-notification-severity-color-2, #4da7d4);
}

.notification-item.error .notification-severity {
  color: var(
    --frame-notification-item-error-notification-severity-color,
    #f48771
  );
}

.notification-item.warning .notification-severity {
  color: var(
    --frame-notification-item-warning-notification-severity-color,
    #dcca79
  );
}

.notification-item.success .notification-severity {
  color: var(
    --frame-notification-item-success-notification-severity-color,
    #89bb8b
  );
}

.notification-actions {
  display: flex;
  flex-shrink: 0;
  visibility: hidden;
}

.notification-item:hover .notification-actions,
.notification-item:focus-within .notification-actions {
  visibility: visible;
}

.notification-item:hover {
  background: var(--frame-notification-item-hover-background, #ffffff06);
}

.notification-details {
  padding: var(--frame-notification-details-padding, 5px 58px 4px 24px);
  font-size: var(--frame-notification-details-font-size, 12px);
  line-height: var(--frame-notification-details-line-height, 1.6);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.notification-details small {
  display: block;
  color: var(--frame-notification-details-small-color, #9ba2a5);
  margin-top: var(--frame-notification-details-small-margin-top, 8px);
}

.notifications-empty {
  padding: var(--frame-notifications-empty-padding, 20px);
  color: var(--frame-muted);
  font-size: var(--frame-notifications-empty-font-size, 12px);
}

.notification-row > small {
  color: var(--frame-muted);
  font-size: var(--frame-notification-row-small-font-size, 10px);
  line-height: var(--frame-notification-row-small-line-height, 24px);
}
</style>
