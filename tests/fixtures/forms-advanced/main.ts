import {createApp, h, ref, defineComponent} from 'vue';
import FrameForm from '../../../packages/core/src/components/forms/FrameForm.vue';
import FrameField from '../../../packages/core/src/components/forms/FrameField.vue';
import FrameRating from '../../../packages/core/src/components/forms/FrameRating.vue';
import FrameTagGroup from '../../../packages/core/src/components/forms/FrameTagGroup.vue';
import FrameColorPicker from '../../../packages/core/src/components/forms/colors/FrameColorPicker.vue';
import FrameColorSwatch from '../../../packages/core/src/components/forms/colors/FrameColorSwatch.vue';
import FrameColorField from '../../../packages/core/src/components/forms/colors/FrameColorField.vue';
import FrameColorArea from '../../../packages/core/src/components/forms/colors/FrameColorArea.vue';
import FrameColorSlider from '../../../packages/core/src/components/forms/colors/FrameColorSlider.vue';
import FrameColorSwatchPicker from '../../../packages/core/src/components/forms/colors/FrameColorSwatchPicker.vue';
import FrameAutocomplete from '../../../packages/core/src/components/forms/FrameAutocomplete.vue';
import '../../../packages/core/src/styles/index.scss';
import {provideOverlayBoundary} from '../../../packages/core/src/components/overlays/overlays';

const App = defineComponent({
  setup() {
    const fractional = ref(2.5),
      rating = ref(2),
      color = ref('#0078d4'),
      tags = ref(['one', 'two']),
      selection = ref<string[]>([]),
      text = ref(''),
      submitted = ref(false);
    return () =>
      h('main', {}, [
        h('form', {id: 'color-form'}),
        h(
          FrameField,
          {label: 'Custom failure', error: 'Fix this value'},
          {default: () => h('input', {value: 'bad'})}
        ),
        h(
          FrameForm,
          {onFormSubmit: () => (submitted.value = true)},
          {
            default: () => [
              h(
                FrameField,
                {
                  name: 'email',
                  label: 'Email',
                  description: 'Work email',
                  required: true,
                },
                {default: () => h('input', {type: 'email'})}
              ),
              h('button', {type: 'submit'}, 'Submit'),
            ],
          }
        ),
        h('output', {id: 'submitted'}, String(submitted.value)),
        h('section', {id: 'fractional'}, [
          h(FrameRating, {
            'aria-label': 'Fractional rating',
            step: 0.5,
            modelValue: fractional.value,
            'onUpdate:modelValue': (v: number) => (fractional.value = v),
          }),
          h('output', {id: 'fractional-value'}, String(fractional.value)),
        ]),
        h(FrameRating, {
          'aria-label': 'Disabled rating',
          disabled: true,
          modelValue: 2,
        }),
        h(FrameTagGroup, {
          'aria-label': 'Fixed labels',
          items: [{value: 'fixed', label: 'Fixed'}],
        }),
        h(FrameTagGroup, {
          'aria-label': 'Disabled labels',
          disabled: true,
          items: [{value: 'locked', label: 'Locked'}],
          onRemove: () => {
            throw Error('Disabled tag removed');
          },
        }),
        h(FrameRating, {
          'aria-label': 'Rating',
          modelValue: rating.value,
          'onUpdate:modelValue': (v: number) => (rating.value = v),
        }),
        h('output', {id: 'rating'}, String(rating.value)),
        h(FrameTagGroup, {
          'aria-label': 'Labels',
          items: tags.value.map((value) => ({value, label: value})),
          modelValue: selection.value,
          selectionMode: 'multiple',
          'onUpdate:modelValue': (v: string[]) => (selection.value = v),
          onRemove: (values: string[]) =>
            (tags.value = tags.value.filter((v) => !values.includes(v))),
        }),
        h(FrameColorPicker, {
          'aria-label': 'Brand color',
          name: 'accent',
          form: 'color-form',
          required: true,
          modelValue: color.value,
          'onUpdate:modelValue': (v: string) => (color.value = v),
        }),
        h(FrameColorPicker, {
          'aria-label': 'Locked color picker',
          name: 'locked',
          form: 'color-form',
          disabled: true,
          modelValue: color.value,
        }),
        h(FrameColorSwatch, {
          color: color.value,
          'aria-label': 'Preview color',
        }),
        h(FrameColorField, {
          'aria-label': 'Disabled color',
          disabled: true,
          modelValue: color.value,
        }),
        h(FrameColorArea, {disabled: true, modelValue: color.value}),
        h(FrameColorSlider, {
          disabled: true,
          channel: 'alpha',
          modelValue: color.value,
        }),
        h(FrameColorSwatchPicker, {
          'aria-label': 'Disabled palette',
          disabled: true,
          colors: ['#ff0000'],
          modelValue: color.value,
        }),
        h(FrameColorField, {
          'aria-label': 'Color',
          modelValue: color.value,
          'onUpdate:modelValue': (v: string) => (color.value = v),
        }),
        h(FrameColorArea, {
          'aria-label': 'Color area',
          modelValue: color.value,
          'onUpdate:modelValue': (v: string) => (color.value = v),
        }),
        h(FrameColorSlider, {
          'aria-label': 'Hue',
          channel: 'hue',
          modelValue: color.value,
          'onUpdate:modelValue': (v: string) => (color.value = v),
        }),
        h(FrameColorSwatchPicker, {
          'aria-label': 'Palette',
          colors: ['#0078d4', '#ff0000'],
          modelValue: color.value,
          'onUpdate:modelValue': (v: string) => (color.value = v),
        }),
        h('output', {id: 'color'}, color.value),
        h(FrameAutocomplete, {
          label: 'Disabled city',
          disabled: true,
          options: ['Paris'],
        }),
        h(FrameAutocomplete, {
          label: 'City',
          options: ['Paris', 'London'],
          modelValue: text.value,
          'onUpdate:modelValue': (v: string) => (text.value = v),
        }),
        h('output', {id: 'city'}, text.value),
      ]);
  },
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
            id: 'advanced-overlay-host',
            ref: target,
            class: 'frame-overlay-host frame-shell-text',
            style: boundary.style.value,
          }),
        ]);
    },
  })
).mount('#app');
