<script setup lang="ts">
import {inject} from 'vue';
import {frameKey} from '../../framework/useFrame';
import {computed, onBeforeUnmount, onMounted, ref, useId} from 'vue';
import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuPortal,
  ContextMenuRoot,
  ContextMenuContent,
  ContextMenuPortal,
} from 'reka-ui';
import type {FrameMenuItem} from './generalMenu';
import {useOverlayBoundary} from '../overlays/overlays';
import MenuList from './MenuList.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';

const commandFrame = inject(frameKey, undefined);
const resolvedItems = computed(() =>
  commandFrame ? commandFrame.resolveMenuItems(props.items) : props.items
);
const props = withDefaults(
  defineProps<{
    /** Stable identifier for this menu presentation. */
    id?: string;
    /** Element used to resolve the owning shell overlay boundary. */
    anchor: HTMLElement;
    /** Menu entries normalized and rendered by this menu presentation. */
    items: readonly FrameMenuItem[];
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
    /** Preferred physical side for the overlay, subject to available space. */
    placement?: 'bottom' | 'right';
    /** Optional viewport coordinates used instead of the anchor edge for placement. */
    point?: {
      x: number;
      y: number;
    };
    /** Horizontal alignment of item content within menu rows. */
    itemAlignment?: 'left' | 'center' | 'right';
  }>(),
  {itemAlignment: 'left'}
);
const emit = defineEmits<{
  /** Requests dismissal of the anchored menu presentation. */
  close: [];
  /** Emitted with the selected item and originating event when available. */
  select: [item: FrameMenuItem];
}>();
const parts = computed(() =>
  props.point
    ? {
        root: ContextMenuRoot,
        content: ContextMenuContent,
        portal: ContextMenuPortal,
      }
    : {
        root: DropdownMenuRoot,
        content: DropdownMenuContent,
        portal: DropdownMenuPortal,
      }
);
const owner = useId();
const {target, bounds} = useOverlayBoundary(() => props.anchor);
const content = ref<{$el: HTMLElement}>();
const surface = computed(
  () =>
    content.value?.$el?.querySelector<HTMLElement>(
      '[data-reka-menu-content]'
    ) ?? content.value?.$el
);
const reference = computed(() =>
  props.point
    ? {
        getBoundingClientRect: () =>
          new DOMRect(props.point!.x, props.point!.y, 0, 0),
        contextElement: props.anchor,
      }
    : props.anchor
);
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
let closed = false;
let restoreFocus = true;
function close() {
  if (!closed) {
    closed = true;
    emit('close');
  }
}
function select(item: FrameMenuItem) {
  close();
  emit('select', item);
}
function dismissTriggerClick(event: MouseEvent) {
  // Consume the trigger's toggle click so dismissal cannot immediately reopen it.
  event.stopImmediatePropagation();
  restoreFocus = false;
  close();
}
function interactOutside(event: CustomEvent<{originalEvent: Event}>) {
  const original = event.detail.originalEvent;
  const onAnchor = props.anchor.contains(event.target as Node);
  if (!(original instanceof PointerEvent) && onAnchor) {
    event.preventDefault();
    return;
  }
  if (
    !props.point &&
    onAnchor &&
    original instanceof PointerEvent &&
    original.button === 0
  ) {
    event.preventDefault();
    props.anchor.addEventListener('click', dismissTriggerClick, {
      capture: true,
      once: true,
    });
    return;
  }
  restoreFocus = false;
}
function restore(event: Event) {
  event.preventDefault();
  if (restoreFocus && props.anchor.isConnected)
    props.anchor.focus({preventScroll: true});
}
function autofocus(event: Event) {
  event.preventDefault();
  const menu = event.target as HTMLElement;
  (
    menu.querySelector<HTMLElement>(
      '[data-reka-collection-item]:not([data-disabled])'
    ) ?? menu
  ).focus({preventScroll: true});
}
onMounted(() => window.addEventListener('resize', close));
onBeforeUnmount(() => {
  window.removeEventListener('resize', close);
  props.anchor.removeEventListener('click', dismissTriggerClick, true);
});
</script>
<template>
  <component
    :is="parts.root"
    :open="true"
    :modal="false"
    @update:open="!$event && close()"
  >
    <component :is="parts.portal" :to="target">
      <component
        :is="parts.content"
        ref="content"
        :id="id"
        class="frame-menu"
        @pointermove="
          ($event.currentTarget as HTMLElement).dataset.menuInput = 'pointer'
        "
        @keydown.capture="
          ($event.currentTarget as HTMLElement).dataset.menuInput = 'keyboard'
        "
        :data-item-alignment="itemAlignment"
        :data-frame-menu-owner="owner"
        :aria-label="label ?? 'Menu'"
        :aria-labelledby="undefined"
        :reference="reference"
        :side="point || placement === 'right' ? 'right' : 'bottom'"
        align="start"
        :side-offset="point ? 0 : 4"
        :collision-boundary="collisionBoundary"
        :collision-padding="6"
        :style="{
          minWidth: Math.min(240, bounds.width - 12) + 'px',
          maxWidth: Math.max(0, bounds.width - 12) + 'px',
          maxHeight:
            'min(' +
            Math.max(0, bounds.height - 12) +
            'px, var(--reka-popper-available-height))',
        }"
        loop
        @open-auto-focus="autofocus"
        @close-auto-focus="restore"
        @interact-outside="interactOutside"
      >
        <MenuList
          :kind="point ? 'context' : 'dropdown'"
          :items="resolvedItems"
          :item-alignment="itemAlignment"
          :owner="owner"
          :anchor="anchor"
          @select="select"
          @dismiss="close"
          ><template v-if="$slots['item-actions']" #item-actions="scope"
            ><slot name="item-actions" v-bind="scope" /></template
        ></MenuList>
      </component>
      <OverlayScrollbars v-if="surface" :root="surface" />
    </component>
  </component>
</template>
