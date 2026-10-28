<script setup lang="ts">
import '../styles/index.scss';
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

<style lang="scss">
.frame-ai-view {
  display: flex;
  height: 100%;
  min-height: 0;
  min-width: 0;
  container-type: inline-size;
  color: var(--frame-text);
}

.frame-ai-view-content {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.frame-ai-view-layout {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.frame-ai-view-content > .frame-ai-chat {
  flex: 1;
  min-height: 0;
}

.frame-ai-view-history {
  display: none;
  min-width: 0;
  overflow: auto;
}

.frame-ai-view:where(.show-history) .frame-ai-view-layout {
  flex-direction: column;
}

.frame-ai-view:where(.show-history) .frame-ai-view-history {
  display: block;
  flex: 1;
}

.frame-ai-view:where(.show-history) .frame-ai-view-content {
  flex: 0 0 auto;
}

.frame-ai-view-new {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.frame-ai-view .frame-ai-view-back {
  position: absolute;
  top: var(--frame-ai-history-back-top, 6px);
  left: var(--frame-ai-history-back-left, 8px);
  z-index: 2;
  margin: 0;
  color: var(--frame-muted);
}

.frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript {
  padding-top: var(--frame-ai-history-back-clearance, 24px);
}

.frame-ai-view .history-hidden-conversation {
  display: none;
}

.frame-ai-view.show-history:not(.has-conversation) .frame-ai-view-content {
  display: none;
}

@container (min-width: 720px) {
  .frame-ai-view .frame-ai-view-layout {
    flex-direction: row;
  }
  .frame-ai-view .frame-ai-view-history {
    display: block;
    flex: 0 0 var(--frame-ai-history-width, 280px);
    border-right: 1px solid var(--frame-line);
  }
  .frame-ai-view .frame-ai-view-content {
    flex: 1;
  }
  .frame-ai-view .frame-ai-view-back {
    display: none;
  }
  .frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript {
    padding-top: 0;
  }
  .frame-ai-view .history-hidden-conversation {
    display: flex;
  }
  .frame-ai-view:not(.has-conversation) .frame-ai-view-history {
    flex: 1;
    border-right: 0;
  }
}
</style>
