<script
  setup
  lang="ts"
  generic="T extends FrameGeneralMenuItem | FrameMenuItem"
>
import {computed, ref, inject} from 'vue';
import {frameKey} from '../../framework/useFrame';
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  useForwardPropsEmits,
  useEmitAsProps,
  type ContextMenuRootProps,
  type ContextMenuRootEmits,
  type ContextMenuContentProps,
  type ContextMenuContentEmits,
} from 'reka-ui';
import {normalizeMenuItems, type FrameGeneralMenuItem} from './generalMenu';
import type {FrameMenuItem} from './generalMenu';
import MenuList from './MenuList.vue';
import MenuItemContent from './MenuItemContent.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import AnchoredMenu from './AnchoredMenu.vue';
import {useId} from 'vue';
import {useOverlayBoundary} from '../overlays/overlays';
import '../shared/general-c.css';

const commandFrame = inject(frameKey, undefined);
defineOptions({inheritAttrs: false});

const props = withDefaults(
  defineProps<
    ContextMenuRootProps & {
      /** Menu entries normalized and rendered by this menu presentation. */
      items: readonly T[];
      /** Accessible name for this component and its built-in control or region. */
      label?: string;
      /** Horizontal alignment of item content within menu rows. */
      itemAlignment?: 'left' | 'center' | 'right';
      /** Element used to resolve the owning shell overlay boundary. */
      anchor?: HTMLElement;
      /** Optional viewport coordinates used instead of the anchor edge for placement. */
      point?: {
        x: number;
        y: number;
      };
      /** Preferred physical side for the overlay, subject to available space. */
      placement?: 'bottom' | 'right';
      /** Stable identifier for this menu presentation. */
      id?: string;
      /** Text for the built-in trigger when no trigger slot is supplied. */
      triggerLabel?: string;
      /** Properties forwarded to the overlay content primitive, separate from root state. */
      contentProps?: ContextMenuContentProps;
    }
  >(),
  {open: undefined, modal: false}
);
const emit = defineEmits<
  Omit<ContextMenuRootEmits, 'update:open'> &
    Omit<ContextMenuContentEmits, 'openAutoFocus'> & {
      /** Requests a new controlled context-menu open state. */
      'update:open': ContextMenuRootEmits['update:open'];
      /** Before the context menu receives focus; preventDefault overrides automatic focusing. */
      openAutoFocus: ContextMenuContentEmits['openAutoFocus'];
      /** Requests dismissal of the anchored menu presentation. */
      close: [];
      /** Emitted with the selected item and originating event when available. */
      select: [item: T, event?: Event];
    }
>();
const contentEvents = useEmitAsProps(emit);
const rootProps = computed(() => {
  const {
    items,
    label,
    itemAlignment,
    anchor,
    point,
    placement,
    id,
    triggerLabel,
    contentProps,
    ...root
  } = props;
  return root;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
const localOpen = ref(false);
const menuOpen = computed({
  get: () => props.open ?? localOpen.value,
  set: (value: boolean) => {
    localOpen.value = value;
    emit('update:open', value);
  },
});
const rootBindings = computed(() =>
  Object.fromEntries(
    Object.entries(forwarded.value).filter(
      ([key]) => !key.startsWith('on') || key.startsWith('onUpdate:')
    )
  )
);
const triggerAnchor = ref<HTMLElement>();
const owner = useId();
const normalized = computed(() =>
  commandFrame
    ? commandFrame.resolveMenuItems(normalizeMenuItems(props.items))
    : normalizeMenuItems(props.items)
);
const content = ref<{$el: HTMLElement}>();
const surface = computed(() => {
  const element = content.value?.$el;
  return element instanceof HTMLElement
    ? (element.querySelector<HTMLElement>('[data-reka-menu-content]') ??
        element)
    : undefined;
});
function selected(item: FrameMenuItem, event?: Event) {
  emit(
    'select',
    (props.items.find((original) => original.id === item.id) ?? item) as T,
    event
  );
}
const {target, bounds} = useOverlayBoundary(() => triggerAnchor.value);
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
defineSlots<{
  /** Trigger element for the ordinary context-menu presentation. */ trigger?(): unknown;
  /** Content before the ordinary context-menu entries. */ before?(): unknown;
  /** Additional content after the ordinary context-menu entries. */ default?(): unknown;
  /** Replaces the content of one normalized menu entry. */ item?(
    props: {
    item: FrameMenuItem;
  }
  ): unknown;
}>();
</script>
<template>
  <AnchoredMenu
    v-if="anchor"
    :anchor="anchor"
    :point="point"
    :placement="placement"
    :items="normalized"
    :label="label"
    :id="id"
    :item-alignment="itemAlignment"
    @close="emit('close')"
    @select="selected"
  /><ContextMenuRoot
    v-else
    v-bind="rootBindings"
    v-model:open="menuOpen"
    :modal="modal ?? false"
    ><span ref="triggerAnchor" class="frame-general-anchor" @contextmenu.stop
      ><ContextMenuTrigger as-child
        ><slot name="trigger"
          ><button type="button" class="frame-general-button">{{
            triggerLabel ?? 'Right click for actions'
          }}</button></slot
        ></ContextMenuTrigger
      ></span
    ><ContextMenuPortal :to="target"
      ><ContextMenuContent
        v-bind="{...contentEvents, ...contentProps, ...$attrs}"
        ref="content"
        class="frame-menu"
        @pointermove="
          ($event.currentTarget as HTMLElement).dataset.menuInput = 'pointer'
        "
        @keydown.capture="
          ($event.currentTarget as HTMLElement).dataset.menuInput = 'keyboard'
        "
        :aria-label="label"
        :aria-labelledby="undefined"
        :data-item-alignment="itemAlignment ?? 'left'"
        :data-frame-menu-owner="owner"
        :collision-boundary="collisionBoundary"
        :collision-padding="8"
        :style="{
          maxHeight: Math.max(0, bounds.height - 16) + 'px',
          maxWidth: Math.max(0, bounds.width - 16) + 'px',
        }"
        ><slot name="before" /><MenuList
          :items="normalized"
          kind="context"
          :owner="owner"
          :anchor="triggerAnchor!"
          :item-alignment="itemAlignment ?? 'left'"
          @select="selected"
          @dismiss="menuOpen = false"
          ><template v-if="$slots.item" #item="scope"
            ><slot name="item" :item="scope.item"
              ><MenuItemContent
                :item="scope.item" /></slot></template></MenuList
        ><slot /></ContextMenuContent
      ><OverlayScrollbars v-if="surface" :root="surface" /></ContextMenuPortal
  ></ContextMenuRoot>
</template>
