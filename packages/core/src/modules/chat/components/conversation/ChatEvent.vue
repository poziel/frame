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
  /* Color for .frame-chat-commentary; text. @token --frame-text */
  --_frame-default-text-11eec91da6: #ccc;
  color: var(--frame-text, var(--_frame-default-text-11eec91da6));
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  /* Font size for .frame-chat-commentary; chat commentary font size. @token --frame-chat-commentary-font-size */
  --_frame-default-chat-commentary-font-size-7c977db6ff: 13px;
  font-size: var(
    --frame-chat-commentary-font-size,
    var(--_frame-default-chat-commentary-font-size-7c977db6ff)
  );
}

.frame-chat-activity summary {
  cursor: pointer;
}

.frame-chat-activity .frame-chat-event-text {
  /* Color for .frame-chat-activity .frame-chat-event-text; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  font-size: inherit;
  margin: 4px 0;
}

.frame-chat-activity .frame-chat-event-detail {
  margin: 0;
  white-space: nowrap;
}

.frame-chat-activity-output {
  /* Max height for .frame-chat-activity-output; chat output max height. @token --frame-chat-output-max-height */
  --_frame-default-chat-output-max-height-7f37eec0ba: 240px;
  max-height: var(
    --frame-chat-output-max-height,
    var(--_frame-default-chat-output-max-height-7f37eec0ba)
  );
  margin: 6px 0;
  /* Font size for .frame-chat-activity-output; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
}

.frame-chat-activity-output pre {
  padding: 8px 0;
  overscroll-behavior: contain;
}

.frame-chat-activity[data-status='failed'] {
  /* Border color for .frame-chat-activity[data-status='failed']; chat error color. @token --frame-chat-error-color */
  --_frame-default-chat-error-color-e8ebb94924: #f48771;
  border-color: var(
    --frame-chat-error-color,
    var(--_frame-default-chat-error-color-e8ebb94924)
  );
}
</style>
