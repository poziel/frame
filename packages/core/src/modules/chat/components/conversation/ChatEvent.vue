<script setup lang="ts">
import '../../styles/index.scss';
import {FrameCodeBlock} from '../../../../index';
import ChatMarkdown from '../content/ChatMarkdown.vue';
import ChatInteraction from './ChatInteraction.vue';
import ChatArtifact from './ChatArtifact.vue';
import type {AIChatController} from '../../controllers/aiChat';
import type {ChatPart} from '../../types/chatTypes';

const props = defineProps<{
  part: ChatPart;
  chat: AIChatController;
  now: number;
}>();
function duration(start: number, end?: number) {
  return `${Math.max(0, Math.floor(((end ?? props.now) - start) / 1000))}s`;
}
</script>
<template>
  <ChatMarkdown
    v-if="part.type === 'commentary'"
    class="frame-chat-commentary"
    :text="part.text"
  />
  <details
    v-else-if="part.type === 'activity'"
    class="frame-chat-activity frame-chat-event-surface"
    :data-status="part.status"
  >
    <summary>
      <span>{{ part.label }}</span
      ><span class="frame-chat-event-detail frame-chat-event-meta"
        >{{
          part.status === 'running'
            ? 'Running'
            : part.status === 'completed'
              ? 'Completed'
              : part.status === 'failed'
                ? 'Failed'
                : 'Cancelled'
        }}
        ({{ duration(part.startedAt, part.finishedAt) }})</span
      >
    </summary>
    <p v-if="part.text" class="frame-chat-event-text">{{ part.text }}</p>
    <FrameCodeBlock
      v-if="part.output"
      class="frame-chat-activity-output"
      :code="part.output"
      :language="part.outputLanguage || 'text'"
      label="Activity output"
      :copyable="false"
      :highlight-on-hover="false"
    />
  </details>
  <ChatInteraction
    v-else-if="part.type === 'approval' || part.type === 'question'"
    :part="part"
    :chat="chat"
  />
  <ChatArtifact v-else-if="part.type === 'artifact'" :part="part" />
</template>

<style lang="scss">
@use '../../styles/event-layout';

.frame-chat-activity summary {
  @include event-layout.heading-layout;
}

.frame-chat-commentary {
  margin: 0 0 10px;
  color: var(--frame-text, #ccc);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: var(--frame-chat-commentary-font-size, 13px);
}

.frame-chat-activity summary {
  cursor: pointer;
}

.frame-chat-activity .frame-chat-event-text {
  color: var(--frame-muted, #999);
  font-size: inherit;
  margin: 4px 0;
}

.frame-chat-activity .frame-chat-event-detail {
  margin: 0;
  white-space: nowrap;
}

.frame-chat-activity-output {
  max-height: var(--frame-chat-output-max-height, 240px);
  margin: 6px 0;
  font-size: var(--frame-chat-event-meta-size, 11px);
}

.frame-chat-activity-output pre {
  padding: 8px 0;
  overscroll-behavior: contain;
}

.frame-chat-activity[data-status='failed'] {
  border-color: var(--frame-chat-error-color, #f48771);
}
</style>
