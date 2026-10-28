<script>
import {ref} from 'vue';
import FrameCheckboxGroup from '../../../packages/core/src/components/forms/FrameCheckboxGroup.vue';
import FrameCheckbox from '../../../packages/core/src/components/forms/FrameCheckbox.vue';
import FrameSwitch from '../../../packages/core/src/components/forms/FrameSwitch.vue';
import FrameToggle from '../../../packages/core/src/components/actions/FrameToggle.vue';
import FrameSlider from '../../../packages/core/src/components/forms/FrameSlider.vue';
import FrameSelect from '../../../packages/core/src/components/forms/FrameSelect.vue';
import FrameCombobox from '../../../packages/core/src/components/forms/FrameCombobox.vue';
import FrameNumberField from '../../../packages/core/src/components/forms/FrameNumberField.vue';
import FrameEditable from '../../../packages/core/src/components/forms/FrameEditable.vue';
import FramePinField from '../../../packages/core/src/components/forms/FramePinField.vue';
import FrameTagField from '../../../packages/core/src/components/forms/FrameTagField.vue';
import FrameRadioGroup from '../../../packages/core/src/components/forms/FrameRadioGroup.vue';
import FrameListbox from '../../../packages/core/src/components/forms/FrameListbox.vue';
import FrameToggleGroup from '../../../packages/core/src/components/actions/FrameToggleGroup.vue';
import FrameTextField from '../../../packages/core/src/components/forms/FrameTextField.vue';
import FrameTextArea from '../../../packages/core/src/components/forms/FrameTextArea.vue';
import FrameLabel from '../../../packages/core/src/components/forms/FrameLabel.vue';
import '../../../packages/core/src/styles/index.scss';

export default {
  components: {
    FrameCheckboxGroup,
    FrameCheckbox,
    FrameSwitch,
    FrameToggle,
    FrameSlider,
    FrameSelect,
    FrameCombobox,
    FrameNumberField,
    FrameEditable,
    FramePinField,
    FrameTagField,
    FrameRadioGroup,
    FrameListbox,
    FrameToggleGroup,
    FrameTextField,
    FrameTextArea,
    FrameLabel,
  },
  setup() {
    return {
      requiredChoice: ref(''),
      requiredCombo: ref(''),
      requiredDisabled: ref(true),
      yes: ref(false),
      on: ref(false),
      toggle: ref(false),
      n: ref(3),
      choice: ref(''),
      combo: ref('a'),
      radio: ref('a'),
      list: ref('a'),
      toggles: ref([]),
      text: ref('hello'),
      area: ref('long'),
      pin: ref([]),
      tags: ref(['one']),
      options: [
        {value: '', label: 'Empty'},
        {value: 'a', label: 'Alpha', description: 'Alpha description'},
        {type: 'separator', id: 's'},
        {value: 'b', label: 'Beta'},
        {value: 'x', label: 'Unavailable', disabled: true},
      ],
    };
  },
};
</script>
<template>
  <form id="native-form"
    ><main style="padding: 24px; display: grid; gap: 16px; max-width: 400px"
      ><FrameCheckbox v-model="yes" label="Agree" /><output id="yes">{{
        yes
      }}</output
      ><FrameSwitch v-model="on" label="Power" /><FrameToggle
        v-model="toggle"
        label="Bold" /><FrameSlider
        v-model="n"
        aria-label="Volume"
        name="volume" /><FrameSelect
        v-model="choice"
        :options="options"
        label="Choice"
        name="choice" /><output id="choice">{{ choice }}</output
      ><FrameCombobox
        v-model="combo"
        :options="options"
        label="Find choice"
        name="combo" /><output id="combo">{{ combo }}</output
      ><FrameNumberField
        v-model="n"
        label="Count"
        :min="0"
        :max="10" /><FrameEditable
        v-model="text"
        label="Edit text" /><FramePinField
        v-model="pin"
        label="Code"
        :length="4" /><output id="pin">{{ pin.join('') }}</output
      ><FrameTagField v-model="tags" label="Tags" /><output id="tags">{{
        tags.join(',')
      }}</output
      ><FrameRadioGroup
        v-model="radio"
        :options="options"
        label="Mode" /><output id="radio">{{ radio }}</output
      ><FrameListbox v-model="list" :options="options" label="List" /><output
        id="list"
        >{{ list }}</output
      ><FrameCheckboxGroup
        v-model="toggles"
        :options="options"
        label="Checks" /><output id="checks">{{ toggles.join(',') }}</output
      ><FrameToggleGroup
        v-model="toggles"
        multiple
        :options="options"
        label="Formatting" /><FrameCheckbox
        label="Locked"
        disabled /><FrameLabel for="text">Name</FrameLabel
      ><FrameTextField id="text" v-model="text" /><FrameTextArea
        v-model="area"
        aria-label="Details" /></main></form
  ><form id="required-form"></form
  ><section style="padding: 24px; display: grid; gap: 12px; max-width: 400px"
    ><FrameSelect
      v-model="requiredChoice"
      :options="options"
      required
      name="requiredChoice"
      form="required-form"
      label="Required choice"
    /><FrameCombobox
      v-model="requiredCombo"
      :options="options"
      required
      :disabled="requiredDisabled"
      name="requiredCombo"
      form="required-form"
      label="Required search"
    /><button type="button" @click="requiredDisabled = !requiredDisabled"
      >Toggle required disabled</button
    ></section
  >
</template>
