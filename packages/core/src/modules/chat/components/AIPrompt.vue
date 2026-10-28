<script setup lang="ts">
import '../styles/index.scss';
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

<style lang="scss">
.frame-ai-prompt {
  box-sizing: border-box;
  width: 100%;
  min-width: min(100%, var(--frame-ai-prompt-min-width, 280px));
  color: var(--frame-text, #ccc);
  font: var(
    --frame-ai-prompt-font,
    13px/1.6 var(--frame-font-body, sans-serif)
  );
}

.frame-chat-composer {
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  border: var(--frame-chat-composer-border, 1px solid #ffffff24);
  border-radius: var(--frame-chat-composer-border-radius, 7px);
  background: var(--frame-surface, #181818);
  padding: var(--frame-chat-composer-padding, 8px);
}

.frame-chat-composer.populated,
.frame-chat-composer:focus-within,
.frame-chat-composer.rewinding {
  border-color: var(--frame-accent, #0078d4);
}

.frame-chat-composer textarea {
  display: block;
  resize: none;
  width: var(--frame-chat-composer-textarea-width, 100%);
  min-height: var(--frame-chat-composer-textarea-min-height, 42px);
  max-height: var(--frame-chat-composer-textarea-max-height, 180px);
  padding: var(--frame-chat-composer-textarea-padding, 2px);
  border: var(--frame-chat-composer-textarea-border, 0);
  outline: var(--frame-chat-composer-textarea-outline, none);
  box-shadow: var(--frame-chat-composer-textarea-box-shadow, none);
  background: var(--frame-chat-composer-textarea-background, transparent);
  color: inherit;
  font: inherit;
  line-height: var(--frame-chat-composer-textarea-line-height, 1.6);
}

.frame-chat-composer textarea.frame-text-area {
  --frame-text-area-border: var(--frame-chat-composer-textarea-border, 0);
  --frame-text-area-hover-border: var(--frame-chat-composer-textarea-border, 0);
  --frame-text-area-focus-border: var(--frame-chat-composer-textarea-border, 0);
  --frame-text-area-hover-outline: var(
    --frame-chat-composer-textarea-outline,
    none
  );
  --frame-text-area-focus-outline: var(
    --frame-chat-composer-textarea-outline,
    none
  );
}

.frame-chat-composer textarea::placeholder {
  color: var(--frame-muted, #999);
}

.frame-chat-composer-actions {
  display: flex;
  align-items: center;
  gap: var(--frame-chat-composer-actions-gap, 4px);
  padding-top: var(--frame-chat-composer-actions-padding-top, 5px);
}

.frame-chat-spacer {
  flex: 1;
}

.frame-chat-send:not(:disabled) {
  border-radius: var(--frame-chat-send-not-disabled-border-radius, 50%);
  background: var(--frame-accent, #0078d4);
  color: var(--frame-chat-send-not-disabled-color, white);
}

.frame-chat-file-input {
  display: none;
}

@property --frame-chat-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-chat-composer.busy::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: var(--frame-chat-composer-busy-before-padding, 1px);
  background: conic-gradient(
    from var(--frame-chat-angle),
    transparent 55%,
    var(--frame-chat-composer-busy-color, var(--frame-accent, #0078d4)) 83%,
    var(
        --frame-chat-composer-busy-highlight,
        color-mix(
          in srgb,
          var(--frame-chat-composer-busy-color, var(--frame-accent, #0078d4))
            65%,
          white
        )
      )
      96%,
    transparent
  );
  mask:
    linear-gradient(#fff 0 0) content-box exclude,
    linear-gradient(#fff 0 0);
  pointer-events: none;
  animation: frame-chat-orbit 2.5s linear infinite;
}

@keyframes frame-chat-orbit {
  to {
    --frame-chat-angle: 360deg;
  }
}
@media (prefers-reduced-motion: reduce) {
  .frame-chat-composer.busy::before {
    animation: none;
    background: var(
      --frame-chat-composer-busy-color,
      var(--frame-accent, #0078d4)
    );
  }
}
</style>
