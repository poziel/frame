<script setup lang="ts">
import {computed, ref} from 'vue';
import {
  DatePickerRoot,
  DatePickerInput,
  DatePickerAnchor,
  DatePickerField,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerHeader,
  DatePickerHeading,
  DatePickerPrev,
  DatePickerNext,
  DatePickerGrid,
  DatePickerGridBody,
  DatePickerGridRow,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerGridHead,
  DatePickerHeadCell,
  useForwardPropsEmits,
  type DatePickerRootProps,
  type DatePickerRootEmits,
} from 'reka-ui';
import {useOverlayBoundary} from '../../overlays/overlays';
import '../shared/dates.css';

const props = defineProps<
  DatePickerRootProps & {
    /** Accessible name of the date or time control. */
    label?: string;
    /** Accessible name of the button that opens the calendar. */
    triggerLabel?: string;
  }
>();
const emit = defineEmits<DatePickerRootEmits>();
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
  <DatePickerRoot v-bind="forwarded">
    <span ref="anchor" class="frame-date-picker">
      <DatePickerAnchor>
        <DatePickerField
          class="frame-date-field"
          :aria-label="label"
          v-slot="{segments}"
        >
          <DatePickerInput
            v-for="(segment, index) in segments"
            :key="'' + index"
            :part="segment.part"
            class="frame-date-segment"
            >{{ segment.value }}</DatePickerInput
          >
          <DatePickerTrigger
            class="frame-date-nav"
            :aria-label="triggerLabel ?? 'Choose date'"
            >▦</DatePickerTrigger
          >
        </DatePickerField>
      </DatePickerAnchor>
    </span>
    <DatePickerContent
      :aria-label="label ?? triggerLabel ?? 'Choose date'"
      class="frame-date-popover"
      :portal="{to: boundary.target.value}"
      :collision-boundary="collisionBoundary"
      :collision-padding="6"
      :side-offset="4"
      :style="{
        maxWidth: boundary.bounds.value.width + 'px',
        maxHeight: boundary.bounds.value.height + 'px',
      }"
    >
      <DatePickerCalendar
        :calendar-label="label"
        class="frame-calendar"
        v-slot="{grid, weekDays}"
      >
        <DatePickerHeader class="frame-date-header">
          <DatePickerPrev class="frame-date-nav" aria-label="Previous page"
            >‹</DatePickerPrev
          >
          <DatePickerHeading class="frame-date-heading" />
          <DatePickerNext class="frame-date-nav" aria-label="Next page"
            >›</DatePickerNext
          >
        </DatePickerHeader>
        <div class="frame-date-months">
          <DatePickerGrid
            v-for="(month, index) in grid"
            :key="index"
            class="frame-date-grid"
            role="grid"
          >
            <DatePickerGridHead>
              <DatePickerGridRow>
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="frame-date-weekday"
                  >{{ day }}</DatePickerHeadCell
                >
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow
                v-for="(row, rowIndex) in month.rows"
                :key="rowIndex"
              >
                <DatePickerCell
                  v-for="date in row"
                  :key="date.toString()"
                  :date="date"
                >
                  <DatePickerCellTrigger
                    :day="date"
                    :month="month.value"
                    class="frame-date-day"
                  />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </div>
        <slot name="footer" />
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>
