<script setup lang="ts">
import {computed} from 'vue';
import {
  StepperRoot,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  useForwardPropsEmits,
} from 'reka-ui';
import type {StepperRootProps, StepperRootEmits} from 'reka-ui';
import type {FrameStepItem} from './stepperTypes';
import FrameIcon from '../data-display/FrameIcon.vue';
import './styles/navigation.scss';

const props = defineProps<
  StepperRootProps & {
    /** Items rendered by the built-in composition; a default slot replaces that composition. */
    items?: FrameStepItem[];
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
  }
>();
const emit = defineEmits<StepperRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
defineSlots<{
  /** Replaces the generated steps with the root primitive's navigation state. */ default?(
    props: {
    modelValue: number | undefined;
    totalSteps: number;
    isNextDisabled: boolean;
    isPrevDisabled: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    goToStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    hasNext: () => boolean;
    hasPrev: () => boolean;
  }
  ): unknown;
}>();
</script>
<template>
  <StepperRoot
    v-bind="forwarded"
    class="frame-stepper frame-navigation-text"
    :aria-label="label"
    v-slot="state"
    ><slot v-bind="state"
      ><StepperItem
        v-for="(item, index) in items"
        :key="item.step"
        :step="item.step"
        :disabled="item.disabled"
        :completed="item.completed"
        class="frame-stepper-item"
        v-slot="{state: stepState}"
        ><StepperTrigger class="frame-stepper-trigger frame-navigation-focus"
          ><StepperIndicator class="frame-stepper-indicator"
            ><FrameIcon
              v-if="stepState === 'completed'"
              name="check"
            /><template v-else>{{ item.step }}</template></StepperIndicator
          ><span
            ><StepperTitle class="frame-stepper-title">{{
              item.label
            }}</StepperTitle
            ><StepperDescription
              v-if="item.description"
              class="frame-stepper-description"
              >{{ item.description }}</StepperDescription
            ></span
          ></StepperTrigger
        ><StepperSeparator
          v-if="index < (items?.length ?? 0) - 1"
          class="frame-stepper-separator" /></StepperItem></slot
  ></StepperRoot>
</template>

<style lang="scss">
.frame-stepper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.frame-stepper-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.frame-stepper-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: transparent;
  color: inherit;
  border: 0;
  text-align: start;
  font: inherit;
  /* Corner radius for .frame-stepper-trigger. @token --frame-control-radius */
  --_frame-default-control-radius-99f2371f33: var(--frame-radius-medium);
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-99f2371f33)
  );
}

.frame-stepper-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  /* Background for .frame-stepper-indicator. @token --frame-control-border */
  --_frame-default-control-border-70a9ec99ca: #555;
  border: 1px solid
    var(--frame-control-border, var(--_frame-default-control-border-70a9ec99ca));
  border-radius: 50%;
  flex-shrink: 0;
}

.frame-stepper-item[data-state='active'] .frame-stepper-indicator,
.frame-stepper-item[data-state='completed'] .frame-stepper-indicator {
  /* Foreground for .frame-stepper-item[data-state='active'] .frame-stepper-indicator, .frame-stepper-item[data-state='completed'] .frame-stepper-indicator. @token --frame-accent */
  --_frame-default-accent-10eb2a821a: #007acc;
  border-color: var(--frame-accent, var(--_frame-default-accent-10eb2a821a));
  /* Foreground for .frame-stepper-item[data-state='active'] .frame-stepper-indicator, .frame-stepper-item[data-state='completed'] .frame-stepper-indicator. @token --frame-accent */
  --_frame-default-accent-10eb2a821a: #007acc;
  color: var(--frame-accent, var(--_frame-default-accent-10eb2a821a));
}

.frame-stepper-title {
  display: block;
  font-weight: 600;
}

.frame-stepper-description {
  display: block;
  font-size: 0.9em;
  /* Foreground for .frame-stepper-description. @token --frame-muted */
  --_frame-default-muted-1e7907e7d2: #888;
  color: var(--frame-muted, var(--_frame-default-muted-1e7907e7d2));
}

.frame-stepper-separator {
  flex: 1;
  height: 1px;
  /* Background for .frame-stepper-separator. @token --frame-control-border */
  --_frame-default-control-border-70a9ec99ca: #555;
  background: var(
    --frame-control-border,
    var(--_frame-default-control-border-70a9ec99ca)
  );
}
</style>
