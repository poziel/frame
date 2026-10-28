<script setup lang="ts">
import {onBeforeUnmount, ref} from 'vue';
import FrameTextField from './FrameTextField.vue';
import {
  EditableRoot,
  EditableArea,
  EditableInput,
  EditablePreview,
} from 'reka-ui';
import './styles/controls.scss';
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

defineOptions({inheritAttrs: false});
const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Text displayed in the preview and edited by the input. */
      modelValue: string;
      /** Hint displayed while the editable value is empty. */
      placeholder?: string;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Accessible name of the editable input. */
      label?: string;
      /** both: Enter and leaving the field save; enter: only Enter saves. Escape always cancels. */
      submitMode?: 'both' | 'enter';
      /** Interaction that enters editing; none requires explicit activation by the primitive. */
      activationMode?: 'focus' | 'dblclick' | 'none';
      /** Starts with the input active instead of the preview. */
      startWithEditMode?: boolean;
      /** Selects the editable text when the input receives focus. */
      selectOnFocus?: boolean;
    }
  >(),
  {
    tooltip: undefined,
    submitMode: 'both',
    activationMode: 'focus',
    startWithEditMode: false,
    selectOnFocus: false,
  }
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
  /** The edited text was committed. */
  submit: [value: string];
  /** Editing was cancelled and the preview is restored. */
  cancel: [];
  /** Editable presentation entered edit, submit, or cancel state. */
  'update:state': [state: 'edit' | 'submit' | 'cancel'];
}>();
const root = ref<InstanceType<typeof EditableRoot>>(),
  active = ref(props.startWithEditMode);
function leave() {
  if (active.value) {
    if (props.submitMode === 'both') root.value?.submit();
    else root.value?.cancel();
  }
}
onBeforeUnmount(leave);
function state(value: 'edit' | 'submit' | 'cancel') {
  active.value = value === 'edit';
  emit('update:state', value);
  if (value === 'cancel') emit('cancel');
}
function key(event: KeyboardEvent) {
  if (!event.isComposing && (event.key === 'Enter' || event.key === 'Escape')) {
    event.preventDefault();
    event.stopPropagation();
  }
}

defineSlots<{
  /** Custom tooltip content for the editable field. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><EditableRoot
        v-bind="controlAttrs"
        ref="root"
        class="frame-editable"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :submit-mode="submitMode"
        :activation-mode="activationMode"
        :start-with-edit-mode="startWithEditMode"
        :select-on-focus="selectOnFocus"
        @update:model-value="emit('update:modelValue', $event ?? '')"
        @submit="emit('submit', $event ?? '')"
        @update:state="state"
      >
        <EditableArea>
          <EditablePreview
            class="frame-form-input frame-control-surface frame-control-focus frame-input-surface frame-input-focus-within"
            :aria-label="label"
            :aria-describedby="describedBy(describedby)"
          />
          <EditableInput as-child
            ><FrameTextField
              class="frame-editable-input frame-input-surface frame-input-focus-within"
              :aria-label="label"
              :aria-describedby="describedBy(describedby)"
              @keydown="key"
              @blur="leave"
          /></EditableInput>
        </EditableArea> </EditableRoot></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>
