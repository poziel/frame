<script setup lang="ts">
import {computed} from 'vue';
import {
  RangeCalendarRoot,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarPrev,
  RangeCalendarNext,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridRow,
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGridHead,
  RangeCalendarHeadCell,
  useForwardPropsEmits,
  type RangeCalendarRootProps,
  type RangeCalendarRootEmits,
} from 'reka-ui';
import '../shared/dates.css';

const props = defineProps<
  RangeCalendarRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<RangeCalendarRootEmits>();
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
  <RangeCalendarRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar"
    v-slot="{grid, weekDays}"
  >
    <RangeCalendarHeader class="frame-date-header">
      <RangeCalendarPrev class="frame-date-nav" aria-label="Previous page"
        >‹</RangeCalendarPrev
      >
      <RangeCalendarHeading class="frame-date-heading" />
      <RangeCalendarNext class="frame-date-nav" aria-label="Next page"
        >›</RangeCalendarNext
      >
    </RangeCalendarHeader>
    <div class="frame-date-months">
      <RangeCalendarGrid
        v-for="(month, index) in grid"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <RangeCalendarGridHead>
          <RangeCalendarGridRow>
            <RangeCalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="frame-date-weekday"
              >{{ day }}</RangeCalendarHeadCell
            >
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <RangeCalendarCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <RangeCalendarCellTrigger
                :day="date"
                :month="month.value"
                class="frame-date-day"
              />
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </div>
    <slot name="footer" />
  </RangeCalendarRoot>
</template>
