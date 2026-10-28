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
  StepperRootProps & {items?: FrameStepItem[]; label?: string}
>();
const emit = defineEmits<StepperRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
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
  border-radius: var(--frame-control-radius, var(--frame-radius-medium));
}

.frame-stepper-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--frame-control-border, #555);
  border-radius: 50%;
  flex-shrink: 0;
}

.frame-stepper-item[data-state='active'] .frame-stepper-indicator,
.frame-stepper-item[data-state='completed'] .frame-stepper-indicator {
  border-color: var(--frame-accent, #007acc);
  color: var(--frame-accent, #007acc);
}

.frame-stepper-title {
  display: block;
  font-weight: 600;
}

.frame-stepper-description {
  display: block;
  font-size: 0.9em;
  color: var(--frame-muted, #888);
}

.frame-stepper-separator {
  flex: 1;
  height: 1px;
  background: var(--frame-control-border, #555);
}
</style>
