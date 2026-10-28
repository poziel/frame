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
    /** Prompt shown when the input is empty. */
    placeholder?: string;
    /** Accessible name or visible label for the rendered control. */
    label?: string;
    /** Extra context-menu choices reported through attachmentAction. */
    attachmentActions?: readonly FrameMenuItem[];
    /** Enables the voice button; the host handles the speech event. */
    speechEnabled?: boolean;
    /** Offers file and folder attachment controls; files remain host-owned until submitted. */
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
  /** Requests a new controlled value after input interaction. */
  'update:modelValue': [value: string];
  /** Requests an updated attachment collection after selection or removal. */
  'update:attachments': [value: ChatAttachment[]];
  /** Reports the draft text and attachments for host-controlled submission. */
  submit: [value: {text: string; attachments: ChatAttachment[]}];
  /** Requests cancellation of the current response. */
  stop: [];
  /** Requests cancellation of the current prompt interaction. */
  cancel: [];
  /** Requests host-managed speech input. */
  speech: [];
  /** Reports selection of an application attachment-menu action. */
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
defineExpose({
  /** Focuses the active input or terminal surface without creating or disposing its owning controller. */
  focus,
  /** Recalculates the draft input height after host content or layout changes. */
  measure,
});
defineSlots<{
  /** Content before the draft input, such as context chips. */ 'before-input'?(): unknown;
  /** Additional composer actions before the send/stop controls. */ actions?(): unknown;
}>();
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
  /* Min width for .frame-ai-prompt; ai prompt min width. @token --frame-ai-prompt-min-width */
  --_frame-default-ai-prompt-min-width-2c1b4e0fdb: 280px;
  min-width: min(
    100%,
    var(
      --frame-ai-prompt-min-width,
      var(--_frame-default-ai-prompt-min-width-2c1b4e0fdb)
    )
  );
  /* Color for .frame-ai-prompt; text. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  color: var(--frame-text, var(--_frame-default-text-11eec91da6));
  /*   _frame default ai prompt font 5bdfa89397 for .frame-ai-prompt; font body. @token --frame-font-body */
  --_frame-default-font-body-84e892f96e: sans-serif;
  /* Font for .frame-ai-prompt; ai prompt font. @token --frame-ai-prompt-font */
  --_frame-default-ai-prompt-font-5bdfa89397: 13px/1.6
    var(--frame-font-body, var(--_frame-default-font-body-84e892f96e));
  font: var(
    --frame-ai-prompt-font,
    var(--_frame-default-ai-prompt-font-5bdfa89397)
  );
}

.frame-chat-composer {
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  /* Border for .frame-chat-composer; chat composer border. @token --frame-chat-composer-border */
  --_frame-default-chat-composer-border-63565a2800: 1px solid #ffffff24;
  border: var(
    --frame-chat-composer-border,
    var(--_frame-default-chat-composer-border-63565a2800)
  );
  /* Border radius for .frame-chat-composer; chat composer border radius. @token --frame-chat-composer-border-radius */
  --_frame-default-chat-composer-border-radius-b9b8d2ce96: 7px;
  border-radius: var(
    --frame-chat-composer-border-radius,
    var(--_frame-default-chat-composer-border-radius-b9b8d2ce96)
  );
  /* Background for .frame-chat-composer; surface. @token --frame-surface */
  --_frame-default-surface-7fcb70be5e: #181818;
  background: var(--frame-surface, var(--_frame-default-surface-7fcb70be5e));
  /* Padding for .frame-chat-composer; chat composer padding. @token --frame-chat-composer-padding */
  --_frame-default-chat-composer-padding-267cd2803f: 8px;
  padding: var(
    --frame-chat-composer-padding,
    var(--_frame-default-chat-composer-padding-267cd2803f)
  );
}

.frame-chat-composer.populated,
.frame-chat-composer:focus-within,
.frame-chat-composer.rewinding {
  /* Border color for .frame-chat-composer.populated,
.frame-chat-composer:focus-within,
.frame-chat-composer.rewinding; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  border-color: var(--frame-accent, var(--_frame-default-accent-1583861c13));
}

.frame-chat-composer textarea {
  display: block;
  resize: none;
  /* Width for .frame-chat-composer textarea; chat composer textarea width. @token --frame-chat-composer-textarea-width */
  --_frame-default-chat-composer-textarea-width-8007ceb12c: 100%;
  width: var(
    --frame-chat-composer-textarea-width,
    var(--_frame-default-chat-composer-textarea-width-8007ceb12c)
  );
  /* Min height for .frame-chat-composer textarea; chat composer textarea min height. @token --frame-chat-composer-textarea-min-height */
  --_frame-default-chat-composer-textarea-min-height-0fd044461b: 42px;
  min-height: var(
    --frame-chat-composer-textarea-min-height,
    var(--_frame-default-chat-composer-textarea-min-height-0fd044461b)
  );
  /* Max height for .frame-chat-composer textarea; chat composer textarea max height. @token --frame-chat-composer-textarea-max-height */
  --_frame-default-chat-composer-textarea-max-height-cb8d01f825: 180px;
  max-height: var(
    --frame-chat-composer-textarea-max-height,
    var(--_frame-default-chat-composer-textarea-max-height-cb8d01f825)
  );
  /* Padding for .frame-chat-composer textarea; chat composer textarea padding. @token --frame-chat-composer-textarea-padding */
  --_frame-default-chat-composer-textarea-padding-06249bae27: 2px;
  padding: var(
    --frame-chat-composer-textarea-padding,
    var(--_frame-default-chat-composer-textarea-padding-06249bae27)
  );
  /* Border for .frame-chat-composer textarea; chat composer textarea border. @token --frame-chat-composer-textarea-border */
  --_frame-default-chat-composer-textarea-border-4b7587eedb: 0;
  border: var(
    --frame-chat-composer-textarea-border,
    var(--_frame-default-chat-composer-textarea-border-4b7587eedb)
  );
  /* Outline for .frame-chat-composer textarea; chat composer textarea outline. @token --frame-chat-composer-textarea-outline */
  --_frame-default-chat-composer-textarea-outline-d6703ed180: none;
  outline: var(
    --frame-chat-composer-textarea-outline,
    var(--_frame-default-chat-composer-textarea-outline-d6703ed180)
  );
  /* Box shadow for .frame-chat-composer textarea; chat composer textarea box shadow. @token --frame-chat-composer-textarea-box-shadow */
  --_frame-default-chat-composer-textarea-box-shadow-3867e69e02: none;
  box-shadow: var(
    --frame-chat-composer-textarea-box-shadow,
    var(--_frame-default-chat-composer-textarea-box-shadow-3867e69e02)
  );
  /* Background for .frame-chat-composer textarea; chat composer textarea background. @token --frame-chat-composer-textarea-background */
  --_frame-default-chat-composer-textarea-background-de7c9ca846: transparent;
  background: var(
    --frame-chat-composer-textarea-background,
    var(--_frame-default-chat-composer-textarea-background-de7c9ca846)
  );
  color: inherit;
  font: inherit;
  /* Line height for .frame-chat-composer textarea; chat composer textarea line height. @token --frame-chat-composer-textarea-line-height */
  --_frame-default-chat-composer-textarea-line-height-1f9df998b9: 1.6;
  line-height: var(
    --frame-chat-composer-textarea-line-height,
    var(--_frame-default-chat-composer-textarea-line-height-1f9df998b9)
  );
}

.frame-chat-composer textarea.frame-text-area {
  /*   frame text area border for .frame-chat-composer textarea.frame-text-area; chat composer textarea border. @token --frame-chat-composer-textarea-border */
  --_frame-default-chat-composer-textarea-border-4b7587eedb: 0;
  /* Maps the text area border setting for .frame-chat-composer textarea.frame-text-area. @token --frame-text-area-border */
  --frame-text-area-border: var(
    --frame-chat-composer-textarea-border,
    var(--_frame-default-chat-composer-textarea-border-4b7587eedb)
  );
  /*   frame text area hover border for .frame-chat-composer textarea.frame-text-area; chat composer textarea border. @token --frame-chat-composer-textarea-border */
  --_frame-default-chat-composer-textarea-border-4b7587eedb: 0;
  /* Maps the text area hover border setting for .frame-chat-composer textarea.frame-text-area. @token --frame-text-area-hover-border */
  --frame-text-area-hover-border: var(
    --frame-chat-composer-textarea-border,
    var(--_frame-default-chat-composer-textarea-border-4b7587eedb)
  );
  /*   frame text area focus border for .frame-chat-composer textarea.frame-text-area; chat composer textarea border. @token --frame-chat-composer-textarea-border */
  --_frame-default-chat-composer-textarea-border-4b7587eedb: 0;
  /* Maps the text area focus border setting for .frame-chat-composer textarea.frame-text-area. @token --frame-text-area-focus-border */
  --frame-text-area-focus-border: var(
    --frame-chat-composer-textarea-border,
    var(--_frame-default-chat-composer-textarea-border-4b7587eedb)
  );
  /*   frame text area hover outline for .frame-chat-composer textarea.frame-text-area; chat composer textarea outline. @token --frame-chat-composer-textarea-outline */
  --_frame-default-chat-composer-textarea-outline-d6703ed180: none;
  /* Maps the text area hover outline setting for .frame-chat-composer textarea.frame-text-area. @token --frame-text-area-hover-outline */
  --frame-text-area-hover-outline: var(
    --frame-chat-composer-textarea-outline,
    var(--_frame-default-chat-composer-textarea-outline-d6703ed180)
  );
  /*   frame text area focus outline for .frame-chat-composer textarea.frame-text-area; chat composer textarea outline. @token --frame-chat-composer-textarea-outline */
  --_frame-default-chat-composer-textarea-outline-d6703ed180: none;
  /* Maps the text area focus outline setting for .frame-chat-composer textarea.frame-text-area. @token --frame-text-area-focus-outline */
  --frame-text-area-focus-outline: var(
    --frame-chat-composer-textarea-outline,
    var(--_frame-default-chat-composer-textarea-outline-d6703ed180)
  );
}

.frame-chat-composer textarea::placeholder {
  /* Color for .frame-chat-composer textarea::placeholder; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
}

.frame-chat-composer-actions {
  display: flex;
  align-items: center;
  /* Gap for .frame-chat-composer-actions; chat composer actions gap. @token --frame-chat-composer-actions-gap */
  --_frame-default-chat-composer-actions-gap-9f05831ef1: 4px;
  gap: var(
    --frame-chat-composer-actions-gap,
    var(--_frame-default-chat-composer-actions-gap-9f05831ef1)
  );
  /* Padding top for .frame-chat-composer-actions; chat composer actions padding top. @token --frame-chat-composer-actions-padding-top */
  --_frame-default-chat-composer-actions-padding-top-d36dbbd190: 5px;
  padding-top: var(
    --frame-chat-composer-actions-padding-top,
    var(--_frame-default-chat-composer-actions-padding-top-d36dbbd190)
  );
}

.frame-chat-spacer {
  flex: 1;
}

.frame-chat-send:not(:disabled) {
  /* Border radius for .frame-chat-send:not(:disabled); chat send not disabled border radius. @token --frame-chat-send-not-disabled-border-radius */
  --_frame-default-chat-send-not-disabled-border-radius-f40d709f76: 50%;
  border-radius: var(
    --frame-chat-send-not-disabled-border-radius,
    var(--_frame-default-chat-send-not-disabled-border-radius-f40d709f76)
  );
  /* Background for .frame-chat-send:not(:disabled); accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  background: var(--frame-accent, var(--_frame-default-accent-1583861c13));
  /* Color for .frame-chat-send:not(:disabled); chat send not disabled color. @token --frame-chat-send-not-disabled-color */
  --_frame-default-chat-send-not-disabled-color-dbb0e2fca4: white;
  color: var(
    --frame-chat-send-not-disabled-color,
    var(--_frame-default-chat-send-not-disabled-color-dbb0e2fca4)
  );
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
  /* Padding for .frame-chat-composer.busy::before; chat composer busy before padding. @token --frame-chat-composer-busy-before-padding */
  --_frame-default-chat-composer-busy-before-padding-148bc17783: 1px;
  padding: var(
    --frame-chat-composer-busy-before-padding,
    var(--_frame-default-chat-composer-busy-before-padding-148bc17783)
  );
  /*   _frame default chat composer busy color d5d246f27b for .frame-chat-composer.busy::before; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  /*   _frame default chat composer busy highlight 2c707b3bec for .frame-chat-composer.busy::before; chat composer busy color. @token --frame-chat-composer-busy-color */
  --_frame-default-chat-composer-busy-color-d5d246f27b: var(
    --frame-accent,
    var(--_frame-default-accent-1583861c13)
  );
  /* Background for .frame-chat-composer.busy::before; chat composer busy highlight. @token --frame-chat-composer-busy-highlight */
  --_frame-default-chat-composer-busy-highlight-2c707b3bec: color-mix(
    in srgb,
    var(
        --frame-chat-composer-busy-color,
        var(--_frame-default-chat-composer-busy-color-d5d246f27b)
      )
      65%,
    white
  );
  /* Background for .frame-chat-composer.busy::before; chat angle. @token --frame-chat-angle @context */
  background: conic-gradient(
    from var(--frame-chat-angle),
    transparent 55%,
    var(
        --frame-chat-composer-busy-color,
        var(--_frame-default-chat-composer-busy-color-d5d246f27b)
      )
      83%,
    var(
        --frame-chat-composer-busy-highlight,
        var(--_frame-default-chat-composer-busy-highlight-2c707b3bec)
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
    /* Maps the chat angle setting for to. @token --frame-chat-angle */
    --frame-chat-angle: 360deg;
  }
}
@media (prefers-reduced-motion: reduce) {
  .frame-chat-composer.busy::before {
    animation: none;
    /*   _frame default chat composer busy color d5d246f27b for .frame-chat-composer.busy::before; accent. @token --frame-accent */
    --_frame-default-accent-1583861c13: #0078d4;
    /* Background for .frame-chat-composer.busy::before; chat composer busy color. @token --frame-chat-composer-busy-color */
    --_frame-default-chat-composer-busy-color-d5d246f27b: var(
      --frame-accent,
      var(--_frame-default-accent-1583861c13)
    );
    background: var(
      --frame-chat-composer-busy-color,
      var(--_frame-default-chat-composer-busy-color-d5d246f27b)
    );
  }
}
</style>
