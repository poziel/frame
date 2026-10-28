<script setup lang="ts">
import {computed} from 'vue';
import {
  YearPickerRoot,
  YearPickerHeader,
  YearPickerHeading,
  YearPickerPrev,
  YearPickerNext,
  YearPickerGrid,
  YearPickerGridBody,
  YearPickerGridRow,
  YearPickerCell,
  YearPickerCellTrigger,
  useForwardPropsEmits,
  type YearPickerRootProps,
  type YearPickerRootEmits,
} from 'reka-ui';
import '../styles/dates.scss';

const props = defineProps<
  YearPickerRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<YearPickerRootEmits>();
const rootProps = computed(() => {
  const {label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(rootProps, emit);

defineSlots<{
  /** Additional content below the calendar grid. */
  footer?(): unknown;
}>();
</script>
<template>
  <YearPickerRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar frame-date-text"
    v-slot="{grid}"
  >
    <YearPickerHeader class="frame-date-header">
      <YearPickerPrev class="frame-date-nav" aria-label="Previous page"
        >‹</YearPickerPrev
      >
      <YearPickerHeading class="frame-date-heading" />
      <YearPickerNext class="frame-date-nav" aria-label="Next page"
        >›</YearPickerNext
      >
    </YearPickerHeader>
    <div class="frame-date-months">
      <YearPickerGrid
        v-for="(month, index) in [grid]"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <YearPickerGridBody>
          <YearPickerGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <YearPickerCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <YearPickerCellTrigger :year="date" class="frame-date-day" />
            </YearPickerCell>
          </YearPickerGridRow>
        </YearPickerGridBody>
      </YearPickerGrid>
    </div>
    <slot name="footer" />
  </YearPickerRoot>
</template>
