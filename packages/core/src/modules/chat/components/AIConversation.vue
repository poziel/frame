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
    chat: AIChatController;
    label?: string;
    placeholder?: string;
    /** Empty-conversation text; the empty slot takes precedence. */
    emptyMessage?: string;
    userAlignment?: 'left' | 'right';
    assistantAlignment?: 'left' | 'right';
    attachmentActions?: readonly FrameMenuItem[];
    speechEnabled?: boolean;
    /** Hide unsupported actions for native provider sessions. */
    allowRewind?: boolean;
    allowFork?: boolean;
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
  forge: [messages: ChatMessage[], source: ChatMessage];
  attachmentAction: [item: FrameMenuItem];
  speech: [];
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
defineExpose({focus: () => composerInput.value?.focus()});
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
  min-width: var(--frame-ai-chat-min-width, 0);
  min-height: var(--frame-ai-chat-min-height, 240px);
  height: var(--frame-ai-chat-height, 100%);
  gap: var(--frame-ai-chat-gap, 12px);
  padding: var(--frame-ai-chat-padding, 12px);
  background: var(--frame-surface, #181818);
  color: var(--frame-text, #ccc);
  font-size: var(--frame-ai-chat-font-size, 13px);
  line-height: var(--frame-ai-chat-line-height, 1.6);
}

.frame-chat-thinking {
  max-width: var(--frame-chat-thinking-max-width, 100%);
  color: var(--frame-muted, #999);
  margin: var(--frame-chat-thinking-margin, 0 0 12px);
  font-size: var(--frame-chat-thinking-font-size, 11px);
  line-height: var(--frame-chat-thinking-line-height, 1.6);
}

.frame-chat-thinking summary {
  display: flex;
  align-items: center;
  gap: var(--frame-chat-thinking-summary-gap, 6px);
  width: var(--frame-chat-thinking-summary-width, fit-content);
  cursor: pointer;
  padding: var(--frame-chat-thinking-summary-padding, 2px 0);
  list-style: none;
  color: inherit;
  font: inherit;
}

.frame-chat-thinking summary::-webkit-details-marker {
  display: none;
}

.frame-chat-thinking summary::after {
  content: '';
  width: var(--frame-chat-thinking-summary-after-width, 5px);
  height: var(--frame-chat-thinking-summary-after-height, 5px);
  border-top: var(
    --frame-chat-thinking-summary-after-border-top,
    1px solid currentColor
  );
  border-right: var(
    --frame-chat-thinking-summary-after-border-right,
    1px solid currentColor
  );
  transform: rotate(45deg);
  margin-right: var(--frame-chat-thinking-summary-after-margin-right, 3px);
}

.frame-chat-thinking[open] summary::after {
  transform: rotate(135deg);
}

.frame-chat-thinking > div {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: var(--frame-chat-thinking-div-padding, 6px 0);
  color: inherit;
  font: inherit;
}

.frame-chat-transcript {
  flex: 1;
  min-height: var(--frame-chat-transcript-min-height, 0);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: var(--frame-chat-transcript-padding, 16px 2px 0);
}

.frame-chat-empty {
  color: var(--frame-muted, #999);
  padding: var(--frame-chat-empty-padding, 20px 4px);
  white-space: pre-line;
}

.frame-chat-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: var(--frame-chat-message-margin, 0 0 24px);
  padding: var(--frame-chat-message-padding, 0 4px);
  min-width: var(--frame-chat-message-min-width, 0);
}

.frame-chat-message.right {
  align-items: flex-end;
}

.frame-chat-message.user .frame-chat-text {
  max-width: var(--frame-chat-message-user-frame-chat-text-max-width, 90%);
  border: var(
    --frame-chat-message-user-frame-chat-text-border,
    1px solid transparent
  );
  border-radius: var(
    --frame-chat-message-user-frame-chat-text-border-radius,
    7px
  );
  padding: var(--frame-chat-message-user-frame-chat-text-padding, 7px 12px);
  background: var(--frame-chat-user-background, #ffffff0b);
}

.frame-chat-message.editing .frame-chat-text {
  border-color: var(--frame-accent, #0078d4);
}

.frame-chat-edit-label {
  color: var(--frame-muted, #999);
  font-size: var(--frame-chat-edit-label-font-size, 11px);
  margin-bottom: var(--frame-chat-edit-label-margin-bottom, 5px);
}

.frame-chat-message.after-rewind {
  opacity: var(--frame-chat-message-after-rewind-opacity, 0.4);
}

.frame-chat-message-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--frame-chat-message-footer-gap, 8px);
  min-height: var(--frame-chat-message-footer-min-height, 26px);
  max-width: var(--frame-chat-message-footer-max-width, 100%);
  color: var(--frame-muted, #999);
  font-size: var(--frame-chat-message-footer-font-size, 10px);
}

.frame-chat-message.right .frame-chat-message-footer {
  flex-direction: row-reverse;
}

.frame-chat-message-actions {
  display: flex;
  opacity: var(--frame-chat-message-actions-opacity, 0);
  pointer-events: none;
  transition: var(--frame-chat-message-actions-transition, opacity 0.12s);
}

.frame-chat-message:hover .frame-chat-message-actions,
.frame-chat-message:focus-within .frame-chat-message-actions {
  opacity: var(
    --frame-chat-message-hover-frame-chat-message-actions-opacity,
    1
  );
  pointer-events: auto;
}

.frame-chat-message-meta {
  opacity: var(--frame-chat-message-meta-opacity, 0);
  transition: var(--frame-chat-message-meta-transition, opacity 0.12s);
}

.frame-chat-message:hover .frame-chat-message-meta,
.frame-chat-message:focus-within .frame-chat-message-meta {
  opacity: var(--frame-chat-message-hover-frame-chat-message-meta-opacity, 1);
}

.frame-chat-rewind-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--frame-chat-rewind-notice-gap, 6px);
  margin-bottom: var(--frame-chat-rewind-notice-margin-bottom, 6px);
  color: var(--frame-muted, #999);
  font-size: var(--frame-chat-rewind-notice-font-size, 11px);
}

.frame-chat-original-prompt {
  flex: 1;
  min-width: var(--frame-chat-original-prompt-min-width, 0);
  padding: var(--frame-chat-original-prompt-padding, 2px);
  border: var(--frame-chat-original-prompt-border, 0);
  background: var(--frame-chat-original-prompt-background, transparent);
  color: var(--frame-text, #ccc);
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
  width: var(--frame-chat-latest-width, 30px);
  height: var(--frame-chat-latest-height, 30px);
  border: 1px solid var(--frame-accent, #0078d4);
  border-radius: var(--frame-chat-latest-border-radius, 50%);
  background: var(--frame-surface, #181818);
  padding: var(--frame-chat-latest-padding, 0);
  color: inherit;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .frame-chat-message-meta,
  .frame-chat-message-actions {
    transition: var(--frame-chat-message-meta-transition-2, none);
  }
}

@media (hover: none) {
  .frame-chat-message-meta,
  .frame-chat-message-actions {
    opacity: var(--frame-chat-message-meta-opacity-2, 1);
    pointer-events: auto;
  }
}
</style>
