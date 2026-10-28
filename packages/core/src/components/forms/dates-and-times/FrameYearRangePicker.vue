<script setup lang="ts">
import {computed} from 'vue';
import {
  YearRangePickerRoot,
  YearRangePickerHeader,
  YearRangePickerHeading,
  YearRangePickerPrev,
  YearRangePickerNext,
  YearRangePickerGrid,
  YearRangePickerGridBody,
  YearRangePickerGridRow,
  YearRangePickerCell,
  YearRangePickerCellTrigger,
  useForwardPropsEmits,
  type YearRangePickerRootProps,
  type YearRangePickerRootEmits,
} from 'reka-ui';
import '../styles/dates.scss';

const props = defineProps<
  YearRangePickerRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<YearRangePickerRootEmits>();
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
  <YearRangePickerRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar frame-date-text"
    v-slot="{grid}"
  >
    <YearRangePickerHeader class="frame-date-header">
      <YearRangePickerPrev class="frame-date-nav" aria-label="Previous page"
        >‹</YearRangePickerPrev
      >
      <YearRangePickerHeading class="frame-date-heading" />
      <YearRangePickerNext class="frame-date-nav" aria-label="Next page"
        >›</YearRangePickerNext
      >
    </YearRangePickerHeader>
    <div class="frame-date-months">
      <YearRangePickerGrid
        v-for="(month, index) in [grid]"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <YearRangePickerGridBody>
          <YearRangePickerGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <YearRangePickerCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <YearRangePickerCellTrigger :year="date" class="frame-date-day" />
            </YearRangePickerCell>
          </YearRangePickerGridRow>
        </YearRangePickerGridBody>
      </YearRangePickerGrid>
    </div>
    <slot name="footer" />
  </YearRangePickerRoot>
</template>
