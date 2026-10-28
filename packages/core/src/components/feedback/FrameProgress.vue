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

defineSlots<{
  /** Content inside the progress indicator, with raw and normalized progress values. */
  default?(
    props: {
    value: number | null | undefined;
    percentage: number | undefined;
  }
  ): unknown;
}>();
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
  /* Thickness of the progress track. @token --frame-progress-height */
  --_frame-default-progress-height-140: 6px;
  height: var(
    --frame-progress-height,
    var(--_frame-default-progress-height-140)
  );
  overflow: hidden;
  /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(
    --frame-control-radius
  ); /* Surface of the unfilled progress track. @token --frame-progress-track */
  --_frame-default-progress-track-141: var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  background: var(
    --frame-progress-track,
    var(--_frame-default-progress-track-141)
  );
}
.frame-progress-indicator {
  height: 100%;
  /* Fill of the progress indicator. @token --frame-progress-color */
  --_frame-default-progress-color-142: var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(
    --frame-progress-color,
    var(--_frame-default-progress-color-142)
  ); /* Shared duration for control and shell presentation transitions. @token --frame-duration @context */
  /* Shared timing curve for control and shell presentation transitions. @token --frame-ease @context */
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
