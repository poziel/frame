<script setup lang="ts">
import {computed} from 'vue';
import {
  MonthRangePickerRoot,
  MonthRangePickerHeader,
  MonthRangePickerHeading,
  MonthRangePickerPrev,
  MonthRangePickerNext,
  MonthRangePickerGrid,
  MonthRangePickerGridBody,
  MonthRangePickerGridRow,
  MonthRangePickerCell,
  MonthRangePickerCellTrigger,
  useForwardPropsEmits,
  type MonthRangePickerRootProps,
  type MonthRangePickerRootEmits,
} from 'reka-ui';
import '../styles/dates.scss';

const props = defineProps<MonthRangePickerRootProps & {label?: string}>();
const emit = defineEmits<MonthRangePickerRootEmits>();
const rootProps = computed(() => {
  const {label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <MonthRangePickerRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar frame-date-text"
    v-slot="{grid}"
  >
    <MonthRangePickerHeader class="frame-date-header">
      <MonthRangePickerPrev class="frame-date-nav" aria-label="Previous page"
        >‹</MonthRangePickerPrev
      >
      <MonthRangePickerHeading class="frame-date-heading" />
      <MonthRangePickerNext class="frame-date-nav" aria-label="Next page"
        >›</MonthRangePickerNext
      >
    </MonthRangePickerHeader>
    <div class="frame-date-months">
      <MonthRangePickerGrid
        v-for="(month, index) in [grid]"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <MonthRangePickerGridBody>
          <MonthRangePickerGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <MonthRangePickerCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <MonthRangePickerCellTrigger
                :month="date"
                class="frame-date-day"
              />
            </MonthRangePickerCell>
          </MonthRangePickerGridRow>
        </MonthRangePickerGridBody>
      </MonthRangePickerGrid>
    </div>
    <slot name="footer" />
  </MonthRangePickerRoot>
</template>
