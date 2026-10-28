import {createApp, defineComponent, h, ref} from 'vue';
import {FrameScrubField} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

createApp(
  defineComponent({
    setup() {
      const value = ref(5),
        other = ref(2);
      return () =>
        h(
          'main',
          {
            style:
              'background:#202020;color:white;padding:24px;display:grid;gap:20px;--frame-accent:#fa604c',
          },
          [
            h(FrameScrubField, {
              label: 'Size',
              modelValue: value.value,
              min: 0,
              max: 10,
              step: 0.5,
              suffix: ' px',
              'onUpdate:modelValue': (n: number) => (value.value = n),
            }),
            h(FrameScrubField, {
              label: 'Other',
              modelValue: other.value,
              min: 0,
              max: 10,
              'onUpdate:modelValue': (n: number) => (other.value = n),
            }),
            h(FrameScrubField, {
              label: 'Disabled',
              modelValue: 3,
              disabled: true,
              min: 0,
              max: 10,
            }),
            h('output', {id: 'value'}, String(value.value)),
            h('output', {id: 'other'}, String(other.value)),
            h('button', {id: 'outside'}, 'Outside'),
          ]
        );
    },
  })
).mount('#app');
