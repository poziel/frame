<script setup lang="ts">
import {computed} from 'vue';
import {
  SplitterGroup,
  SplitterPanel,
  SplitterResizeHandle,
  useForwardPropsEmits,
} from 'reka-ui';
import type {SplitterGroupProps, SplitterGroupEmits} from 'reka-ui';
import type {FrameSplitPanel} from './splitterTypes';
import '../shared/general-b.css';

const props = defineProps<
  SplitterGroupProps & {
    /** Panels rendered by the default composition, including their sizing constraints. */
    panels?: FrameSplitPanel[];
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
  }
>();
const emit = defineEmits<SplitterGroupEmits>();
const root = computed(() => {
  const {panels, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
function panelProps(panel: FrameSplitPanel) {
  const {label, content, ...rest} = panel;
  return rest;
}
defineSlots<{
  /** Replaces the automatic panel and resize-handle composition. */ default?(): unknown;
  /** Content for one configured panel, with its position in panels. */ panel?(
    props: {
    panel: FrameSplitPanel;
    index: number;
  }
  ): unknown;
}>();
</script>
<template>
  <SplitterGroup v-bind="forwarded" class="frame-splitter" :aria-label="label"
    ><slot
      ><template v-for="(panel, index) in panels" :key="panel.id ?? index"
        ><SplitterResizeHandle
          v-if="index"
          class="frame-splitter-handle"
          :aria-label="`Resize ${panel.label ?? 'panel'}`"
        /><SplitterPanel v-bind="panelProps(panel)" class="frame-splitter-panel"
          ><slot name="panel" :panel="panel" :index="index">{{
            panel.content ?? panel.label
          }}</slot></SplitterPanel
        ></template
      ></slot
    ></SplitterGroup
  >
</template>
