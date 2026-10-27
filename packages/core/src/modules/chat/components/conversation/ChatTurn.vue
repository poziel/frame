<script setup lang="ts">
import '../../styles/index.css';
import {computed, nextTick, ref, watch} from 'vue';
import type {AIChatController, ChatMessage} from '../../controllers/aiChat';
import {
  splitChatTurn,
  buildChatWorkTimeline,
} from '../../services/content/chatParts';
import ChatMarkdown from '../content/ChatMarkdown.vue';
import ChatEvent from './ChatEvent.vue';
import ChatActivityGroup from './ChatActivityGroup.vue';

const props = defineProps<{
  message: ChatMessage;
  chat: AIChatController;
  now: number;
}>();
const parts = computed(() => splitChatTurn(props.message.parts));
const timeline = computed(() => buildChatWorkTimeline(props.message.parts));
const working = computed(() => props.message.status === 'pending');
const expandable = computed(
  () =>
    timeline.value.items.length > 0 ||
    (working.value && !!timeline.value.thought)
);
const disclosure = ref<HTMLDetailsElement>();
const summary = ref<HTMLElement>();
watch(
  () => props.message.status,
  (status) => {
    if (
      status === 'complete' &&
      disclosure.value?.contains(document.activeElement)
    ) {
      void nextTick(() => summary.value?.focus({preventScroll: true}));
    }
  }
);
function elapsed(start: number, end = props.now) {
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  return seconds < 60
    ? `${seconds} second${seconds === 1 ? '' : 's'}`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
const duration = computed(() =>
  elapsed(props.message.createdAt, props.message.finishedAt ?? props.now)
);
</script>

<template>
  <details
    v-if="expandable"
    ref="disclosure"
    class="frame-chat-work"
    :open="
      working || message.status === 'error' || message.status === 'stopped'
    "
  >
    <summary ref="summary" class="frame-chat-work-summary">
      <span>{{ working ? 'Working for' : 'Worked for' }} {{ duration }}</span>
      <span v-if="message.status === 'error'" class="frame-chat-work-outcome"
        >Failed</span
      >
      <span
        v-else-if="message.status === 'stopped'"
        class="frame-chat-work-outcome"
        >Stopped</span
      >
    </summary>
    <div
      v-if="timeline.items.length || (working && timeline.thought)"
      class="frame-chat-work-events"
    >
      <template v-for="part in timeline.items" :key="part.id">
        <ChatActivityGroup
          v-if="part.type === 'activityGroup'"
          :group="part"
          :chat="chat"
          :now="now"
        />
        <ChatMarkdown
          v-else-if="part.type === 'message'"
          class="frame-chat-text frame-chat-intermediate"
          :text="part.text"
        />
        <ChatEvent v-else :part="part" :chat="chat" :now="now" />
      </template>
      <div
        v-if="working && timeline.thought"
        class="frame-chat-current-thought"
        :title="timeline.thought.text"
      >
        {{ timeline.thought.text || 'Thinking…' }}
      </div>
    </div>
  </details>
  <p
    v-else
    ref="summary"
    class="frame-chat-work frame-chat-work-summary frame-chat-work-duration"
    tabindex="-1"
  >
    <span>{{ working ? 'Working for' : 'Worked for' }} {{ duration }}</span>
    <span
      v-if="message.status === 'error' || message.status === 'stopped'"
      class="frame-chat-work-outcome"
      >{{ message.status === 'error' ? 'Failed' : 'Stopped' }}</span
    >
  </p>
  <template v-for="part in parts.answer" :key="part.id">
    <ChatMarkdown
      v-if="part.type === 'message'"
      class="frame-chat-text frame-chat-answer"
      :text="part.text"
    />
    <ChatEvent v-else :part="part" :chat="chat" :now="now" />
  </template>
</template>
