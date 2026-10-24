<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { StatusItem } from '../frame/status';
import { useFrame } from '../frame/createFrame';
import type { FrameMenuItem } from '../types';
import FrameButton from './FrameButton.vue';
import FrameIcon from './FrameIcon.vue';
import FrameTooltip from './FrameTooltip.vue';
import FrameDropdownMenu from './FrameDropdownMenu.vue';
import StatusItemMenu from './StatusItemMenu.vue';
const props = withDefaults(defineProps<{ item: StatusItem; placement?: 'status' | 'title' }>(), { placement: 'status' });
const frame = useFrame();
const root = ref<HTMLElement>();
const open = ref(false);
const anchor = ref<HTMLElement>();
const point = ref<{ x: number; y: number }>();
const text = computed(() => props.item.text ?? (props.item.icon ? '' : props.item.label));
const badge = computed(() => props.item.badgeVisible && props.item.badge !== undefined && props.item.badge !== '' ? props.item.badge : undefined);
watch([() => props.item.visible, () => props.item.available, () => props.item.showInStatusBar, () => frame.layout.statusBarVisible], () => { open.value = false; point.value = undefined; });
function click(event: MouseEvent) {
  point.value = undefined;
  if (props.item.menu) { anchor.value = event.currentTarget as HTMLElement; open.value = !open.value; }
  else frame.status.activate(props.item.id);
}
function context(event: MouseEvent | KeyboardEvent) {
  event.preventDefault(); event.stopPropagation(); open.value = false;
  // Context menus belong to the actual focusable item, including for text entries.
  anchor.value = root.value?.querySelector<HTMLElement>('[data-status-control]') ?? undefined;
  const rect = anchor.value?.getBoundingClientRect();
  if (rect) point.value = { x: 'clientX' in event && event.clientX ? event.clientX : rect.left, y: 'clientY' in event && event.clientY ? event.clientY : rect.bottom };
}
function key(event: KeyboardEvent) { if (event.key === 'ContextMenu' || event.shiftKey && event.key === 'F10') context(event); }
function select(item: FrameMenuItem) { if (item.type !== 'separator' && item.command) void frame.executeCommand(item.command); }
</script>
<template>
  <div ref="root" class="status-item-host" :class="{ 'status-item-icon-only': !text }" :data-status-id="item.id" :data-bar-item="item.id" @contextmenu="context" @keydown="key">
    <FrameTooltip :text="item.tooltip ?? item.label" :shortcut="item.shortcut" :placement="placement === 'title' ? 'bottom' : 'top'" v-slot="{ describedby }">
      <component :is="item.kind === 'button' ? FrameButton : 'span'" data-status-control class="status-item" :class="{ 'status-item-button': item.kind === 'button', 'titlebar-button': placement === 'title' }"
        :type="item.kind === 'button' ? 'button' : undefined" :tabindex="item.kind === 'text' ? 0 : undefined" :disabled="item.kind === 'button' ? item.disabled : undefined"
        :aria-label="item.label" :aria-describedby="describedby" :aria-description="badge === undefined ? undefined : `Badge: ${badge}`" :aria-haspopup="item.menu ? 'menu' : undefined" :aria-expanded="item.menu ? open : item.expanded" :aria-controls="item.controls"
        @click="item.kind === 'button' && click($event)">
        <FrameIcon v-if="typeof item.icon === 'string'" :name="item.icon" :size="16" />
        <component v-else-if="item.icon" :is="item.icon" />
        <span v-if="text" class="status-item-text">{{ text }}</span>
        <span v-if="badge !== undefined" class="status-item-badge" aria-hidden="true">{{ badge }}</span>
      </component>
    </FrameTooltip>
    <FrameDropdownMenu v-if="open && anchor && item.menu" :anchor="anchor" placement="bottom" :items="item.menu()" :label="item.label" @select="select" @close="open = false" />
    <StatusItemMenu v-if="point && anchor" :anchor="anchor" :point="point" :target-id="item.id" @close="point = undefined" />
  </div>
</template>
