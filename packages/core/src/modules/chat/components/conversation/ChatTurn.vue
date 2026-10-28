<script setup lang="ts">
import '../../styles/index.scss';
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

<style lang="scss">
.frame-chat-pending {
  /* Color for .frame-chat-pending; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-pending; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
}

.frame-chat-turn-status {
  /* Color for .frame-chat-turn-status; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-turn-status; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
}

.frame-chat-thought {
  /* Color for .frame-chat-thought; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-thought; chat thought font size. @token --frame-chat-thought-font-size */
  --_frame-default-chat-thought-font-size-2894afdb0b: 12px;
  font-size: var(
    --frame-chat-thought-font-size,
    var(--_frame-default-chat-thought-font-size-2894afdb0b)
  );
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.frame-chat-work {
  width: 100%;
  min-width: 0;
  /* Margin for .frame-chat-work; chat work gap. @token --frame-chat-work-gap */
  --_frame-default-chat-work-gap-f69b1a503e: 10px;
  margin: 0 0
    var(--frame-chat-work-gap, var(--_frame-default-chat-work-gap-f69b1a503e));
}

.frame-chat-work-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  cursor: pointer;
  list-style: none;
  /* Color for .frame-chat-work-summary; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-work-summary; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
}

.frame-chat-work-summary::-webkit-details-marker {
  display: none;
}

.frame-chat-work-summary::before {
  content: '';
  flex: 0 0 5px;
  height: 5px;
  border-top: 1px solid currentColor;
  border-right: 1px solid currentColor;
  transform: rotate(45deg);
  align-self: center;
}

.frame-chat-work[open] > .frame-chat-work-summary::before {
  transform: rotate(135deg);
}

.frame-chat-work-summary:focus-visible {
  /* Outline for .frame-chat-work-summary:focus-visible; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  outline: 1px solid
    var(--frame-accent, var(--_frame-default-accent-1583861c13));
  outline-offset: 4px;
}

.frame-chat-work-duration {
  cursor: default;
}

.frame-chat-work-duration::before {
  display: none;
}

.frame-chat-work-outcome {
  /* Color for .frame-chat-work-outcome; chat error color. @token --frame-chat-error-color */
  --_frame-default-chat-error-color-e8ebb94924: #f48771;
  color: var(
    --frame-chat-error-color,
    var(--_frame-default-chat-error-color-e8ebb94924)
  );
}

.frame-chat-work-events {
  display: flex;
  flex-direction: column;
  /* Gap for .frame-chat-work-events; chat work event gap. @token --frame-chat-work-event-gap */
  --_frame-default-chat-work-event-gap-b292314dfe: 6px;
  gap: var(
    --frame-chat-work-event-gap,
    var(--_frame-default-chat-work-event-gap-b292314dfe)
  );
  /* Padding for .frame-chat-work-events; chat work padding. @token --frame-chat-work-padding */
  --_frame-default-chat-work-padding-e39784c166: 8px 0 2px 12px;
  padding: var(
    --frame-chat-work-padding,
    var(--_frame-default-chat-work-padding-e39784c166)
  );
  /* Border left for .frame-chat-work-events; border. @token --frame-border */
  --_frame-default-border-4d797429ec: #ffffff24;
  border-left: 1px solid
    var(--frame-border, var(--_frame-default-border-4d797429ec));
  margin: 8px 0 0 2px;
}

.frame-chat-current-thought {
  /* Color for .frame-chat-current-thought; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-current-thought; chat thought font size. @token --frame-chat-thought-font-size */
  --_frame-default-chat-thought-font-size-2894afdb0b: 12px;
  font-size: var(
    --frame-chat-thought-font-size,
    var(--_frame-default-chat-thought-font-size-2894afdb0b)
  );
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.frame-chat-intermediate {
  /* Color for .frame-chat-intermediate; text. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  color: var(--frame-text, var(--_frame-default-text-11eec91da6));
}
</style>
