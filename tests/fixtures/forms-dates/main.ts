import {createApp, defineComponent, ref, h} from 'vue';
import {
  CalendarDate,
  Time,
} from '../../../packages/core/src/components/forms/shared/dates';
import FrameCalendar from '../../../packages/core/src/components/forms/dates-and-times/FrameCalendar.vue';
import FrameRangeCalendar from '../../../packages/core/src/components/forms/dates-and-times/FrameRangeCalendar.vue';
import FrameDateField from '../../../packages/core/src/components/forms/dates-and-times/FrameDateField.vue';
import FrameDatePicker from '../../../packages/core/src/components/forms/dates-and-times/FrameDatePicker.vue';
import FrameDateRangeField from '../../../packages/core/src/components/forms/dates-and-times/FrameDateRangeField.vue';
import FrameDateRangePicker from '../../../packages/core/src/components/forms/dates-and-times/FrameDateRangePicker.vue';
import FrameTimeField from '../../../packages/core/src/components/forms/dates-and-times/FrameTimeField.vue';
import FrameTimeRangeField from '../../../packages/core/src/components/forms/dates-and-times/FrameTimeRangeField.vue';
import FrameMonthPicker from '../../../packages/core/src/components/forms/dates-and-times/FrameMonthPicker.vue';
import FrameMonthRangePicker from '../../../packages/core/src/components/forms/dates-and-times/FrameMonthRangePicker.vue';
import FrameYearPicker from '../../../packages/core/src/components/forms/dates-and-times/FrameYearPicker.vue';
import FrameYearRangePicker from '../../../packages/core/src/components/forms/dates-and-times/FrameYearRangePicker.vue';
import '../../../packages/core/src/themes/generated/default.css';
import {provideOverlayBoundary} from '../../../packages/core/src/components/overlays/overlays';

const App = defineComponent({
  components: {
    FrameCalendar,
    FrameRangeCalendar,
    FrameDateField,
    FrameDatePicker,
    FrameDateRangeField,
    FrameDateRangePicker,
    FrameTimeField,
    FrameTimeRangeField,
    FrameMonthPicker,
    FrameMonthRangePicker,
    FrameYearPicker,
    FrameYearRangePicker,
  },
  setup() {
    return {
      value: ref(),
      popup: ref(),
      month: ref(),
      range: ref(),
      field: ref(new CalendarDate(2026, 10, 15)),
      date: new CalendarDate(2026, 10, 15),
      time: new Time(12, 30),
    };
  },
  template: `
<div id="calendar"><FrameCalendar v-model="value" :default-placeholder="date" label="Appointment"/></div><output id="value">{{value?.toString() ?? 'empty'}}</output>
<div id="date-field"><FrameDateField v-model="field" label="Date"/></div><output id="field-value">{{field.toString()}}</output>
<FrameDatePicker v-model="popup" :default-placeholder="date" label="Date popup"/><output id="popup-value">{{popup?.toString() ?? 'empty'}}</output><FrameDateRangePicker label="Range popup" trigger-label="Choose range"/>
<div id="range-calendar"><FrameRangeCalendar v-model="range" :default-placeholder="date" label="Stay"/></div>
<div id="month"><FrameMonthPicker v-model="month" :default-placeholder="date" label="Month"/></div><div id="month-range"><FrameMonthRangePicker :default-placeholder="date" label="Months"/></div>
<div id="year"><FrameYearPicker :default-placeholder="date" label="Year"/></div><div id="year-range"><FrameYearRangePicker :default-placeholder="date" label="Years"/></div>
<output id="month-value">{{month?.toString() ?? 'empty'}}</output><output id="range-value">{{range?.start?.toString() ?? 'empty'}}/{{range?.end?.toString() ?? 'empty'}}</output><div id="disabled"><FrameCalendar disabled :default-placeholder="date" label="Disabled date"/></div><div id="limited"><FrameCalendar :default-placeholder="date" :min-value="date" :max-value="date" label="Limited date"/></div><div id="time"><FrameTimeField :default-value="time" label="Time"/></div><div id="time-range"><FrameTimeRangeField label="Times"/></div><div id="date-range"><FrameDateRangeField label="Dates"/></div>
`,
});
createApp(
  defineComponent({
    setup() {
      const body = ref<HTMLElement>(),
        target = ref<HTMLElement>();
      const boundary = provideOverlayBoundary(body, target);
      return () =>
        h('div', [
          h('div', {ref: body}, [h(App)]),
          h('div', {
            id: 'date-overlay-host',
            ref: target,
            class: 'frame-overlay-host',
            style: {
              position: 'fixed',
              zIndex: 200,
              overflow: 'hidden',
              pointerEvents: 'none',
              ...boundary.style.value,
            },
          }),
        ]);
    },
  })
).mount('#app');
