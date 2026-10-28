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
  height: var(--frame-scroll-area-height, 200px);
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
  background: var(--frame-scrollbar-background, transparent);
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
  border-radius: var(--frame-control-radius);
  background: var(--frame-scrollbar-thumb, var(--frame-muted));
}

.frame-scroll-area-corner {
  background: var(--frame-scrollbar-background, transparent);
}
</style>
