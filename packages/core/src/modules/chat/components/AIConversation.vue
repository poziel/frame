<script setup lang="ts">
import '../styles/index.css';
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
