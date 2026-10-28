<script setup lang="ts">
import {computed} from 'vue';
import {
  MonthPickerRoot,
  MonthPickerHeader,
  MonthPickerHeading,
  MonthPickerPrev,
  MonthPickerNext,
  MonthPickerGrid,
  MonthPickerGridBody,
  MonthPickerGridRow,
  MonthPickerCell,
  MonthPickerCellTrigger,
  useForwardPropsEmits,
  type MonthPickerRootProps,
  type MonthPickerRootEmits,
} from 'reka-ui';
import '../shared/dates.css';

const props = defineProps<
  MonthPickerRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<MonthPickerRootEmits>();
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
  <MonthPickerRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar"
    v-slot="{grid}"
  >
    <MonthPickerHeader class="frame-date-header">
      <MonthPickerPrev class="frame-date-nav" aria-label="Previous page"
        >‹</MonthPickerPrev
      >
      <MonthPickerHeading class="frame-date-heading" />
      <MonthPickerNext class="frame-date-nav" aria-label="Next page"
        >›</MonthPickerNext
      >
    </MonthPickerHeader>
    <div class="frame-date-months">
      <MonthPickerGrid
        v-for="(month, index) in [grid]"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <MonthPickerGridBody>
          <MonthPickerGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <MonthPickerCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <MonthPickerCellTrigger :month="date" class="frame-date-day" />
            </MonthPickerCell>
          </MonthPickerGridRow>
        </MonthPickerGridBody>
      </MonthPickerGrid>
    </div>
    <slot name="footer" />
  </MonthPickerRoot>
</template>
