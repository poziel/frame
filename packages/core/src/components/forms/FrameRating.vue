<script setup lang="ts">
import {
  RatingRoot,
  useForwardPropsEmits,
  RatingItem,
  RatingItemIndicator,
} from 'reka-ui';
import type {RatingRootProps, RatingRootEmits} from 'reka-ui';
import './shared/advanced.css';

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
        class="frame-rating-step"
        ><slot :value="step">★</slot></RatingItemIndicator
      ></RatingItem
    ></RatingRoot
  >
</template>
