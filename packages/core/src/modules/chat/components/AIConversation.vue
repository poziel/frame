<script setup lang="ts">
import '../styles/index.scss';
import {computed, nextTick, onBeforeUnmount, ref, watch} from 'vue';
import {FrameIcon, FrameIconButton, type FrameMenuItem} from '../../../index';
import type {AIChatController, ChatMessage} from '../controllers/aiChat';
import {groupChatParts} from '../services/content/chatParts';
import ChatTurn from './conversation/ChatTurn.vue';
import AIPrompt from './AIPrompt.vue';

const props = withDefaults(
  defineProps<{
    /** Caller-owned conversation controller; unmounting this presentation does not dispose it. */
    chat: AIChatController;
    /** Accessible name or visible label for the rendered control. */
    label?: string;
    /** Prompt shown when the input is empty. */
    placeholder?: string;
    /** Empty-conversation text; the empty slot takes precedence. */
    emptyMessage?: string;
    /** Horizontal alignment of user messages in the transcript. */
    userAlignment?: 'left' | 'right';
    /** Horizontal alignment of assistant messages in the transcript. */
    assistantAlignment?: 'left' | 'right';
    /** Additional host actions offered by the attachment menu. */
    attachmentActions?: readonly FrameMenuItem[];
    /** Shows the speech action; the host handles the emitted speech request. */
    speechEnabled?: boolean;
    /** Hide unsupported actions for native provider sessions. */
    allowRewind?: boolean;
    /** Offers conversation branching controls when supported. */
    allowFork?: boolean;
    /** Offers file and folder attachment controls; files remain host-owned until submitted. */
    allowAttachments?: boolean;
  }>(),
  {
    label: 'AI conversation',
    emptyMessage: 'Start a conversation.',
    placeholder: 'Write a message…',
    userAlignment: 'right',
    assistantAlignment: 'left',
    attachmentActions: () => [],
    speechEnabled: false,
    allowRewind: true,
    allowFork: true,
    allowAttachments: true,
  }
);
const emit = defineEmits<{
  /** Requests a conversation branch with its source message and preceding messages. */
  forge: [messages: ChatMessage[], source: ChatMessage];
  /** Reports selection of an application attachment-menu action. */
  attachmentAction: [item: FrameMenuItem];
  /** Requests host-managed speech input. */
  speech: [];
  /** Reports copying a transcript message. */
  copy: [message: ChatMessage];
}>();
const composerInput = ref<{focus: () => void; measure: () => void}>();
const transcript = ref<HTMLElement>();

const nearBottom = ref(true),
  now = ref(Date.now()),
  announcement = ref('');
let timer: ReturnType<typeof setInterval> | undefined;
const state = computed(() => props.chat.state);
const canSend = computed(
  () =>
    (!!state.value.draft.trim() || !!state.value.attachments.length) &&
    !state.value.busy
);
const rewindIndex = computed(() =>
  state.value.messages.findIndex((item) => item.id === state.value.rewindId)
);
const originalPrompt = computed(
  () =>
    state.value.messages[rewindIndex.value]?.parts
      .filter((part) => part.type === 'message')
      .map((part) => part.text)
      .join('\n\n') ?? ''
);
const messageElements = new Map<string, HTMLElement>();
function jumpToRewind() {
  const element = messageElements.get(state.value.rewindId ?? '');
  const container = transcript.value;
  if (!element || !container) return;
  nearBottom.value = false;
  container.scrollTo({
    top:
      container.scrollTop +
      element.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      12,
  });
}
function timestamp(value: number) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
function measure() {
  composerInput.value?.measure();
}
function scroll() {
  const el = transcript.value;
  if (el) el.scrollTop = el.scrollHeight;
}
function trackScroll() {
  const el = transcript.value;
  if (el)
    nearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 70;
}
async function send() {
  if (!canSend.value) return;
  nearBottom.value = true;
  const task = props.chat.send();
  await nextTick();
  measure();
  scroll();
  composerInput.value?.focus();
  await task;
}
async function rewind(id: string) {
  props.chat.rewind(id);
  await nextTick();
  composerInput.value?.focus();
  measure();
}
async function copy(message: ChatMessage) {
  try {
    await navigator.clipboard.writeText(
      message.parts
        .filter(
          (part) => part.type === 'message' && part.phase !== 'intermediate'
        )
        .map((part) => part.text)
        .join('\n\n')
    );
    announcement.value = 'Message copied.';
    emit('copy', message);
  } catch {
    announcement.value =
      'Unable to copy. Select the message text to copy it manually.';
  }
}
watch(
  () => state.value.busy,
  (busy, wasBusy) => {
    if (timer) clearInterval(timer);
    timer = undefined;
    now.value = Date.now();
    if (busy) {
      announcement.value = 'Agent is working.';
      timer = setInterval(() => {
        now.value = Date.now();
      }, 250);
    } else if (wasBusy) {
      const last = state.value.messages[state.value.messages.length - 1];
      announcement.value =
        last?.status === 'error'
          ? 'Agent response failed.'
          : last?.status === 'stopped'
            ? 'Agent response stopped.'
            : 'Agent response completed.';
    }
  },
  {immediate: true}
);
watch(
  () =>
    JSON.stringify(
      state.value.messages.map((message) => [message.status, message.parts])
    ),
  () =>
    nextTick(() => {
      if (
        nearBottom.value &&
        !transcript.value?.contains(document.activeElement)
      )
        scroll();
    })
);
watch(
  () =>
    state.value.messages
      .flatMap((message) =>
        message.parts
          .filter(
            (part) => part.type === 'approval' || part.type === 'question'
          )
          .map((part) => `${part.id}:${part.status}`)
      )
      .join('|'),
  () => {
    const pending = state.value.messages
      .flatMap((message) => message.parts)
      .filter(
        (part) =>
          (part.type === 'approval' || part.type === 'question') &&
          part.status === 'pending'
      ).length;
    if (pending)
      announcement.value = `${pending} request${pending === 1 ? '' : 's'} waiting for your response.`;
    else if (state.value.busy)
      announcement.value = 'All requests resolved. Agent is working.';
  }
);

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
defineExpose({
  /** Focuses the active input or terminal surface without creating or disposing its owning controller. */
  focus: () => composerInput.value?.focus(),
});
defineSlots<{
  /** Empty transcript content replacing emptyMessage. */ empty?(): unknown;
  /** Additional actions for one transcript message. */ 'message-actions'?(
    props: {
    message: ChatMessage;
  }
  ): unknown;
  /** Additional composer actions passed to AIPrompt. */ 'composer-actions'?(): unknown;
}>();
</script>

<template>
  <section class="frame-ai-chat frame-ai-conversation" :aria-label="label">
    <div
      ref="transcript"
      class="frame-chat-transcript"
      role="log"
      aria-label="Conversation"
      aria-live="off"
      @scroll="trackScroll"
    >
      <slot v-if="!state.messages.length" name="empty"
        ><p v-if="emptyMessage" class="frame-chat-empty">{{
          emptyMessage
        }}</p></slot
      >
      <article
        v-for="(message, index) in state.messages"
        :key="message.id"
        :ref="
          (element) => {
            if (element)
              messageElements.set(message.id, element as HTMLElement);
            else messageElements.delete(message.id);
          }
        "
        class="frame-chat-message"
        :class="[
          message.role,
          message.role === 'user' ? userAlignment : assistantAlignment,
          {
            editing: message.id === state.rewindId,
            'after-rewind': rewindIndex >= 0 && index > rewindIndex,
          },
        ]"
        :aria-label="`${message.role === 'user' ? 'You' : 'Assistant'}, ${timestamp(message.createdAt)}`"
      >
        <span v-if="message.id === state.rewindId" class="frame-chat-edit-label"
          >Editing this message</span
        >
        <ChatTurn
          v-if="message.role === 'assistant'"
          :message="message"
          :chat="chat"
          :now="now"
        />
        <div
          v-for="part in message.role === 'user'
            ? groupChatParts(message.parts)
            : []"
          :key="part.id"
          class="frame-chat-text"
          >{{ part.text }}</div
        >
        <div v-if="message.attachments.length" class="frame-chat-attachments"
          ><span
            v-for="item in message.attachments"
            :key="item.id"
            class="frame-chat-chip"
            >{{ item.name }}</span
          ></div
        >
        <p v-if="message.error" class="frame-chat-error" role="alert">{{
          message.error
        }}</p>
        <footer class="frame-chat-message-footer">
          <div class="frame-chat-message-actions">
            <template v-if="message.role === 'assistant'"
              ><FrameIconButton
                label="Copy message"
                icon="copy"
                @click="copy(message)" /><FrameIconButton
                v-if="allowFork"
                label="Forge conversation from here"
                icon="repo-forked"
                :disabled="state.busy"
                @click="emit('forge', chat.fork(message.id), message)"
            /></template>
            <FrameIconButton
              v-else-if="message.role === 'user' && allowRewind"
              :label="
                message.id === state.rewindId
                  ? 'Cancel rewind'
                  : 'Rewind to this message'
              "
              icon="history"
              :aria-pressed="message.id === state.rewindId"
              :disabled="state.busy"
              @click="rewind(message.id)"
            />
            <slot name="message-actions" :message="message" />
          </div>
          <span class="frame-chat-message-meta"
            ><time
              :datetime="new Date(message.createdAt).toISOString()"
              :title="new Date(message.createdAt).toLocaleString()"
              >{{ timestamp(message.createdAt) }}</time
            ></span
          >
        </footer>
      </article>
    </div>
    <AIPrompt
      :allow-attachments="allowAttachments"
      ref="composerInput"
      v-model="state.draft"
      v-model:attachments="state.attachments"
      :busy="state.busy"
      :placeholder="placeholder"
      :attachment-actions="attachmentActions"
      :speech-enabled="speechEnabled"
      :class="{rewinding: state.rewindId}"
      @submit="send"
      @stop="chat.stop()"
      @cancel="chat.cancelRewind()"
      @speech="emit('speech')"
      @attachment-action="emit('attachmentAction', $event)"
    >
      <template #before-input>
        <button
          v-if="!nearBottom"
          type="button"
          class="frame-chat-latest"
          aria-label="Jump to latest"
          title="Jump to latest"
          @click="
            nearBottom = true;
            scroll();
          "
          ><FrameIcon name="arrow-down" :size="16"
        /></button>
        <div v-if="state.rewindId" class="frame-chat-rewind-notice"
          ><button
            type="button"
            class="frame-chat-original-prompt"
            :title="originalPrompt"
            aria-label="Jump to original prompt"
            @click="jumpToRewind"
            >{{ originalPrompt }}</button
          ><FrameIconButton
            label="Cancel rewind"
            icon="close"
            @click="chat.cancelRewind()"
        /></div>
      </template>
      <template #actions><slot name="composer-actions" /></template>
    </AIPrompt>
    <span class="sr-only" role="status">{{ announcement }}</span>
  </section>
</template>

<style lang="scss">
.frame-ai-chat {
  position: relative;
  display: flex;
  flex-direction: column;
  /* Min width for .frame-ai-chat; ai chat min width. @token --frame-ai-chat-min-width */
  --_frame-default-ai-chat-min-width-be05b7be00: 0;
  min-width: var(
    --frame-ai-chat-min-width,
    var(--_frame-default-ai-chat-min-width-be05b7be00)
  );
  /* Min height for .frame-ai-chat; ai chat min height. @token --frame-ai-chat-min-height */
  --_frame-default-ai-chat-min-height-0a8b1a3726: 240px;
  min-height: var(
    --frame-ai-chat-min-height,
    var(--_frame-default-ai-chat-min-height-0a8b1a3726)
  );
  /* Height for .frame-ai-chat; ai chat height. @token --frame-ai-chat-height */
  --_frame-default-ai-chat-height-dc0d198ac2: 100%;
  height: var(
    --frame-ai-chat-height,
    var(--_frame-default-ai-chat-height-dc0d198ac2)
  );
  /* Gap for .frame-ai-chat; ai chat gap. @token --frame-ai-chat-gap */
  --_frame-default-ai-chat-gap-0a167a12bf: 12px;
  gap: var(--frame-ai-chat-gap, var(--_frame-default-ai-chat-gap-0a167a12bf));
  /* Padding for .frame-ai-chat; ai chat padding. @token --frame-ai-chat-padding */
  --_frame-default-ai-chat-padding-01de0747f0: 12px;
  padding: var(
    --frame-ai-chat-padding,
    var(--_frame-default-ai-chat-padding-01de0747f0)
  );
  /* Background for .frame-ai-chat; surface. @token --frame-surface */
  --_frame-default-surface-7fcb70be5e: #181818;
  background: var(--frame-surface, var(--_frame-default-surface-7fcb70be5e));
  /* Color for .frame-ai-chat; text. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  color: var(--frame-text, var(--_frame-default-text-11eec91da6));
  /* Font size for .frame-ai-chat; ai chat font size. @token --frame-ai-chat-font-size */
  --_frame-default-ai-chat-font-size-a29f4da48a: 13px;
  font-size: var(
    --frame-ai-chat-font-size,
    var(--_frame-default-ai-chat-font-size-a29f4da48a)
  );
  /* Line height for .frame-ai-chat; ai chat line height. @token --frame-ai-chat-line-height */
  --_frame-default-ai-chat-line-height-d8f27d15f4: 1.6;
  line-height: var(
    --frame-ai-chat-line-height,
    var(--_frame-default-ai-chat-line-height-d8f27d15f4)
  );
}

.frame-chat-thinking {
  /* Max width for .frame-chat-thinking; chat thinking max width. @token --frame-chat-thinking-max-width */
  --_frame-default-chat-thinking-max-width-83dde2144a: 100%;
  max-width: var(
    --frame-chat-thinking-max-width,
    var(--_frame-default-chat-thinking-max-width-83dde2144a)
  );
  /* Color for .frame-chat-thinking; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Margin for .frame-chat-thinking; chat thinking margin. @token --frame-chat-thinking-margin */
  --_frame-default-chat-thinking-margin-0b95d32805: 0 0 12px;
  margin: var(
    --frame-chat-thinking-margin,
    var(--_frame-default-chat-thinking-margin-0b95d32805)
  );
  /* Font size for .frame-chat-thinking; chat thinking font size. @token --frame-chat-thinking-font-size */
  --_frame-default-chat-thinking-font-size-62b031de0c: 11px;
  font-size: var(
    --frame-chat-thinking-font-size,
    var(--_frame-default-chat-thinking-font-size-62b031de0c)
  );
  /* Line height for .frame-chat-thinking; chat thinking line height. @token --frame-chat-thinking-line-height */
  --_frame-default-chat-thinking-line-height-a8985d8fbe: 1.6;
  line-height: var(
    --frame-chat-thinking-line-height,
    var(--_frame-default-chat-thinking-line-height-a8985d8fbe)
  );
}

.frame-chat-thinking summary {
  display: flex;
  align-items: center;
  /* Gap for .frame-chat-thinking summary; chat thinking summary gap. @token --frame-chat-thinking-summary-gap */
  --_frame-default-chat-thinking-summary-gap-43e51a0ac8: 6px;
  gap: var(
    --frame-chat-thinking-summary-gap,
    var(--_frame-default-chat-thinking-summary-gap-43e51a0ac8)
  );
  /* Width for .frame-chat-thinking summary; chat thinking summary width. @token --frame-chat-thinking-summary-width */
  --_frame-default-chat-thinking-summary-width-ad498f1b10: fit-content;
  width: var(
    --frame-chat-thinking-summary-width,
    var(--_frame-default-chat-thinking-summary-width-ad498f1b10)
  );
  cursor: pointer;
  /* Padding for .frame-chat-thinking summary; chat thinking summary padding. @token --frame-chat-thinking-summary-padding */
  --_frame-default-chat-thinking-summary-padding-2a5f7a7fbc: 2px 0;
  padding: var(
    --frame-chat-thinking-summary-padding,
    var(--_frame-default-chat-thinking-summary-padding-2a5f7a7fbc)
  );
  list-style: none;
  color: inherit;
  font: inherit;
}

.frame-chat-thinking summary::-webkit-details-marker {
  display: none;
}

.frame-chat-thinking summary::after {
  content: '';
  /* Width for .frame-chat-thinking summary::after; chat thinking summary after width. @token --frame-chat-thinking-summary-after-width */
  --_frame-default-chat-thinking-summary-after-width-3b55cc154a: 5px;
  width: var(
    --frame-chat-thinking-summary-after-width,
    var(--_frame-default-chat-thinking-summary-after-width-3b55cc154a)
  );
  /* Height for .frame-chat-thinking summary::after; chat thinking summary after height. @token --frame-chat-thinking-summary-after-height */
  --_frame-default-chat-thinking-summary-after-height-87cf54cc24: 5px;
  height: var(
    --frame-chat-thinking-summary-after-height,
    var(--_frame-default-chat-thinking-summary-after-height-87cf54cc24)
  );
  /* Border top for .frame-chat-thinking summary::after; chat thinking summary after border top. @token --frame-chat-thinking-summary-after-border-top */
  --_frame-default-chat-thinking-summary-after-border-top-6e47922005: 1px solid
    currentColor;
  border-top: var(
    --frame-chat-thinking-summary-after-border-top,
    var(--_frame-default-chat-thinking-summary-after-border-top-6e47922005)
  );
  /* Border right for .frame-chat-thinking summary::after; chat thinking summary after border right. @token --frame-chat-thinking-summary-after-border-right */
  --_frame-default-chat-thinking-summary-after-border-right-03d30b6922: 1px
    solid currentColor;
  border-right: var(
    --frame-chat-thinking-summary-after-border-right,
    var(--_frame-default-chat-thinking-summary-after-border-right-03d30b6922)
  );
  transform: rotate(45deg);
  /* Margin right for .frame-chat-thinking summary::after; chat thinking summary after margin right. @token --frame-chat-thinking-summary-after-margin-right */
  --_frame-default-chat-thinking-summary-after-margin-right-65adb8d85e: 3px;
  margin-right: var(
    --frame-chat-thinking-summary-after-margin-right,
    var(--_frame-default-chat-thinking-summary-after-margin-right-65adb8d85e)
  );
}

.frame-chat-thinking[open] summary::after {
  transform: rotate(135deg);
}

.frame-chat-thinking > div {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  /* Padding for .frame-chat-thinking > div; chat thinking div padding. @token --frame-chat-thinking-div-padding */
  --_frame-default-chat-thinking-div-padding-f55b667cdf: 6px 0;
  padding: var(
    --frame-chat-thinking-div-padding,
    var(--_frame-default-chat-thinking-div-padding-f55b667cdf)
  );
  color: inherit;
  font: inherit;
}

.frame-chat-transcript {
  flex: 1;
  /* Min height for .frame-chat-transcript; chat transcript min height. @token --frame-chat-transcript-min-height */
  --_frame-default-chat-transcript-min-height-e91fd6e8ff: 0;
  min-height: var(
    --frame-chat-transcript-min-height,
    var(--_frame-default-chat-transcript-min-height-e91fd6e8ff)
  );
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  /* Padding for .frame-chat-transcript; chat transcript padding. @token --frame-chat-transcript-padding */
  --_frame-default-chat-transcript-padding-379ccd8a82: 16px 2px 0;
  padding: var(
    --frame-chat-transcript-padding,
    var(--_frame-default-chat-transcript-padding-379ccd8a82)
  );
}

.frame-chat-empty {
  /* Color for .frame-chat-empty; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Padding for .frame-chat-empty; chat empty padding. @token --frame-chat-empty-padding */
  --_frame-default-chat-empty-padding-22c01cfca7: 20px 4px;
  padding: var(
    --frame-chat-empty-padding,
    var(--_frame-default-chat-empty-padding-22c01cfca7)
  );
  white-space: pre-line;
}

.frame-chat-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* Margin for .frame-chat-message; chat message margin. @token --frame-chat-message-margin */
  --_frame-default-chat-message-margin-86a6cb5966: 0 0 24px;
  margin: var(
    --frame-chat-message-margin,
    var(--_frame-default-chat-message-margin-86a6cb5966)
  );
  /* Padding for .frame-chat-message; chat message padding. @token --frame-chat-message-padding */
  --_frame-default-chat-message-padding-c5cd271fe0: 0 4px;
  padding: var(
    --frame-chat-message-padding,
    var(--_frame-default-chat-message-padding-c5cd271fe0)
  );
  /* Min width for .frame-chat-message; chat message min width. @token --frame-chat-message-min-width */
  --_frame-default-chat-message-min-width-0482ac35d0: 0;
  min-width: var(
    --frame-chat-message-min-width,
    var(--_frame-default-chat-message-min-width-0482ac35d0)
  );
}

.frame-chat-message.right {
  align-items: flex-end;
}

.frame-chat-message.user .frame-chat-text {
  /* Max width for .frame-chat-message.user .frame-chat-text; chat message user frame chat text max width. @token --frame-chat-message-user-frame-chat-text-max-width */
  --_frame-default-chat-message-user-frame-chat-text-max-width-73f4badf26: 90%;
  max-width: var(
    --frame-chat-message-user-frame-chat-text-max-width,
    var(--_frame-default-chat-message-user-frame-chat-text-max-width-73f4badf26)
  );
  /* Border for .frame-chat-message.user .frame-chat-text; chat message user frame chat text border. @token --frame-chat-message-user-frame-chat-text-border */
  --_frame-default-chat-message-user-frame-chat-text-border-79ab48135d: 1px
    solid transparent;
  border: var(
    --frame-chat-message-user-frame-chat-text-border,
    var(--_frame-default-chat-message-user-frame-chat-text-border-79ab48135d)
  );
  /* Border radius for .frame-chat-message.user .frame-chat-text; chat message user frame chat text border radius. @token --frame-chat-message-user-frame-chat-text-border-radius */
  --_frame-default-chat-message-user-frame-chat-text-border-radius-7a5990f18e: 7px;
  border-radius: var(
    --frame-chat-message-user-frame-chat-text-border-radius,
    var(
      --_frame-default-chat-message-user-frame-chat-text-border-radius-7a5990f18e
    )
  );
  /* Padding for .frame-chat-message.user .frame-chat-text; chat message user frame chat text padding. @token --frame-chat-message-user-frame-chat-text-padding */
  --_frame-default-chat-message-user-frame-chat-text-padding-6a1cab0f39: 7px
    12px;
  padding: var(
    --frame-chat-message-user-frame-chat-text-padding,
    var(--_frame-default-chat-message-user-frame-chat-text-padding-6a1cab0f39)
  );
  /* Background for .frame-chat-message.user .frame-chat-text; chat user background. @token --frame-chat-user-background */
  --_frame-default-chat-user-background-e5f9716ed7: #ffffff0b;
  background: var(
    --frame-chat-user-background,
    var(--_frame-default-chat-user-background-e5f9716ed7)
  );
}

.frame-chat-message.editing .frame-chat-text {
  /* Border color for .frame-chat-message.editing .frame-chat-text; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  border-color: var(--frame-accent, var(--_frame-default-accent-1583861c13));
}

.frame-chat-edit-label {
  /* Color for .frame-chat-edit-label; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-edit-label; chat edit label font size. @token --frame-chat-edit-label-font-size */
  --_frame-default-chat-edit-label-font-size-0e8f523a07: 11px;
  font-size: var(
    --frame-chat-edit-label-font-size,
    var(--_frame-default-chat-edit-label-font-size-0e8f523a07)
  );
  /* Margin bottom for .frame-chat-edit-label; chat edit label margin bottom. @token --frame-chat-edit-label-margin-bottom */
  --_frame-default-chat-edit-label-margin-bottom-3e60329812: 5px;
  margin-bottom: var(
    --frame-chat-edit-label-margin-bottom,
    var(--_frame-default-chat-edit-label-margin-bottom-3e60329812)
  );
}

.frame-chat-message.after-rewind {
  /* Opacity for .frame-chat-message.after-rewind; chat message after rewind opacity. @token --frame-chat-message-after-rewind-opacity */
  --_frame-default-chat-message-after-rewind-opacity-82209fbca8: 0.4;
  opacity: var(
    --frame-chat-message-after-rewind-opacity,
    var(--_frame-default-chat-message-after-rewind-opacity-82209fbca8)
  );
}

.frame-chat-message-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* Gap for .frame-chat-message-footer; chat message footer gap. @token --frame-chat-message-footer-gap */
  --_frame-default-chat-message-footer-gap-5486852e93: 8px;
  gap: var(
    --frame-chat-message-footer-gap,
    var(--_frame-default-chat-message-footer-gap-5486852e93)
  );
  /* Min height for .frame-chat-message-footer; chat message footer min height. @token --frame-chat-message-footer-min-height */
  --_frame-default-chat-message-footer-min-height-c2111786f0: 26px;
  min-height: var(
    --frame-chat-message-footer-min-height,
    var(--_frame-default-chat-message-footer-min-height-c2111786f0)
  );
  /* Max width for .frame-chat-message-footer; chat message footer max width. @token --frame-chat-message-footer-max-width */
  --_frame-default-chat-message-footer-max-width-a3f9bd120f: 100%;
  max-width: var(
    --frame-chat-message-footer-max-width,
    var(--_frame-default-chat-message-footer-max-width-a3f9bd120f)
  );
  /* Color for .frame-chat-message-footer; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-message-footer; chat message footer font size. @token --frame-chat-message-footer-font-size */
  --_frame-default-chat-message-footer-font-size-e779e53242: 10px;
  font-size: var(
    --frame-chat-message-footer-font-size,
    var(--_frame-default-chat-message-footer-font-size-e779e53242)
  );
}

.frame-chat-message.right .frame-chat-message-footer {
  flex-direction: row-reverse;
}

.frame-chat-message-actions {
  display: flex;
  /* Opacity for .frame-chat-message-actions; chat message actions opacity. @token --frame-chat-message-actions-opacity */
  --_frame-default-chat-message-actions-opacity-e2598b194c: 0;
  opacity: var(
    --frame-chat-message-actions-opacity,
    var(--_frame-default-chat-message-actions-opacity-e2598b194c)
  );
  pointer-events: none;
  /* Transition for .frame-chat-message-actions; chat message actions transition. @token --frame-chat-message-actions-transition */
  --_frame-default-chat-message-actions-transition-dbb64d66e8: opacity 0.12s;
  transition: var(
    --frame-chat-message-actions-transition,
    var(--_frame-default-chat-message-actions-transition-dbb64d66e8)
  );
}

.frame-chat-message:hover .frame-chat-message-actions,
.frame-chat-message:focus-within .frame-chat-message-actions {
  /* Opacity for .frame-chat-message:hover .frame-chat-message-actions,
.frame-chat-message:focus-within .frame-chat-message-actions; chat message hover frame chat message actions opacity. @token --frame-chat-message-hover-frame-chat-message-actions-opacity */
  --_frame-default-chat-message-hover-frame-chat-message-actions-opacity-4ee7b695ac: 1;
  opacity: var(
    --frame-chat-message-hover-frame-chat-message-actions-opacity,
    var(
      --_frame-default-chat-message-hover-frame-chat-message-actions-opacity-4ee7b695ac
    )
  );
  pointer-events: auto;
}

.frame-chat-message-meta {
  /* Opacity for .frame-chat-message-meta; chat message meta opacity. @token --frame-chat-message-meta-opacity */
  --_frame-default-chat-message-meta-opacity-4f4764c346: 0;
  opacity: var(
    --frame-chat-message-meta-opacity,
    var(--_frame-default-chat-message-meta-opacity-4f4764c346)
  );
  /* Transition for .frame-chat-message-meta; chat message meta transition. @token --frame-chat-message-meta-transition */
  --_frame-default-chat-message-meta-transition-76157c7f2e: opacity 0.12s;
  transition: var(
    --frame-chat-message-meta-transition,
    var(--_frame-default-chat-message-meta-transition-76157c7f2e)
  );
}

.frame-chat-message:hover .frame-chat-message-meta,
.frame-chat-message:focus-within .frame-chat-message-meta {
  /* Opacity for .frame-chat-message:hover .frame-chat-message-meta,
.frame-chat-message:focus-within .frame-chat-message-meta; chat message hover frame chat message meta opacity. @token --frame-chat-message-hover-frame-chat-message-meta-opacity */
  --_frame-default-chat-message-hover-frame-chat-message-meta-opacity-892f1fcdb5: 1;
  opacity: var(
    --frame-chat-message-hover-frame-chat-message-meta-opacity,
    var(
      --_frame-default-chat-message-hover-frame-chat-message-meta-opacity-892f1fcdb5
    )
  );
}

.frame-chat-rewind-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Gap for .frame-chat-rewind-notice; chat rewind notice gap. @token --frame-chat-rewind-notice-gap */
  --_frame-default-chat-rewind-notice-gap-9143cd86f0: 6px;
  gap: var(
    --frame-chat-rewind-notice-gap,
    var(--_frame-default-chat-rewind-notice-gap-9143cd86f0)
  );
  /* Margin bottom for .frame-chat-rewind-notice; chat rewind notice margin bottom. @token --frame-chat-rewind-notice-margin-bottom */
  --_frame-default-chat-rewind-notice-margin-bottom-8b44968c61: 6px;
  margin-bottom: var(
    --frame-chat-rewind-notice-margin-bottom,
    var(--_frame-default-chat-rewind-notice-margin-bottom-8b44968c61)
  );
  /* Color for .frame-chat-rewind-notice; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-rewind-notice; chat rewind notice font size. @token --frame-chat-rewind-notice-font-size */
  --_frame-default-chat-rewind-notice-font-size-5b6c3e93ec: 11px;
  font-size: var(
    --frame-chat-rewind-notice-font-size,
    var(--_frame-default-chat-rewind-notice-font-size-5b6c3e93ec)
  );
}

.frame-chat-original-prompt {
  flex: 1;
  /* Min width for .frame-chat-original-prompt; chat original prompt min width. @token --frame-chat-original-prompt-min-width */
  --_frame-default-chat-original-prompt-min-width-03f47bd5e2: 0;
  min-width: var(
    --frame-chat-original-prompt-min-width,
    var(--_frame-default-chat-original-prompt-min-width-03f47bd5e2)
  );
  /* Padding for .frame-chat-original-prompt; chat original prompt padding. @token --frame-chat-original-prompt-padding */
  --_frame-default-chat-original-prompt-padding-73a0c8005c: 2px;
  padding: var(
    --frame-chat-original-prompt-padding,
    var(--_frame-default-chat-original-prompt-padding-73a0c8005c)
  );
  /* Border for .frame-chat-original-prompt; chat original prompt border. @token --frame-chat-original-prompt-border */
  --_frame-default-chat-original-prompt-border-0c95680f67: 0;
  border: var(
    --frame-chat-original-prompt-border,
    var(--_frame-default-chat-original-prompt-border-0c95680f67)
  );
  /* Background for .frame-chat-original-prompt; chat original prompt background. @token --frame-chat-original-prompt-background */
  --_frame-default-chat-original-prompt-background-e2fbcbc0f9: transparent;
  background: var(
    --frame-chat-original-prompt-background,
    var(--_frame-default-chat-original-prompt-background-e2fbcbc0f9)
  );
  /* Color for .frame-chat-original-prompt; text. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  color: var(--frame-text, var(--_frame-default-text-11eec91da6));
  font: inherit;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.frame-chat-rewind-notice > :last-child {
  flex-shrink: 0;
}

.frame-chat-latest {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: grid;
  place-items: center;
  /* Width for .frame-chat-latest; chat latest width. @token --frame-chat-latest-width */
  --_frame-default-chat-latest-width-759d6f4140: 30px;
  width: var(
    --frame-chat-latest-width,
    var(--_frame-default-chat-latest-width-759d6f4140)
  );
  /* Height for .frame-chat-latest; chat latest height. @token --frame-chat-latest-height */
  --_frame-default-chat-latest-height-a37a94f262: 30px;
  height: var(
    --frame-chat-latest-height,
    var(--_frame-default-chat-latest-height-a37a94f262)
  );
  /* Border for .frame-chat-latest; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  border: 1px solid var(--frame-accent, var(--_frame-default-accent-1583861c13));
  /* Border radius for .frame-chat-latest; chat latest border radius. @token --frame-chat-latest-border-radius */
  --_frame-default-chat-latest-border-radius-c6f4466d33: 50%;
  border-radius: var(
    --frame-chat-latest-border-radius,
    var(--_frame-default-chat-latest-border-radius-c6f4466d33)
  );
  /* Background for .frame-chat-latest; surface. @token --frame-surface */
  --_frame-default-surface-7fcb70be5e: #181818;
  background: var(--frame-surface, var(--_frame-default-surface-7fcb70be5e));
  /* Padding for .frame-chat-latest; chat latest padding. @token --frame-chat-latest-padding */
  --_frame-default-chat-latest-padding-f6943ccac8: 0;
  padding: var(
    --frame-chat-latest-padding,
    var(--_frame-default-chat-latest-padding-f6943ccac8)
  );
  color: inherit;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .frame-chat-message-meta,
  .frame-chat-message-actions {
    /* Transition for .frame-chat-message-meta,
  .frame-chat-message-actions; chat message meta transition 2. @token --frame-chat-message-meta-transition-2 */
    --_frame-default-chat-message-meta-transition-2-979141ecbe: none;
    transition: var(
      --frame-chat-message-meta-transition-2,
      var(--_frame-default-chat-message-meta-transition-2-979141ecbe)
    );
  }
}

@media (hover: none) {
  .frame-chat-message-meta,
  .frame-chat-message-actions {
    /* Opacity for .frame-chat-message-meta,
  .frame-chat-message-actions; chat message meta opacity 2. @token --frame-chat-message-meta-opacity-2 */
    --_frame-default-chat-message-meta-opacity-2-69b47b27a2: 1;
    opacity: var(
      --frame-chat-message-meta-opacity-2,
      var(--_frame-default-chat-message-meta-opacity-2-69b47b27a2)
    );
    pointer-events: auto;
  }
}
</style>
