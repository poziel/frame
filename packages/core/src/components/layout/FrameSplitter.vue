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
import '../navigation/styles/navigation.scss';

const props = defineProps<
  SplitterGroupProps & {panels?: FrameSplitPanel[]; label?: string}
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
</script>
<template>
  <SplitterGroup
    v-bind="forwarded"
    class="frame-splitter frame-navigation-text"
    :aria-label="label"
    ><slot
      ><template v-for="(panel, index) in panels" :key="panel.id ?? index"
        ><SplitterResizeHandle
          v-if="index"
          class="frame-splitter-handle frame-navigation-focus"
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

<style lang="scss">
.frame-splitter {
  min-height: 140px;
  min-width: 160px;
}
.frame-splitter-panel {
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;
}
.frame-splitter-handle {
  position: relative;
  flex-shrink: 0;
  background: var(--frame-control-border, #555);
  width: 5px;
  border-radius: var(--frame-control-radius, var(--frame-radius-medium));
}
.frame-splitter-handle[data-orientation='vertical'] {
  height: 5px;
  width: auto;
}
.frame-splitter-handle[data-state='drag'],
.frame-splitter-handle:hover {
  background: var(--frame-accent, #007acc);
}
</style>
