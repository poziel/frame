<script setup lang="ts">
import { computed } from 'vue';
import { CalendarRoot, CalendarHeader, CalendarHeading, CalendarPrev, CalendarNext, CalendarGrid, CalendarGridBody, CalendarGridRow, CalendarCell, CalendarCellTrigger, CalendarGridHead, CalendarHeadCell, useForwardPropsEmits, type CalendarRootProps } from 'reka-ui';
import '../shared/dates.css';
import type { DateValue } from '../shared/dates';
const props = defineProps<CalendarRootProps & { label?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: DateValue | DateValue[] | undefined]; 'update:placeholder': [value: DateValue] }>();
const rootProps = computed(() => { const { label, ...rest } = props; return rest; });
const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
<template>
  <CalendarRoot v-bind="forwarded" :calendar-label="props.calendarLabel ?? props.label" class="frame-calendar" v-slot="{ grid, weekDays }">
  <CalendarHeader class="frame-date-header">
  <CalendarPrev class="frame-date-nav" aria-label="Previous page">‹</CalendarPrev>
  <CalendarHeading class="frame-date-heading"/>
  <CalendarNext class="frame-date-nav" aria-label="Next page">›</CalendarNext>
  </CalendarHeader>
  <div class="frame-date-months">
  <CalendarGrid v-for="(month, index) in grid" :key="index" class="frame-date-grid" role="grid">
<CalendarGridHead>
  <CalendarGridRow>
  <CalendarHeadCell v-for="day in weekDays" :key="day" class="frame-date-weekday">{{ day }}</CalendarHeadCell>
  </CalendarGridRow>
  </CalendarGridHead>
  <CalendarGridBody>
  <CalendarGridRow v-for="(row, rowIndex) in month.rows" :key="rowIndex">
  <CalendarCell v-for="date in row" :key="date.toString()" :date="date">
  <CalendarCellTrigger :day="date" :month="month.value" class="frame-date-day" />
  </CalendarCell>
  </CalendarGridRow>
  </CalendarGridBody>
  </CalendarGrid>
  </div>
  <slot name="footer" />
  </CalendarRoot>
</template>
