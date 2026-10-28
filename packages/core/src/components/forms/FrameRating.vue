<script setup lang="ts">
import {
  RatingRoot,
  useForwardPropsEmits,
  RatingItem,
  RatingItemIndicator,
} from 'reka-ui';
import type {RatingRootProps, RatingRootEmits} from 'reka-ui';
import './styles/advanced.scss';

const props = defineProps<RatingRootProps>();
const emit = defineEmits<RatingRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);

defineSlots<{
  /** Content for a rating step; defaults to a star. */
  default?(props: {value: number}): unknown;
}>();
</script>
<template>
  <RatingRoot v-bind="forwarded" v-slot="{items}" class="frame-rating"
    ><RatingItem
      v-for="item in items"
      :key="item"
      :item="item"
      v-slot="{steps}"
      class="frame-rating-item"
      ><RatingItemIndicator
        v-for="step in steps"
        :key="step"
        :step="step"
        :aria-label="String(step)"
        class="frame-rating-step frame-advanced-focus"
        ><slot :value="step">★</slot></RatingItemIndicator
      ></RatingItem
    ></RatingRoot
  >
</template>

<style lang="scss">
.frame-rating {
  display: inline-flex;
  gap: 3px;
}

.frame-rating-item {
  display: inline-block;
  position: relative;
  width: 24px;
  height: 28px;
}

.frame-rating-step {
  position: absolute;
  inset: 0;
  width: var(--reka-rating-item-step-width);
  opacity: var(--reka-rating-item-step-opacity);
  z-index: var(--reka-rating-item-step-z-index);
  overflow: hidden;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  font-size: 24px;
  line-height: 28px;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
  cursor: pointer;
}

.frame-rating-step[data-state='active'] {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  color: var(--frame-accent);
}
</style>
