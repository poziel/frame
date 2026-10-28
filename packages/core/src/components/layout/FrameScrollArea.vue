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
import '../shared/general-a.css';

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
  <ScrollAreaRoot v-bind="forwarded" class="frame-scroll-area"
    ><ScrollAreaViewport
      class="frame-scroll-area-viewport"
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
