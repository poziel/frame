import {createApp, defineComponent, h, ref} from 'vue';
import {
  FrameButton,
  FrameTextField,
  FrameTextArea,
  FrameNumberField,
  FrameSelect,
  FrameIcon,
  FrameIconButton,
  FrameField,
  FrameCheckbox,
  FrameSwitch,
  FrameEditable,
} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

createApp(
  defineComponent({
    setup() {
      const text = ref('Value'),
        number = ref(2),
        choice = ref('a'),
        check = ref(false),
        toggle = ref(false),
        name = ref('Editable');
      return () =>
        h('main', {style: 'padding:24px;display:grid;gap:12px;width:320px'}, [
          h(FrameButton, {label: 'Plain', id: 'plain'}),
          h(FrameButton, {
            label: 'Tip',
            tooltip: 'Button description',
            id: 'button',
          }),
          h(
            FrameButton,
            {label: 'Rich', id: 'rich'},
            {
              tooltip: () =>
                h('div', [h('strong', 'Rich heading'), h('p', 'More detail')]),
            }
          ),
          h(FrameButton, {
            label: 'Legacy',
            title: 'Migrated title',
            id: 'legacy',
          }),
          h(
            FrameIconButton,
            {label: 'Icon action', icon: 'add', id: 'icon-button'},
            {tooltip: () => h('strong', 'Rich icon description')}
          ),
          h(FrameIcon, {name: 'info', tooltip: 'Icon description', id: 'icon'}),
          h(FrameTextField, {
            modelValue: text.value,
            tooltip: 'Input description',
            'aria-label': 'Text',
            id: 'input',
            'onUpdate:modelValue': (value: any) => (text.value = value),
          }),
          h(FrameTextArea, {
            modelValue: text.value,
            tooltip: 'Textarea description',
            'aria-label': 'Textarea',
            id: 'textarea',
          }),
          h(FrameNumberField, {
            modelValue: number.value,
            label: 'Number',
            tooltip: 'Number description',
            'onUpdate:modelValue': (value: number) => (number.value = value),
          }),
          h(FrameSelect, {
            modelValue: choice.value,
            label: 'Select',
            tooltip: 'Select description',
            options: [
              {label: 'Alpha', value: 'a'},
              {label: 'Beta', value: 'b'},
            ],
            'onUpdate:modelValue': (value: string) => (choice.value = value),
          }),
          h(FrameCheckbox, {
            modelValue: check.value,
            label: 'Checkbox',
            tooltip: 'Checkbox description',
            'onUpdate:modelValue': (value: boolean) => (check.value = value),
          }),
          h(FrameSwitch, {
            modelValue: toggle.value,
            label: 'Switch',
            tooltip: 'Switch description',
            'onUpdate:modelValue': (value: boolean) => (toggle.value = value),
          }),
          h(
            FrameField,
            {label: 'Custom field', tooltip: 'Field description'},
            {
              default: () =>
                h(FrameTextField, {
                  modelValue: 'Field',
                  'aria-label': 'Custom',
                }),
            }
          ),
          h(FrameEditable, {
            modelValue: name.value,
            label: 'Editable',
            tooltip: 'Editable description',
            activationMode: 'dblclick',
            'onUpdate:modelValue': (value: string) => (name.value = value),
          }),
          h('output', {id: 'value'}, text.value),
          h('output', {id: 'number'}, String(number.value)),
          h('output', {id: 'choice'}, choice.value),
          h('output', {id: 'name'}, name.value),
        ]);
    },
  })
).mount('#app');
