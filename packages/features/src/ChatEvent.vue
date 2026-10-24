<script setup lang="ts">
import { FrameCodeBlock } from "@frame/core";
import ChatInteraction from "./ChatInteraction.vue";
import ChatArtifact from "./ChatArtifact.vue";
import type { AIChatController } from "./aiChat";
import type { ChatPart } from "./chatTypes";
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
  <p v-if="part.type === 'commentary'" class="frame-chat-commentary">
    {{ part.text }}
  </p>
  <details
    v-else-if="part.type === 'activity'"
    class="frame-chat-activity"
    :data-status="part.status"
  >
    <summary>
      <span>{{ part.label }}</span
      ><span class="frame-chat-event-detail"
        >{{
          part.status === "running"
            ? "Running"
            : part.status === "completed"
              ? "Completed"
              : part.status === "failed"
                ? "Failed"
                : "Cancelled"
        }}
        · {{ duration(part.startedAt, part.finishedAt) }}</span
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
