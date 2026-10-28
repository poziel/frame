import {createApp, defineComponent, h, ref} from 'vue';
import {FrameTabs} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

createApp(
  defineComponent({
    setup() {
      const values = [ref('a'), ref('a'), ref('a')],
        items = [
          {value: 'a', label: 'First', content: 'First content'},
          {
            value: 'b',
            label: 'Unavailable',
            disabled: true,
            content: 'Disabled',
          },
          {value: 'c', label: 'Last', content: 'Last content'},
        ];
      return () =>
        h(
          'main',
          {
            style:
              'padding:24px;background:#181818;color:white;--frame-accent:#ff5d57;display:grid;gap:24px',
          },
          values.map((value, index) =>
            h(FrameTabs, {
              items,
              label: ['Automatic', 'Manual', 'Vertical'][index],
              modelValue: value.value,
              activationMode: index === 1 ? 'manual' : 'automatic',
              orientation: index === 2 ? 'vertical' : 'horizontal',
              'onUpdate:modelValue': (next: string | number) =>
                (value.value = String(next)),
            })
          )
        );
    },
  })
).mount('#app');
