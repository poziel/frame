<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import type {StatusItem} from '../../framework/views/status';
import {useFrame} from '../../framework/useFrame';
import type {FrameMenuItem} from '../navigation/generalMenu';
import FrameButton from '../actions/FrameButton.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameTooltip from '../overlays/FrameTooltip.vue';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import StatusItemMenu from './StatusItemMenu.vue';

const props = withDefaults(
  defineProps<{item: StatusItem; placement?: 'status' | 'title'}>(),
  {placement: 'status'}
);
const frame = useFrame();
const root = ref<HTMLElement>();
const open = ref(false);
const anchor = ref<HTMLElement>();
const point = ref<{x: number; y: number}>();
const text = computed(
  () => props.item.text ?? (props.item.icon ? '' : props.item.label)
);
const badge = computed(() =>
  props.item.badgeVisible &&
  props.item.badge !== undefined &&
  props.item.badge !== ''
    ? props.item.badge
    : undefined
);
watch(
  [
    () => props.item.visible,
    () => props.item.available,
    () => props.item.showInStatusBar,
    () => frame.layout.statusBarVisible,
  ],
  () => {
    open.value = false;
    point.value = undefined;
  }
);
function click(event: MouseEvent) {
  point.value = undefined;
  if (props.item.menu) {
    anchor.value = event.currentTarget as HTMLElement;
    open.value = !open.value;
  } else frame.status.activate(props.item.id);
}
function context(event: MouseEvent | KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
  open.value = false;
  // Context menus belong to the actual focusable item, including for text entries.
  anchor.value =
    root.value?.querySelector<HTMLElement>('[data-status-control]') ??
    undefined;
  const rect = anchor.value?.getBoundingClientRect();
  if (rect)
    point.value = {
      x: 'clientX' in event && event.clientX ? event.clientX : rect.left,
      y: 'clientY' in event && event.clientY ? event.clientY : rect.bottom,
    };
}
function key(event: KeyboardEvent) {
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
    context(event);
}
function select(item: FrameMenuItem) {
  if (item.type !== 'separator' && item.command)
    void frame.executeCommand(item.command);
}
</script>
<template>
  <div
    ref="root"
    class="status-item-host"
    :class="{'status-item-icon-only': !text}"
    :data-status-id="item.id"
    :data-bar-item="item.id"
    @contextmenu="context"
    @keydown="key"
  >
    <FrameTooltip
      :text="item.tooltip ?? item.label"
      :shortcut="item.shortcut"
      :placement="placement === 'title' ? 'bottom' : 'top'"
      v-slot="{describedby}"
    >
      <component
        :is="item.kind === 'button' ? FrameButton : 'span'"
        data-status-control
        class="status-item"
        :class="{
          'status-item-button': item.kind === 'button',
          'titlebar-button': placement === 'title',
        }"
        :type="item.kind === 'button' ? 'button' : undefined"
        :tabindex="item.kind === 'text' ? 0 : undefined"
        :disabled="item.kind === 'button' ? item.disabled : undefined"
        :aria-label="item.label"
        :aria-describedby="describedby"
        :aria-description="badge === undefined ? undefined : `Badge: ${badge}`"
        :aria-haspopup="item.menu ? 'menu' : undefined"
        :aria-expanded="item.menu ? open : item.expanded"
        :aria-controls="item.controls"
        @click="item.kind === 'button' && click($event)"
      >
        <FrameIcon
          v-if="typeof item.icon === 'string'"
          :name="item.icon"
          :size="16"
        />
        <component v-else-if="item.icon" :is="item.icon" />
        <span v-if="text" class="status-item-text">{{ text }}</span>
        <span
          v-if="badge !== undefined"
          class="status-item-badge"
          aria-hidden="true"
          >{{ badge }}</span
        >
      </component>
    </FrameTooltip>
    <FrameDropdownMenu
      v-if="open && anchor && item.menu"
      :anchor="anchor"
      placement="bottom"
      :items="item.menu()"
      :label="item.label"
      @select="select"
      @close="open = false"
    />
    <StatusItemMenu
      v-if="point && anchor"
      :anchor="anchor"
      :point="point"
      :target-id="item.id"
      @close="point = undefined"
    />
  </div>
</template>

<style lang="scss">
.status-item-host {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 0 1 auto;
}

.status-item-icon-only {
  flex-shrink: 0;
}

.status-item-host .tooltip-trigger {
  display: flex;
  min-width: 0;
}

.status-item,
.status-bar button.frame-button.status-item {
  display: inline-flex;
  align-items: center;
  /* Space between children for .status-item, .status-bar button.frame-button.status-item. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Space between children for .status-item, .status-bar button.frame-button.status-item. @token --frame-status-bar-item-gap */
  --_frame-default-status-bar-item-gap-04ae50f042: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  gap: var(
    --frame-status-bar-item-gap,
    var(--_frame-default-status-bar-item-gap-04ae50f042)
  );
  min-width: 0;
  min-height: 20px;
  max-width: 100%;
  /* Space between children for .status-item, .status-bar button.frame-button.status-item. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Internal spacing for .status-item, .status-bar button.frame-button.status-item. @token --frame-status-item-padding */
  --_frame-default-status-item-padding-f326e8a036: 2px
    var(--frame-spacing-small, var(--_frame-default-spacing-small-3e5e0f3c4b));
  padding: var(
    --frame-status-item-padding,
    var(--_frame-default-status-item-padding-f326e8a036)
  );
  color: inherit;
  background: transparent;
  border: 0;
  font: inherit;
  /* Small shared corner radius used by inset rows and compact elements. @token --frame-radius-small @context */
  border-radius: var(--frame-radius-small);
}

.status-item:focus-visible {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  outline: 1px solid var(--frame-accent);
  outline-offset: -1px;
}

.status-item > svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.status-item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-item-badge {
  flex-shrink: 0;
  min-width: 14px;
  padding: 0 3px;
  text-align: center;
  /* Small shared corner radius used by inset rows and compact elements. @token --frame-radius-small @context */
  border-radius: var(--frame-radius-small);
  /* Background for .status-item-badge. @token --frame-status-badge-background */
  --_frame-default-status-badge-background-ed80b76efe: var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(
    --frame-status-badge-background,
    var(--_frame-default-status-badge-background-ed80b76efe)
  );
  /* Readable text and icon foreground on accent-filled surfaces. @token --frame-accent-foreground @context */
  color: var(--frame-accent-foreground);
  /* Text size for .status-item-badge. @token --frame-status-badge-font-size */
  --_frame-default-status-badge-font-size-1eef4a733f: 10px;
  font-size: var(
    --frame-status-badge-font-size,
    var(--_frame-default-status-badge-font-size-1eef4a733f)
  );
}
</style>
