<script setup lang="ts">
import {computed} from 'vue';
import {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarPrev,
  CalendarNext,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridRow,
  CalendarCell,
  CalendarCellTrigger,
  CalendarGridHead,
  CalendarHeadCell,
  useForwardPropsEmits,
  type CalendarRootProps,
} from 'reka-ui';
import '../styles/dates.scss';
import type {DateValue} from '../shared/dates';

const props = defineProps<
  Omit<CalendarRootProps, 'numberOfMonths' | 'as'> & {
    /** Number of month grids displayed; omission uses the forwarded CalendarRoot default.
     * @defaultValue 1
     */
    numberOfMonths?: CalendarRootProps['numberOfMonths'];
    /** Element or component rendered by the calendar root; omission uses its upstream default.
     * @defaultValue "div"
     */
    as?: CalendarRootProps['as'];
    /** Accessible name of the date or time control. */
    label?: string;
  }
>();
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: DateValue | DateValue[] | undefined];
  /** Requests the date or time used as the navigation placeholder. */
  'update:placeholder': [value: DateValue];
}>();
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
  <CalendarRoot
    v-bind="forwarded"
    :calendar-label="props.calendarLabel ?? props.label"
    class="frame-calendar frame-date-text"
    v-slot="{grid, weekDays}"
  >
    <CalendarHeader class="frame-date-header">
      <CalendarPrev class="frame-date-nav" aria-label="Previous page"
        >‹</CalendarPrev
      >
      <CalendarHeading class="frame-date-heading" />
      <CalendarNext class="frame-date-nav" aria-label="Next page"
        >›</CalendarNext
      >
    </CalendarHeader>
    <div class="frame-date-months">
      <CalendarGrid
        v-for="(month, index) in grid"
        :key="index"
        class="frame-date-grid"
        role="grid"
      >
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="frame-date-weekday"
              >{{ day }}</CalendarHeadCell
            >
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(row, rowIndex) in month.rows"
            :key="rowIndex"
          >
            <CalendarCell
              v-for="date in row"
              :key="date.toString()"
              :date="date"
            >
              <CalendarCellTrigger
                :day="date"
                :month="month.value"
                class="frame-date-day"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
    <slot name="footer" />
  </CalendarRoot>
</template>
