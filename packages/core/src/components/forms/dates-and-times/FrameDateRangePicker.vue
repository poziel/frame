<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  DateRangePickerRoot,
  DateRangePickerInput,
  DateRangePickerAnchor,
  DateRangePickerField,
  DateRangePickerTrigger,
  DateRangePickerContent,
  DateRangePickerCalendar,
  DateRangePickerHeader,
  DateRangePickerHeading,
  DateRangePickerPrev,
  DateRangePickerNext,
  DateRangePickerGrid,
  DateRangePickerGridBody,
  DateRangePickerGridRow,
  DateRangePickerCell,
  DateRangePickerCellTrigger,
  DateRangePickerGridHead,
  DateRangePickerHeadCell,
  useForwardPropsEmits,
  type DateRangePickerRootProps,
  type DateRangePickerRootEmits,
} from 'reka-ui';
import {useOverlayBoundary} from '../../overlays/overlays';
import '../styles/dates.scss';

const props = defineProps<
  DateRangePickerRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
    /** Accessible name of the button that opens the calendar. */
    triggerLabel?: string;
  }
>();
const emit = defineEmits<DateRangePickerRootEmits>();
const anchor = ref<HTMLElement>();
const boundary = useOverlayBoundary(() => anchor.value);
const collisionBoundary = computed(() =>
  typeof boundary.target.value === 'string' ? undefined : boundary.target.value
);
const rootProps = computed(() => {
  const {label, triggerLabel, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(rootProps, emit);

defineSlots<{
  /** Additional content below the calendar grid. */
  footer?(): unknown;
}>();
</script>
<template>
  <DateRangePickerRoot v-bind="forwarded">
    <span ref="anchor" class="frame-date-picker">
      <DateRangePickerAnchor>
        <DateRangePickerField
          class="frame-date-field frame-input-surface frame-input-focus-within frame-date-text"
          :aria-label="label"
          v-slot="{segments}"
        >
          <DateRangePickerInput
            v-for="(segment, index) in segments.start"
            :key="'start' + index"
            :part="segment.part"
            type="start"
            class="frame-date-segment"
            >{{ segment.value }}</DateRangePickerInput
          >
          <span class="frame-date-separator" aria-hidden="true">–</span>
          <DateRangePickerInput
            v-for="(segment, index) in segments.end"
            :key="'end' + index"
            :part="segment.part"
            type="end"
            class="frame-date-segment"
            >{{ segment.value }}</DateRangePickerInput
          >
          <DateRangePickerTrigger
            class="frame-date-nav"
            :aria-label="triggerLabel ?? 'Choose date'"
            >▦</DateRangePickerTrigger
          >
        </DateRangePickerField>
      </DateRangePickerAnchor>
    </span>
    <DateRangePickerContent
      :aria-label="label ?? triggerLabel ?? 'Choose date'"
      class="frame-date-popover frame-overlay-surface frame-date-text"
      :portal="{to: boundary.target.value}"
      :collision-boundary="collisionBoundary"
      :collision-padding="6"
      :side-offset="4"
      :style="{
        maxWidth: boundary.bounds.value.width + 'px',
        maxHeight: boundary.bounds.value.height + 'px',
      }"
    >
      <DateRangePickerCalendar
        :calendar-label="label"
        class="frame-calendar frame-date-text"
        v-slot="{grid, weekDays}"
      >
        <DateRangePickerHeader class="frame-date-header">
          <DateRangePickerPrev class="frame-date-nav" aria-label="Previous page"
            >‹</DateRangePickerPrev
          >
          <DateRangePickerHeading class="frame-date-heading" />
          <DateRangePickerNext class="frame-date-nav" aria-label="Next page"
            >›</DateRangePickerNext
          >
        </DateRangePickerHeader>
        <div class="frame-date-months">
          <DateRangePickerGrid
            v-for="(month, index) in grid"
            :key="index"
            class="frame-date-grid"
            role="grid"
          >
            <DateRangePickerGridHead>
              <DateRangePickerGridRow>
                <DateRangePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="frame-date-weekday"
                  >{{ day }}</DateRangePickerHeadCell
                >
              </DateRangePickerGridRow>
            </DateRangePickerGridHead>
            <DateRangePickerGridBody>
              <DateRangePickerGridRow
                v-for="(row, rowIndex) in month.rows"
                :key="rowIndex"
              >
                <DateRangePickerCell
                  v-for="date in row"
                  :key="date.toString()"
                  :date="date"
                >
                  <DateRangePickerCellTrigger
                    :day="date"
                    :month="month.value"
                    class="frame-date-day"
                  />
                </DateRangePickerCell>
              </DateRangePickerGridRow>
            </DateRangePickerGridBody>
          </DateRangePickerGrid>
        </div>
        <slot name="footer" />
      </DateRangePickerCalendar>
    </DateRangePickerContent>
  </DateRangePickerRoot>
</template>
