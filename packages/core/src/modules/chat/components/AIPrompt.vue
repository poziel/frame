<script setup lang="ts">
import '../styles/index.css';
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {
  FrameDropdownMenu,
  FrameIconButton,
  FrameTextArea,
  type FrameMenuItem,
} from '../../../index';
import type {ChatAttachment} from '../types/chatTypes';

const props = withDefaults(
  defineProps<{
    /** Host-owned draft. Submission does not clear it automatically. */
    modelValue?: string;
    /** Local files, folders, and context chips; never uploaded by the component. */
    attachments?: ChatAttachment[];
    /** Shows Stop instead of Send while allowing the next draft to be edited. */
    busy?: boolean;
    /** Prevents editing, attachment selection, submission, and Stop. */
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    /** Extra context-menu choices reported through attachmentAction. */
    attachmentActions?: readonly FrameMenuItem[];
    /** Enables the voice button; the host handles the speech event. */
    speechEnabled?: boolean;
    allowAttachments?: boolean;
  }>(),
  {
    modelValue: '',
    attachments: () => [],
    busy: false,
    disabled: false,
    placeholder: 'Write a message…',
    label: 'Message',
    attachmentActions: () => [],
    speechEnabled: false,
    allowAttachments: true,
  }
);
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:attachments': [value: ChatAttachment[]];
  submit: [value: {text: string; attachments: ChatAttachment[]}];
  stop: [];
  cancel: [];
  speech: [];
  attachmentAction: [item: FrameMenuItem];
}>();
const input = ref<{element?: HTMLTextAreaElement; focus: () => void}>();
const files = ref<HTMLInputElement>(),
  folders = ref<HTMLInputElement>(),
  menuOpen = ref(false);
const canSend = computed(
  () =>
    (!!props.modelValue.trim() || !!props.attachments.length) &&
    !props.busy &&
    !props.disabled
);
const menuItems = computed<readonly FrameMenuItem[]>(() => [
  {id: 'chat-files', label: 'Files…'},
  {id: 'chat-folders', label: 'Folder…'},
  ...(props.attachmentActions.length
    ? [
        {id: 'chat-separator', type: 'separator' as const},
        ...props.attachmentActions,
      ]
    : []),
]);
function measure() {
  const el = input.value?.element;
  if (el) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }
}
function focus() {
  input.value?.focus();
}
function submit() {
  if (canSend.value)
    emit('submit', {
      text: props.modelValue.trim(),
      attachments: props.attachments.slice(),
    });
}
function key(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    submit();
  }
  if (event.key === 'Escape') emit('cancel');
}
function selectAttachment(item: FrameMenuItem) {
  if (item.id === 'chat-files') files.value?.click();
  else if (item.id === 'chat-folders') folders.value?.click();
  else emit('attachmentAction', item);
}
function addFiles(selected: File[], kind: 'file' | 'folder') {
  if (props.disabled || !props.allowAttachments || !selected.length) return;
  const added: ChatAttachment[] =
    kind === 'folder'
      ? [
          {
            id: crypto.randomUUID(),
            name: selected[0]!.webkitRelativePath.split('/')[0] || 'Folder',
            kind,
            files: selected,
          },
        ]
      : selected.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          kind,
          files: [file],
        }));
  emit('update:attachments', [...props.attachments, ...added]);
  focus();
}
function dragOver(event: DragEvent) {
  if (
    props.allowAttachments &&
    !props.disabled &&
    event.dataTransfer?.types.includes('Files')
  )
    event.preventDefault();
}
function dropFiles(event: DragEvent) {
  if (!props.allowAttachments) return;
  event.preventDefault();
  addFiles(Array.from(event.dataTransfer?.files ?? []), 'file');
}
function pasteFiles(event: ClipboardEvent) {
  const selected = Array.from(event.clipboardData?.files ?? []);
  if (props.allowAttachments && !props.disabled && selected.length) {
    event.preventDefault();
    addFiles(selected, 'file');
  }
}
function attach(event: Event, kind: 'file' | 'folder') {
  const target = event.target as HTMLInputElement,
    selected = Array.from(target.files ?? []);
  addFiles(selected, kind);
  target.value = '';
  focus();
}
watch(
  () => props.modelValue,
  () => nextTick(measure)
);
onMounted(measure);
defineExpose({focus, measure});
</script>
<template>
  <form
    class="frame-chat-composer frame-ai-prompt"
    :class="{populated: modelValue.length > 0, busy}"
    @submit.prevent="submit"
    @dragover="dragOver"
    @drop="dropFiles"
    @paste="pasteFiles"
  >
    <slot name="before-input" />
    <div v-if="attachments.length" class="frame-chat-attachments"
      ><span v-for="item in attachments" :key="item.id" class="frame-chat-chip"
        >{{ item.name
        }}<FrameIconButton
          :label="`Remove ${item.name}`"
          icon="close"
          :size="20"
          :disabled="disabled"
          @click="
            emit(
              'update:attachments',
              attachments.filter((value) => value.id !== item.id)
            )
          " /></span
    ></div>
    <FrameTextArea
      ref="input"
      :model-value="modelValue"
      :disabled="disabled"
      :rows="2"
      :placeholder="placeholder"
      :aria-label="label"
      @update:model-value="emit('update:modelValue', $event)"
      @keydown="key"
    />
    <div class="frame-chat-composer-actions">
      <FrameDropdownMenu
        v-if="allowAttachments"
        v-model:open="menuOpen"
        :items="menuItems"
        label="Add context"
        @select="selectAttachment"
        ><template #trigger
          ><FrameIconButton
            label="Add attachment"
            icon="add"
            :disabled="disabled"
            :tooltip="false" /></template
      ></FrameDropdownMenu>
      <slot name="actions" /><span class="frame-chat-spacer" />
      <FrameIconButton
        :label="speechEnabled ? 'Voice input' : 'Voice input is not configured'"
        icon="mic"
        :disabled="!speechEnabled || busy || disabled"
        @click="emit('speech')"
      />
      <FrameIconButton
        v-if="busy"
        label="Stop response"
        icon="debug-stop"
        :disabled="disabled"
        @click="emit('stop')"
      />
      <FrameIconButton
        v-else
        class="frame-chat-send"
        label="Send message"
        icon="arrow-up"
        :disabled="!canSend"
        @click="submit"
      />
    </div>
    <input
      v-if="allowAttachments"
      ref="files"
      class="frame-chat-file-input"
      type="file"
      multiple
      tabindex="-1"
      aria-label="Select files"
      @change="attach($event, 'file')"
    />
    <input
      v-if="allowAttachments"
      ref="folders"
      class="frame-chat-file-input"
      type="file"
      webkitdirectory
      multiple
      tabindex="-1"
      aria-label="Select folder"
      @change="attach($event, 'folder')"
    />
  </form>
</template>
