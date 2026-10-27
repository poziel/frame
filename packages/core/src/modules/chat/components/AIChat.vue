<script setup lang="ts">
import '../styles/index.css';
import {computed, nextTick, ref, watch} from 'vue';
import {FrameIconButton, type FrameMenuItem} from '../../../index';
import AIConversation from './AIConversation.vue';
import AIHistory from './AIHistory.vue';
import type {AIChatController} from '../controllers/aiChat';
import type {
  AIChatHistoryController,
  AIChatConversation,
} from '../controllers/aiChatHistory';
import type {ChatMessage} from '../types/chatTypes';

const props = withDefaults(
  defineProps<{
    /** One caller-owned conversation when history is omitted. */
    chat?: AIChatController;
    /** Adds conversation selection, creation, and responsive history navigation. Takes precedence over chat. */
    history?: AIChatHistoryController;
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
    /** Adds application actions to the history row menu; emits historyAction. */
    historyActions?: (
      conversation: AIChatConversation
    ) => readonly FrameMenuItem[];
  }>(),
  {label: 'AI chat', allowRewind: true, allowFork: true, allowAttachments: true}
);
const emit = defineEmits<{
  forge: [messages: ChatMessage[], source: ChatMessage];
  attachmentAction: [item: FrameMenuItem];
  speech: [];
  copy: [message: ChatMessage];
  historyAction: [item: FrameMenuItem, conversation: AIChatConversation];
}>();
const showingHistory = ref(!!props.history && !props.history.active.value);
const current = computed(() =>
  props.history ? props.history.active.value?.chat : props.chat
);
watch(current, (value) => {
  showingHistory.value = !value;
});
const conversation = ref<{focus: () => void}>();
const historyView = ref<{focus: () => void}>();
async function openConversation() {
  showingHistory.value = false;
  await nextTick();
  conversation.value?.focus();
}
async function openHistory() {
  showingHistory.value = true;
  await nextTick();
  historyView.value?.focus();
}
defineExpose({
  focus: () => {
    if (props.history && (showingHistory.value || !current.value))
      historyView.value?.focus();
    else conversation.value?.focus();
  },
});
</script>
<template>
  <section
    class="frame-ai-view frame-ai-chat-bundle"
    :class="{
      'show-history': !!history && (showingHistory || !current),
      'has-history': !!history,
      'has-conversation': !!current,
    }"
    :aria-label="label"
  >
    <div class="frame-ai-view-layout">
      <aside v-if="history" class="frame-ai-view-history"
        ><AIHistory
          ref="historyView"
          :history="history"
          :placeholder="placeholder"
          :context-actions="historyActions"
          :attachment-actions="attachmentActions"
          :speech-enabled="speechEnabled"
          @select="openConversation"
          @create="openConversation"
          @action="(item, entry) => emit('historyAction', item, entry)"
          @speech="emit('speech')"
          @attachment-action="emit('attachmentAction', $event)"
          ><template #composer-actions
            ><slot name="composer-actions" /></template></AIHistory
      ></aside>
      <div class="frame-ai-view-content">
        <FrameIconButton
          v-if="history && current && !showingHistory"
          class="frame-ai-view-back"
          icon="arrow-left"
          label="Back to conversation history"
          :size="26"
          @click="openHistory"
        />
        <AIConversation
          :empty-message="emptyMessage"
          :allow-rewind="allowRewind"
          :allow-fork="allowFork"
          :allow-attachments="allowAttachments"
          v-if="current"
          :class="{'history-hidden-conversation': showingHistory && history}"
          :key="history?.activeId.value"
          ref="conversation"
          :chat="current"
          :placeholder="placeholder"
          :user-alignment="userAlignment"
          :assistant-alignment="assistantAlignment"
          :attachment-actions="attachmentActions"
          :speech-enabled="speechEnabled"
          @forge="(messages, source) => emit('forge', messages, source)"
          @attachment-action="emit('attachmentAction', $event)"
          @speech="emit('speech')"
          @copy="emit('copy', $event)"
        >
          <template v-if="$slots.empty" #empty><slot name="empty" /></template>
          <template #message-actions="scope"
            ><slot name="message-actions" v-bind="scope"
          /></template>
          <template #composer-actions
            ><slot name="composer-actions"
          /></template>
        </AIConversation>
        <p v-if="!history && !chat">Supply a chat or conversation history.</p>
      </div>
    </div>
  </section>
</template>
