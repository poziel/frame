<script setup lang="ts">
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  injectDialogRootContext,
} from 'reka-ui';
import type {Component} from 'vue';
import type {PanelAction} from '../../framework/views/shellViewContainer';
import {
  fitModal,
  initialModal,
  resizeModal,
  type ModalEdge,
  type ModalRect,
} from './modal';
import PanelActions from './PanelActions.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import {
  insetOverlayBounds,
  intersectOverlayBounds,
  overlayLayerStyle,
  useOverlayBoundary,
  viewportBounds,
} from '../overlays/overlays';

const props = withDefaults(
  defineProps<{
    /** Visible heading and accessible name for this presentation. */
    title: string;
    /** Vue icon component shown beside the presentation title. */
    icon?: Component;
    /** Header action definitions; available actions overflow when the header cannot fit them. */
    actions?: readonly PanelAction[];
    /** Optional element constraining modal geometry in addition to the owning overlay boundary. */
    bounds?: HTMLElement;
    /** Whether this modal is the active interactive presentation; defaults to true. */
    active?: boolean;
    /** Initial modal width in pixels, fitted to the available bounds. */
    width?: number;
    /** Initial modal height in pixels, fitted to the available bounds. */
    height?: number;
    /** Minimum modal height in pixels, subject to the available bounds. */
    minHeight?: number;
    /** Initial maximized presentation state. */
    maximized?: boolean;
    /** Content padding in pixels or a CSS shorthand; omission uses the modal theme token. */
    contentPadding?: number | string;
    /** Allows moving the modal with pointer and keyboard controls; defaults to true. */
    draggable?: boolean;
    /** Allows changing modal size with pointer and keyboard controls; defaults to true. */
    resizable?: boolean;
    /** Offers modal maximize and restore interaction; defaults to true. */
    maximizable?: boolean;
    /** Displays the title-bar close button; defaults to true. */
    showCloseButton?: boolean;
    /** Stacking position within the owning modal overlay layer; defaults to zero. */
    layer?: number;
  }>(),
  {
    active: true,
    layer: 0,
    draggable: true,
    resizable: true,
    maximizable: true,
    showCloseButton: true,
  }
);
const emit = defineEmits<{
  /** Requests dismissal of this presentation without disposing its owning controller. */
  close: [];
}>();
// Frame restores focus when a presentation is disposed, not when another modal activates.
const FrameFocusOwner = defineComponent({
  setup() {
    const context = injectDialogRootContext();
    onMounted(() => {
      context.triggerElement.value = undefined;
    });
    return () => null;
  },
});
const dialog = ref<HTMLElement>();
const {
  bounds: boundary,
  target,
  getBounds,
} = useOverlayBoundary(() => props.bounds ?? dialog.value);
const layerBounds = ref(viewportBounds());
const layerStyle = computed(() => ({
  ...overlayLayerStyle(layerBounds.value),
  zIndex: 60 + props.layer * 2,
}));
const maximized = ref(props.maximized ?? false);
const area = reactive<ModalRect>({x: 6, y: 40, width: 800, height: 600});
const rect = reactive<ModalRect>({...area});
const style = computed(() => {
  const box = maximized.value ? area : rect;
  return {
    left: `${box.x}px`,
    top: `${box.y}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  };
});
let previousFocus: HTMLElement | null = null;
let observer: ResizeObserver | undefined;
let stopGesture: (() => void) | undefined;
let initialized = false;
function measure() {
  const requested = props.bounds?.getBoundingClientRect();
  layerBounds.value = requested
    ? intersectOverlayBounds(getBounds(), requested)
    : getBounds();
  const bounds = insetOverlayBounds(layerBounds.value);
  Object.assign(area, {
    x: bounds.left,
    y: bounds.top,
    width: bounds.width,
    height: bounds.height,
  });
  if (!initialized) {
    Object.assign(
      rect,
      initialModal(area, props.width, props.height, props.minHeight)
    );
    initialized = true;
  } else Object.assign(rect, fitModal(rect, area, props.minHeight));
}
function focusInitial() {
  (
    dialog.value?.querySelector<HTMLElement>(
      '[data-modal-autofocus], [autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)'
    ) ?? dialog.value
  )?.focus();
}
function escape(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  event.preventDefault();
  if (!props.active || event.isComposing) return;
  event.stopPropagation();
  emit('close');
}
function ownsPopup(target: HTMLElement) {
  const popup = target.closest<HTMLElement>(
    '.frame-select-popup, .frame-advanced-popup, .frame-date-popover, .frame-color-picker-popover'
  );
  if (
    !popup?.id ||
    popup.closest('.frame-overlay-host') !==
      dialog.value?.closest('.frame-overlay-host')
  )
    return false;
  // Reka portals keep their logical owner through the trigger's ARIA relationship.
  return Array.from(
    dialog.value?.querySelectorAll<HTMLElement>(
      '[aria-controls], [aria-owns]'
    ) ?? []
  ).some((control) =>
    [
      control.getAttribute('aria-controls'),
      control.getAttribute('aria-owns'),
    ].some((ids) => ids?.split(/\s+/).includes(popup.id))
  );
}
function focusGuard(event: FocusEvent) {
  const target = event.target as HTMLElement;
  if (
    props.active &&
    !dialog.value?.contains(target) &&
    !target.closest('.frame-menu, .palette-backdrop') &&
    !ownsPopup(target)
  )
    focusInitial();
}
function toggleMaximize() {
  if (!props.maximizable) return;
  stopGesture?.();
  maximized.value = !maximized.value;
}
function begin(event: PointerEvent, edge?: ModalEdge) {
  if (
    !props.active ||
    (edge ? !props.resizable : !props.draggable) ||
    maximized.value ||
    event.button !== 0
  )
    return;
  if (
    !edge &&
    (event.target as HTMLElement).closest('button, input, a, select, textarea')
  )
    return;
  event.preventDefault();
  stopGesture?.();
  const element = event.currentTarget as HTMLElement;
  element.setPointerCapture(event.pointerId);
  const origin = {...rect};
  const x = event.clientX,
    y = event.clientY;
  function move(next: PointerEvent) {
    if (next.pointerId !== event.pointerId) return;
    Object.assign(
      rect,
      edge
        ? resizeModal(
            origin,
            edge,
            next.clientX - x,
            next.clientY - y,
            area,
            props.minHeight
          )
        : fitModal(
            {
              ...origin,
              x: origin.x + next.clientX - x,
              y: origin.y + next.clientY - y,
            },
            area,
            props.minHeight
          )
    );
  }
  function finish(next: PointerEvent) {
    if (next.pointerId === event.pointerId) stopGesture?.();
  }
  function cancel() {
    Object.assign(rect, origin);
    stopGesture?.();
  }
  stopGesture = () => {
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', finish);
    element.removeEventListener('pointercancel', cancel);
    element.removeEventListener('lostpointercapture', finish);
    if (element.hasPointerCapture(event.pointerId))
      element.releasePointerCapture(event.pointerId);
    stopGesture = undefined;
  };
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', finish);
  element.addEventListener('pointercancel', cancel);
  element.addEventListener('lostpointercapture', finish);
}
function headerKey(event: KeyboardEvent) {
  if (
    !props.active ||
    (event.shiftKey ? !props.resizable : !props.draggable) ||
    !event.altKey ||
    maximized.value ||
    !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  const dx =
    event.key === 'ArrowLeft' ? -10 : event.key === 'ArrowRight' ? 10 : 0;
  const dy = event.key === 'ArrowUp' ? -10 : event.key === 'ArrowDown' ? 10 : 0;
  Object.assign(
    rect,
    event.shiftKey
      ? resizeModal(rect, 'se', dx, dy, area, props.minHeight)
      : fitModal(
          {...rect, x: rect.x + dx, y: rect.y + dy},
          area,
          props.minHeight
        )
  );
}
onMounted(() => {
  previousFocus = document.activeElement as HTMLElement;
  measure();
  observer = new ResizeObserver(measure);
  if (props.bounds) observer.observe(props.bounds);
  window.addEventListener('resize', measure);
  document.addEventListener('focusin', focusGuard);
  if (props.active) focusInitial();
});
watch(
  () => props.bounds,
  () => {
    measure();
    observer?.disconnect();
    if (props.bounds) observer?.observe(props.bounds);
  },
  {flush: 'post'}
);
if (boundary) watch(boundary, measure);
watch(
  () => props.active,
  async (active) => {
    if (active) {
      await nextTick();
      focusInitial();
    }
  }
);
onBeforeUnmount(() => {
  stopGesture?.();
  observer?.disconnect();
  window.removeEventListener('resize', measure);
  document.removeEventListener('focusin', focusGuard);
  if (props.active)
    void nextTick(() => {
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]'))
        previousFocus.focus();
    });
});
defineSlots<{
  /** Modal body rendered within the configured content padding. */ default?(): unknown;
  /** Additional title-bar controls before window actions. */ 'header-actions'?(): unknown;
  /** Optional footer content; omission reserves no footer area. */ footer?(): unknown;
}>();
</script>
<template>
  <DialogRoot :open="active" :modal="false"
    ><Teleport :to="target"
      ><div
        class="frame-modal-layer frame-overlay-interactive"
        :style="layerStyle"
        :inert="!active || undefined"
        @contextmenu.prevent
        ><div class="frame-modal-backdrop" /><DialogContent
          force-mount
          as-child
          :aria-describedby="undefined"
          @escape-key-down="escape"
          @pointer-down-outside.prevent
          @interact-outside.prevent
          @open-auto-focus.prevent="focusInitial"
          @close-auto-focus.prevent
          ><section
            ref="dialog"
            :aria-modal="active ? true : undefined"
            tabindex="-1"
            class="frame-modal frame-overlay-surface frame-scroll-scope"
            :class="{maximized, 'no-drag': !draggable}"
            :style="style"
          >
            <header
              class="frame-modal-header"
              tabindex="0"
              :aria-label="
                draggable || resizable ? 'Move or resize modal' : title
              "
              @pointerdown="begin($event)"
              @dblclick.self="toggleMaximize"
              @keydown="headerKey"
              ><component
                v-if="icon"
                :is="icon"
                class="modal-icon" /><DialogTitle
                as="h2"
                @dblclick="toggleMaximize"
                >{{ title }}</DialogTitle
              ><PanelActions :actions="actions" /><slot
                name="header-actions" /><span
                v-if="
                  maximizable && (actions?.length || $slots['header-actions'])
                "
                class="frame-modal-header-separator"
                role="separator"
                aria-orientation="vertical" /><FrameIconButton
                v-if="maximizable"
                :label="maximized ? 'Restore modal' : 'Maximize modal'"
                :icon="maximized ? 'screen-normal' : 'screen-full'"
                tooltip-placement="bottom"
                @click="toggleMaximize" /><FrameIconButton
                v-if="showCloseButton"
                label="Close modal"
                icon="close"
                @click="emit('close')"
            /></header>
            <div
              class="frame-modal-content"
              :style="{
                padding:
                  typeof contentPadding === 'number'
                    ? `${contentPadding}px`
                    : contentPadding,
              }"
              ><slot /></div
            ><footer v-if="$slots.footer" class="frame-modal-footer"
              ><slot name="footer"
            /></footer>
            <template v-if="resizable && !maximized"
              ><div
                v-for="edge in [
                  'n',
                  's',
                  'e',
                  'w',
                  'ne',
                  'nw',
                  'se',
                  'sw',
                ] as const"
                :key="edge"
                class="modal-resize"
                :class="edge"
                aria-hidden="true"
                @pointerdown="begin($event, edge)"
            /></template> </section></DialogContent></div
      ><OverlayScrollbars :root="dialog" /></Teleport
    ><FrameFocusOwner
  /></DialogRoot>
</template>

<style lang="scss">
@use '../../styles/mixins/surfaces';

.frame-modal-layer {
  position: fixed;
  inset: 0;
  /* Value of font for .frame-modal-layer. @token --frame-modal-layer-font */
  --_frame-default-modal-layer-font-5a4faa6201: 12px system-ui;
  font: var(
    --frame-modal-layer-font,
    var(--_frame-default-modal-layer-font-5a4faa6201)
  );
  /* Foreground for .frame-modal-layer. @token --frame-modal-layer-color */
  --_frame-default-modal-layer-color-d589627b52: #d0d2d4;
  color: var(
    --frame-modal-layer-color,
    var(--_frame-default-modal-layer-color-d589627b52)
  );
}

.frame-modal-layer,
.frame-modal-layer * {
  box-sizing: border-box;
}

.frame-modal-backdrop {
  position: absolute;
  inset: 0;
  /* Background for .frame-modal-backdrop. @token --frame-modal-backdrop-background */
  --_frame-default-modal-backdrop-background-be5275b5b5: #0006;
  background: var(
    --frame-modal-backdrop-background,
    var(--_frame-default-modal-backdrop-background-be5275b5b5)
  );
}

.frame-modal {
  position: fixed;
  display: flex;
  flex-direction: column;
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  /* Shared corner radius of panel containers and larger floating surfaces. @token --frame-panel-radius @context */
  /* Shared translucent fill for floating surfaces over the application canvas. @token --frame-overlay-background @context */
  @include surfaces.framed-surface(
    1px solid var(--frame-line),
    var(--frame-panel-radius),
    var(--frame-overlay-background)
  );
  /* Blur and saturation treatment behind shared translucent floating surfaces. @token --frame-overlay-backdrop-filter @context */
  backdrop-filter: var(--frame-overlay-backdrop-filter);
  /* Elevation shadow separating floating overlays from underlying content. @token --frame-overlay-shadow @context */
  box-shadow: var(--frame-overlay-shadow);
  /* Outline for .frame-modal. @token --frame-modal-outline */
  --_frame-default-modal-outline-e6ed6df6b7: none;
  outline: var(
    --frame-modal-outline,
    var(--_frame-default-modal-outline-e6ed6df6b7)
  );
}

.frame-modal-header {
  display: flex;
  align-items: center;
  /* Space between children for .frame-modal-header. @token --frame-modal-header-gap */
  --_frame-default-modal-header-gap-6eb82ae436: 8px;
  gap: var(
    --frame-modal-header-gap,
    var(--_frame-default-modal-header-gap-6eb82ae436)
  );
  /* Internal spacing for .frame-modal-header. @token --frame-modal-header-padding */
  --_frame-default-modal-header-padding-109034d7d7: 0 8px 0 12px;
  padding: var(
    --frame-modal-header-padding,
    var(--_frame-default-modal-header-padding-109034d7d7)
  );
  /* Minimum height for .frame-modal-header. @token --frame-modal-header-min-height */
  --_frame-default-modal-header-min-height-bcf30a0afa: 34px;
  min-height: var(
    --frame-modal-header-min-height,
    var(--_frame-default-modal-header-min-height-bcf30a0afa)
  );
  flex-shrink: 0;
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-bottom: 1px solid var(--frame-line);
  /* Corner radius for .frame-modal-header. @token --frame-modal-header-border-radius */
  --_frame-default-modal-header-border-radius-7cf8ffdbc3: var(
      --frame-radius-large
    )
    var(--frame-radius-large) 0 0;
  /* Large shared corner radius used by panel and menu containers. @token --frame-radius-large @context */
  border-radius: var(
    --frame-modal-header-border-radius,
    var(--_frame-default-modal-header-border-radius-7cf8ffdbc3)
  );
  /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
  background: var(--frame-surface);
  cursor: move;
  touch-action: none;
  user-select: none;
}

.frame-modal-header h2 {
  font: inherit;
  /* Outer spacing for .frame-modal-header h2. @token --frame-modal-header-h2-margin */
  --_frame-default-modal-header-h2-margin-92b160e847: 0;
  margin: var(
    --frame-modal-header-h2-margin,
    var(--_frame-default-modal-header-h2-margin-92b160e847)
  );
  /* Text weight for .frame-modal-header h2. @token --frame-modal-header-h2-font-weight */
  --_frame-default-modal-header-h2-font-weight-d752cfcdce: 500;
  font-weight: var(
    --frame-modal-header-h2-font-weight,
    var(--_frame-default-modal-header-h2-font-weight-d752cfcdce)
  );
  flex: 1;
  /* Minimum width for .frame-modal-header h2. @token --frame-modal-header-h2-min-width */
  --_frame-default-modal-header-h2-min-width-9953e1b293: 0;
  min-width: var(
    --frame-modal-header-h2-min-width,
    var(--_frame-default-modal-header-h2-min-width-9953e1b293)
  );
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-icon {
  /* Width for .modal-icon. @token --frame-modal-icon-width */
  --_frame-default-modal-icon-width-1be3aabd2a: 16px;
  width: var(
    --frame-modal-icon-width,
    var(--_frame-default-modal-icon-width-1be3aabd2a)
  );
  /* Height for .modal-icon. @token --frame-modal-icon-height */
  --_frame-default-modal-icon-height-37dd9efb0d: 16px;
  height: var(
    --frame-modal-icon-height,
    var(--_frame-default-modal-icon-height-37dd9efb0d)
  );
}

.frame-modal-content {
  /* Minimum height for .frame-modal-content. @token --frame-modal-content-min-height */
  --_frame-default-modal-content-min-height-42b6bcd057: 0;
  min-height: var(
    --frame-modal-content-min-height,
    var(--_frame-default-modal-content-min-height-42b6bcd057)
  );
  flex: 1;
  overflow: auto;
}

.modal-resize {
  position: absolute;
  touch-action: none;
}

.modal-resize.n,
.modal-resize.s {
  /* Height for .modal-resize.n, .modal-resize.s. @token --frame-modal-resize-n-height */
  --_frame-default-modal-resize-n-height-f1f40ac622: 8px;
  height: var(
    --frame-modal-resize-n-height,
    var(--_frame-default-modal-resize-n-height-f1f40ac622)
  );
  left: 10px;
  right: 10px;
  cursor: ns-resize;
}

.modal-resize.n {
  top: -4px;
}

.modal-resize.s {
  bottom: -4px;
}

.modal-resize.e,
.modal-resize.w {
  /* Width for .modal-resize.e, .modal-resize.w. @token --frame-modal-resize-e-width */
  --_frame-default-modal-resize-e-width-1195d78c34: 8px;
  width: var(
    --frame-modal-resize-e-width,
    var(--_frame-default-modal-resize-e-width-1195d78c34)
  );
  top: 10px;
  bottom: 10px;
  cursor: ew-resize;
}

.modal-resize.e {
  right: -4px;
}

.modal-resize.w {
  left: -4px;
}

.modal-resize.ne,
.modal-resize.nw,
.modal-resize.se,
.modal-resize.sw {
  /* Width for .modal-resize.ne, .modal-resize.nw, .modal-resize.se, .modal-resize.sw. @token --frame-modal-resize-ne-width */
  --_frame-default-modal-resize-ne-width-15e0e4b060: 16px;
  width: var(
    --frame-modal-resize-ne-width,
    var(--_frame-default-modal-resize-ne-width-15e0e4b060)
  );
  /* Height for .modal-resize.ne, .modal-resize.nw, .modal-resize.se, .modal-resize.sw. @token --frame-modal-resize-ne-height */
  --_frame-default-modal-resize-ne-height-f926fa1400: 16px;
  height: var(
    --frame-modal-resize-ne-height,
    var(--_frame-default-modal-resize-ne-height-f926fa1400)
  );
}

.modal-resize.ne {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.modal-resize.nw {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.modal-resize.se {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.modal-resize.sw {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.frame-modal {
  /* Foreground for .frame-modal. @token --frame-modal-color */
  --_frame-default-modal-color-2e0972ca74: #d4d4d4;
  color: var(--frame-modal-color, var(--_frame-default-modal-color-2e0972ca74));
}

.frame-modal-content {
  /* Internal spacing for .frame-modal-content. @token --frame-modal-content-padding */
  --_frame-default-modal-content-padding-c751aac5c4: 0;
  padding: var(
    --frame-modal-content-padding,
    var(--_frame-default-modal-content-padding-c751aac5c4)
  );
}

.frame-modal.no-drag .frame-modal-header {
  cursor: default;
  touch-action: auto;
}

.frame-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* Space between children for .frame-modal-footer. @token --frame-modal-footer-gap */
  --_frame-default-modal-footer-gap-d7720fc4a6: 8px;
  gap: var(
    --frame-modal-footer-gap,
    var(--_frame-default-modal-footer-gap-d7720fc4a6)
  );
  /* Internal spacing for .frame-modal-footer. @token --frame-modal-footer-padding */
  --_frame-default-modal-footer-padding-e917be8127: 8px 12px;
  padding: var(
    --frame-modal-footer-padding,
    var(--_frame-default-modal-footer-padding-e917be8127)
  );
  /* Minimum height for .frame-modal-footer. @token --frame-modal-header-min-height */
  --_frame-default-modal-header-min-height-bcf30a0afa: 34px;
  min-height: var(
    --frame-modal-header-min-height,
    var(--_frame-default-modal-header-min-height-bcf30a0afa)
  );
  flex-shrink: 0;
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-top: 1px solid var(--frame-line);
  /* Large shared corner radius used by panel and menu containers. @token --frame-radius-large @context */
  border-radius: 0 0 var(--frame-radius-large) var(--frame-radius-large);
  /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
  background: var(--frame-surface);
}

.frame-modal-header-separator {
  align-self: stretch;
  /* Width for .frame-modal-header-separator. @token --frame-modal-header-separator-width */
  --_frame-default-modal-header-separator-width-c835aaefed: 1px;
  width: var(
    --frame-modal-header-separator-width,
    var(--_frame-default-modal-header-separator-width-c835aaefed)
  );
  /* Outer spacing for .frame-modal-header-separator. @token --frame-modal-header-separator-margin */
  --_frame-default-modal-header-separator-margin-af197dead3: 7px 2px;
  margin: var(
    --frame-modal-header-separator-margin,
    var(--_frame-default-modal-header-separator-margin-af197dead3)
  );
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  background: var(--frame-line);
  flex-shrink: 0;
}
</style>
