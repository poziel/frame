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
  /* Background for .frame-splitter-handle. @token --frame-control-border */
  --_frame-default-control-border-70a9ec99ca: #555;
  background: var(
    --frame-control-border,
    var(--_frame-default-control-border-70a9ec99ca)
  );
  width: 5px;
  /* Corner radius for .frame-splitter-handle. @token --frame-control-radius */
  --_frame-default-control-radius-99f2371f33: var(--frame-radius-medium);
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-99f2371f33)
  );
}
.frame-splitter-handle[data-orientation='vertical'] {
  height: 5px;
  width: auto;
}
.frame-splitter-handle[data-state='drag'],
.frame-splitter-handle:hover {
  /* Foreground for .frame-splitter-handle[data-state='drag'], .frame-splitter-handle:hover. @token --frame-accent */
  --_frame-default-accent-10eb2a821a: #007acc;
  background: var(--frame-accent, var(--_frame-default-accent-10eb2a821a));
}
</style>
