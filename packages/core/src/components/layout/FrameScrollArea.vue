<script setup lang="ts">
import {computed} from 'vue';
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  useForwardProps,
  type ScrollAreaRootProps,
} from 'reka-ui';
import './styles/disclosure-and-layout.scss';

interface Props extends ScrollAreaRootProps {

  /** Axes with custom scrollbars. */
  orientation?: 'vertical' | 'horizontal' | 'both';

  /** Accessible name for the keyboard-focusable scrolling region. */
  viewportLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {orientation: 'vertical'});
const rootProps = computed(() => {
  const {orientation, viewportLabel, ...root} = props;
  return root;
});
const forwarded = useForwardProps(rootProps);
defineSlots<{
  /** Scrollable content inside the keyboard-focusable viewport. */ default?(): unknown;
}>();
</script>
<template>
  <ScrollAreaRoot v-bind="forwarded" class="frame-scroll-area frame-layout-text"
    ><ScrollAreaViewport
      class="frame-scroll-area-viewport frame-layout-focus"
      tabindex="0"
      :aria-label="viewportLabel"
      :role="viewportLabel ? 'region' : undefined"
      ><slot /></ScrollAreaViewport
    ><ScrollAreaScrollbar
      v-if="orientation !== 'horizontal'"
      orientation="vertical"
      class="frame-scroll-area-scrollbar"
      ><ScrollAreaThumb class="frame-scroll-area-thumb" /></ScrollAreaScrollbar
    ><ScrollAreaScrollbar
      v-if="orientation !== 'vertical'"
      orientation="horizontal"
      class="frame-scroll-area-scrollbar"
      ><ScrollAreaThumb class="frame-scroll-area-thumb" /></ScrollAreaScrollbar
    ><ScrollAreaCorner class="frame-scroll-area-corner"
  /></ScrollAreaRoot>
</template>

<style lang="scss">
.frame-scroll-area {
  position: relative;
  overflow: hidden;
  /* Preferred height of the scrollable content area. @token --frame-scroll-area-height */
  --_frame-default-scroll-area-height-143: 200px;
  height: var(
    --frame-scroll-area-height,
    var(--_frame-default-scroll-area-height-143)
  );
}

.frame-scroll-area-viewport {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.frame-scroll-area-scrollbar {
  display: flex;
  touch-action: none;
  user-select: none;
  padding: 2px;
  /* Surface behind the scrollbar thumb and at the corner. @token --frame-scrollbar-background */
  --_frame-default-scrollbar-background-144: transparent;
  background: var(
    --frame-scrollbar-background,
    var(--_frame-default-scrollbar-background-144)
  );
}

.frame-scroll-area-scrollbar[data-orientation='vertical'] {
  width: 10px;
}

.frame-scroll-area-scrollbar[data-orientation='horizontal'] {
  height: 10px;
  flex-direction: column;
}

.frame-scroll-area-thumb {
  position: relative;
  flex: 1;
  /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(
    --frame-control-radius
  ); /* Fill of the draggable scrollbar thumb. @token --frame-scrollbar-thumb */
  --_frame-default-scrollbar-thumb-145: var(--frame-muted);
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  background: var(
    --frame-scrollbar-thumb,
    var(--_frame-default-scrollbar-thumb-145)
  );
}

.frame-scroll-area-corner {
  /* Surface behind the scrollbar thumb and at the corner. @token --frame-scrollbar-background */
  --_frame-default-scrollbar-background-144: transparent;
  background: var(
    --frame-scrollbar-background,
    var(--_frame-default-scrollbar-background-144)
  );
}
</style>
