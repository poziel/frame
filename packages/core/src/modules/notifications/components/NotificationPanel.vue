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
  defineProps<{
    /** Stable caller-owned Frame instance; shell state and service ownership remain with this root. */
    frame: Frame;
    /** Caller-owned notification history; this presentation does not dispose it. */
    history: NotificationHistory;
    /** Bottom inset in pixels for bottom-anchored notification placement; defaults to eight. */
    bottom?: number;
  }>(),
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

const emit = defineEmits<{
  /** Requests dismissal of this presentation without disposing its owning controller. */
  close: [];
}>();
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
  /* Width for .notification-center; notification center width. @token --frame-notification-center-width */
  --_frame-default-notification-center-width-5859f9f0a9: min(
    450px,
    calc(100% - 16px)
  );
  width: var(
    --frame-notification-center-width,
    var(--_frame-default-notification-center-width-5859f9f0a9)
  );
  /*   _frame default notification center border radius 61e0939cfc for .notification-center; notification center border. @token --frame-notification-center-border */
  --_frame-default-notification-center-border-67e2f08881: 1px solid
    var(--frame-line);
  /* Surface contour and fill for .notification-center; notification center border radius. @token --frame-notification-center-border-radius */
  --_frame-default-notification-center-border-radius-61e0939cfc: 6px;
  /* Surface contour and fill for .notification-center; line. @token --frame-line @context */ /* Surface contour and fill for .notification-center; overlay background. @token --frame-overlay-background @context */
  @include surfaces.framed-surface(
    var(
      --frame-notification-center-border,
      var(--_frame-default-notification-center-border-67e2f08881)
    ),
    var(
      --frame-notification-center-border-radius,
      var(--_frame-default-notification-center-border-radius-61e0939cfc)
    ),
    var(--frame-overlay-background)
  );
  /* Backdrop filter for .notification-center; overlay backdrop filter. @token --frame-overlay-backdrop-filter @context */
  backdrop-filter: var(--frame-overlay-backdrop-filter);
  -webkit-backdrop-filter: var(--frame-overlay-backdrop-filter);
  /* Box shadow for .notification-center; notification center box shadow. @token --frame-notification-center-box-shadow */
  --_frame-default-notification-center-box-shadow-bd33001e58: 0 6px 25px #0005;
  box-shadow: var(
    --frame-notification-center-box-shadow,
    var(--_frame-default-notification-center-box-shadow-bd33001e58)
  );
  overflow: hidden;
}

.notification-center > header {
  display: flex;
  align-items: center;
  /* Gap for .notification-center > header; notification center header gap. @token --frame-notification-center-header-gap */
  --_frame-default-notification-center-header-gap-92c6f3f50f: 4px;
  gap: var(
    --frame-notification-center-header-gap,
    var(--_frame-default-notification-center-header-gap-92c6f3f50f)
  );
  flex-shrink: 0;
  /* Background for .notification-center > header; notification center header background. @token --frame-notification-center-header-background */
  --_frame-default-notification-center-header-background-223dd1b2a3: color-mix(
    in srgb,
    var(--frame-surface) 92%,
    var(--frame-text)
  );
  /* Background for .notification-center > header; surface. @token --frame-surface @context */ /* Background for .notification-center > header; text. @token --frame-text @context */
  background: var(
    --frame-notification-center-header-background,
    var(--_frame-default-notification-center-header-background-223dd1b2a3)
  );
  /* Min height for .notification-center > header; notification center header min height. @token --frame-notification-center-header-min-height */
  --_frame-default-notification-center-header-min-height-6ca5bb0b21: 38px;
  min-height: var(
    --frame-notification-center-header-min-height,
    var(--_frame-default-notification-center-header-min-height-6ca5bb0b21)
  );
  /* Padding for .notification-center > header; notification center header padding. @token --frame-notification-center-header-padding */
  --_frame-default-notification-center-header-padding-55f466f924: 3px 8px;
  padding: var(
    --frame-notification-center-header-padding,
    var(--_frame-default-notification-center-header-padding-55f466f924)
  );
}

.notification-center h2 {
  margin: 0;
  /* Font size for .notification-center h2; notification center h2 font size. @token --frame-notification-center-h2-font-size */
  --_frame-default-notification-center-h2-font-size-4cb0b9cf47: 12px;
  font-size: var(
    --frame-notification-center-h2-font-size,
    var(--_frame-default-notification-center-h2-font-size-4cb0b9cf47)
  );
  /* Font weight for .notification-center h2; notification center h2 font weight. @token --frame-notification-center-h2-font-weight */
  --_frame-default-notification-center-h2-font-weight-65b556c572: 500;
  font-weight: var(
    --frame-notification-center-h2-font-weight,
    var(--_frame-default-notification-center-h2-font-weight-65b556c572)
  );
}

.notification-spacer {
  flex: 1;
}

.notification-list {
  min-height: 0;
  overflow: auto;
  /* Max height for .notification-list; notification list max height. @token --frame-notification-list-max-height */
  --_frame-default-notification-list-max-height-063c162840: min(420px, 60dvh);
  max-height: var(
    --frame-notification-list-max-height,
    var(--_frame-default-notification-list-max-height-063c162840)
  );
}

.notification-item {
  /* Padding for .notification-item; notification item padding. @token --frame-notification-item-padding */
  --_frame-default-notification-item-padding-d73083d734: 8px;
  padding: var(
    --frame-notification-item-padding,
    var(--_frame-default-notification-item-padding-d73083d734)
  );
  /* Border top for .notification-item; notification item border top. @token --frame-notification-item-border-top */
  --_frame-default-notification-item-border-top-b514e7c15a: 1px solid #ffffff0b;
  border-top: var(
    --frame-notification-item-border-top,
    var(--_frame-default-notification-item-border-top-b514e7c15a)
  );
  /* Outline offset for .notification-item; notification item outline offset. @token --frame-notification-item-outline-offset */
  --_frame-default-notification-item-outline-offset-b6c285cd0c: -1px;
  outline-offset: var(
    --frame-notification-item-outline-offset,
    var(--_frame-default-notification-item-outline-offset-b6c285cd0c)
  );
}

.notification-row {
  display: flex;
  align-items: flex-start;
  /* Gap for .notification-row; notification row gap. @token --frame-notification-row-gap */
  --_frame-default-notification-row-gap-27aca0e193: 8px;
  gap: var(
    --frame-notification-row-gap,
    var(--_frame-default-notification-row-gap-27aca0e193)
  );
  /* Min height for .notification-row; notification row min height. @token --frame-notification-row-min-height */
  --_frame-default-notification-row-min-height-27e6d13577: 26px;
  min-height: var(
    --frame-notification-row-min-height,
    var(--_frame-default-notification-row-min-height-27e6d13577)
  );
}

.notification-title {
  flex: 1;
  /* Min width for .notification-title; notification title min width. @token --frame-notification-title-min-width */
  --_frame-default-notification-title-min-width-a1bef66d84: 0;
  min-width: var(
    --frame-notification-title-min-width,
    var(--_frame-default-notification-title-min-width-a1bef66d84)
  );
  /* Font size for .notification-title; notification title font size. @token --frame-notification-title-font-size */
  --_frame-default-notification-title-font-size-306efe666b: 12px;
  font-size: var(
    --frame-notification-title-font-size,
    var(--_frame-default-notification-title-font-size-306efe666b)
  );
  /* Line height for .notification-title; notification title line height. @token --frame-notification-title-line-height */
  --_frame-default-notification-title-line-height-b3c466127d: 24px;
  line-height: var(
    --frame-notification-title-line-height,
    var(--_frame-default-notification-title-line-height-b3c466127d)
  );
  overflow-wrap: anywhere;
}

.notification-severity {
  /* Margin top for .notification-severity; notification severity margin top 2. @token --frame-notification-severity-margin-top-2 */
  --_frame-default-notification-severity-margin-top-2-592688a9d8: 4px;
  margin-top: var(
    --frame-notification-severity-margin-top-2,
    var(--_frame-default-notification-severity-margin-top-2-592688a9d8)
  );
  /* Color for .notification-severity; notification severity color 2. @token --frame-notification-severity-color-2 */
  --_frame-default-notification-severity-color-2-1daf03b397: #4da7d4;
  color: var(
    --frame-notification-severity-color-2,
    var(--_frame-default-notification-severity-color-2-1daf03b397)
  );
}

.notification-item.error .notification-severity {
  /* Color for .notification-item.error .notification-severity; notification item error notification severity color. @token --frame-notification-item-error-notification-severity-color */
  --_frame-default-notification-item-error-notification-severity-color-4360ce29e2: #f48771;
  color: var(
    --frame-notification-item-error-notification-severity-color,
    var(
      --_frame-default-notification-item-error-notification-severity-color-4360ce29e2
    )
  );
}

.notification-item.warning .notification-severity {
  /* Color for .notification-item.warning .notification-severity; notification item warning notification severity color. @token --frame-notification-item-warning-notification-severity-color */
  --_frame-default-notification-item-warning-notification-severity-color-039e2f6d03: #dcca79;
  color: var(
    --frame-notification-item-warning-notification-severity-color,
    var(
      --_frame-default-notification-item-warning-notification-severity-color-039e2f6d03
    )
  );
}

.notification-item.success .notification-severity {
  /* Color for .notification-item.success .notification-severity; notification item success notification severity color. @token --frame-notification-item-success-notification-severity-color */
  --_frame-default-notification-item-success-notification-severity-color-83842669e3: #89bb8b;
  color: var(
    --frame-notification-item-success-notification-severity-color,
    var(
      --_frame-default-notification-item-success-notification-severity-color-83842669e3
    )
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
  /* Background for .notification-item:hover; notification item hover background. @token --frame-notification-item-hover-background */
  --_frame-default-notification-item-hover-background-200554aff0: #ffffff06;
  background: var(
    --frame-notification-item-hover-background,
    var(--_frame-default-notification-item-hover-background-200554aff0)
  );
}

.notification-details {
  /* Padding for .notification-details; notification details padding. @token --frame-notification-details-padding */
  --_frame-default-notification-details-padding-b19220334b: 5px 58px 4px 24px;
  padding: var(
    --frame-notification-details-padding,
    var(--_frame-default-notification-details-padding-b19220334b)
  );
  /* Font size for .notification-details; notification details font size. @token --frame-notification-details-font-size */
  --_frame-default-notification-details-font-size-a0d7758500: 12px;
  font-size: var(
    --frame-notification-details-font-size,
    var(--_frame-default-notification-details-font-size-a0d7758500)
  );
  /* Line height for .notification-details; notification details line height. @token --frame-notification-details-line-height */
  --_frame-default-notification-details-line-height-5d6671098b: 1.6;
  line-height: var(
    --frame-notification-details-line-height,
    var(--_frame-default-notification-details-line-height-5d6671098b)
  );
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.notification-details small {
  display: block;
  /* Color for .notification-details small; notification details small color. @token --frame-notification-details-small-color */
  --_frame-default-notification-details-small-color-c9b8c47fc1: #9ba2a5;
  color: var(
    --frame-notification-details-small-color,
    var(--_frame-default-notification-details-small-color-c9b8c47fc1)
  );
  /* Margin top for .notification-details small; notification details small margin top. @token --frame-notification-details-small-margin-top */
  --_frame-default-notification-details-small-margin-top-3a5ffb6f3b: 8px;
  margin-top: var(
    --frame-notification-details-small-margin-top,
    var(--_frame-default-notification-details-small-margin-top-3a5ffb6f3b)
  );
}

.notifications-empty {
  /* Padding for .notifications-empty; notifications empty padding. @token --frame-notifications-empty-padding */
  --_frame-default-notifications-empty-padding-f3ed852538: 20px;
  padding: var(
    --frame-notifications-empty-padding,
    var(--_frame-default-notifications-empty-padding-f3ed852538)
  );
  /* Color for .notifications-empty; muted. @token --frame-muted @context */
  color: var(--frame-muted);
  /* Font size for .notifications-empty; notifications empty font size. @token --frame-notifications-empty-font-size */
  --_frame-default-notifications-empty-font-size-0803e4640c: 12px;
  font-size: var(
    --frame-notifications-empty-font-size,
    var(--_frame-default-notifications-empty-font-size-0803e4640c)
  );
}

.notification-row > small {
  /* Color for .notification-row > small; muted. @token --frame-muted @context */
  color: var(--frame-muted);
  /* Font size for .notification-row > small; notification row small font size. @token --frame-notification-row-small-font-size */
  --_frame-default-notification-row-small-font-size-a260c3db86: 10px;
  font-size: var(
    --frame-notification-row-small-font-size,
    var(--_frame-default-notification-row-small-font-size-a260c3db86)
  );
  /* Line height for .notification-row > small; notification row small line height. @token --frame-notification-row-small-line-height */
  --_frame-default-notification-row-small-line-height-91de73d8d5: 24px;
  line-height: var(
    --frame-notification-row-small-line-height,
    var(--_frame-default-notification-row-small-line-height-91de73d8d5)
  );
}
</style>
