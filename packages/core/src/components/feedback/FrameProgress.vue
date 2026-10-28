<script setup lang="ts">
import {computed} from 'vue';
import {
  ProgressRoot,
  ProgressIndicator,
  useForwardPropsEmits,
  type ProgressRootProps,
  type ProgressRootEmits,
} from 'reka-ui';
import '../layout/styles/disclosure-and-layout.scss';

const props = defineProps<ProgressRootProps>();
const emit = defineEmits<ProgressRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const percentage = computed(() =>
  props.modelValue == null
    ? undefined
    : Math.max(
        0,
        Math.min(
          100,
          (props.modelValue / (props.max && props.max > 0 ? props.max : 100)) *
            100
        )
      )
);
</script>
<template>
  <ProgressRoot v-bind="forwarded" class="frame-progress"
    ><ProgressIndicator
      class="frame-progress-indicator"
      :style="percentage === undefined ? undefined : {width: `${percentage}%`}"
      ><slot :value="modelValue" :percentage="percentage" /></ProgressIndicator
  ></ProgressRoot>
</template>

<style lang="scss">
.frame-progress {
  position: relative;
  height: var(--frame-progress-height, 6px);
  overflow: hidden;
  border-radius: var(--frame-control-radius);
  background: var(--frame-progress-track, var(--frame-line));
}
.frame-progress-indicator {
  height: 100%;
  background: var(--frame-progress-color, var(--frame-accent));
  transition: width var(--frame-duration) var(--frame-ease);
}
.frame-progress[data-state='indeterminate'] .frame-progress-indicator {
  width: 35%;
  animation: frame-progress-indeterminate 1.5s ease-in-out infinite;
}
</style>

<style lang="scss">
@keyframes frame-progress-indeterminate {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(385%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .frame-progress-indicator {
    transition: none;
  }
  .frame-progress[data-state='indeterminate'] .frame-progress-indicator {
    animation: none;
    width: 100%;
    opacity: 0.5;
  }
}
</style>
