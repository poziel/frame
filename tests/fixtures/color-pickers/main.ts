import {createApp, defineComponent, h, ref} from 'vue';
import {
  FrameColorSlider,
  FrameHsvRectangle,
  FrameHsvWheel,
  FrameVhsCircle,
} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

createApp(
  defineComponent({
    setup() {
      const color = ref('#3876ac80');
      return () =>
        h(
          'main',
          {
            style:
              'display:flex;flex-wrap:wrap;gap:24px;background:#202020;padding:20px;color:white',
          },
          [
            ...[FrameHsvRectangle, FrameHsvWheel, FrameVhsCircle].flatMap(
              (component, index) =>
                [240, 400].map((size) =>
                  h('section', {'data-picker': index, 'data-size': size}, [
                    h(component, {
                      modelValue: color.value,
                      size,
                      'onUpdate:modelValue': (value: string) =>
                        (color.value = value),
                    }),
                  ])
                )
            ),
            ...['hue', 'brightness', 'alpha', 'red'].flatMap((channel) =>
              ['horizontal', 'vertical'].flatMap((orientation) =>
                [false, true].map((inverted) =>
                  h(
                    'section',
                    {
                      'data-channel': channel,
                      'data-axis': orientation,
                      'data-inverted': String(inverted),
                    },
                    [
                      h(FrameColorSlider, {
                        modelValue: color.value,
                        channel: channel as 'hue',
                        orientation: orientation as 'vertical',
                        inverted,
                        'onUpdate:modelValue': (value: any) =>
                          (color.value = value),
                      }),
                    ]
                  )
                )
              )
            ),
            h('output', {id: 'color'}, color.value),
          ]
        );
    },
  })
).mount('#app');
