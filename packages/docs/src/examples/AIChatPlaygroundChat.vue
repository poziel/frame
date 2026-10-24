<script setup lang="ts">
import { ref } from "vue";
import { AIChat } from "@frame/features";
import { FrameButton, FrameCheckbox } from "@frame/core";
import type { ChatPlayground } from "./chatPlayground";
defineProps<{ session: ChatPlayground; openPlayground: () => void }>();
const reversed = ref(false);
</script>
<template>
  <div class="playground-chat-sidebar">
    <div class="playground-chat-toolbar">
      <FrameButton icon="beaker" @click="openPlayground"
        >Open playground</FrameButton
      ><FrameButton
        icon="play"
        :disabled="session.chat.state.busy"
        @click="
          openPlayground();
          session.runExample();
        "
        >Try demo</FrameButton
      ><FrameCheckbox v-model="reversed" label="Reverse alignment" />
    </div>
    <AIChat
      :chat="session.chat"
      :user-alignment="reversed ? 'left' : 'right'"
      :assistant-alignment="reversed ? 'right' : 'left'"
      @forge="session.forge($event)"
    >
      <template #empty
        ><div class="playground-chat-empty">
          <strong>{{
            session.state.mode === "demo"
              ? "An interactive example is ready."
              : "You’re both sides of this conversation."
          }}</strong>
          <p>
            {{
              session.state.mode === "demo"
                ? "Send a prompt to watch a scripted response. Answer questions and approvals here to continue."
                : "Try the interactive demo, or send a prompt here and use the workspace controls to respond manually."
            }}
          </p>
          <FrameButton variant="secondary" @click="openPlayground"
            >Open AI chat playground</FrameButton
          >
        </div></template
      >
    </AIChat>
  </div>
</template>
<style scoped>
.playground-chat-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.playground-chat-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--frame-border);
  font-size: 11px;
}
.playground-chat-sidebar > .frame-ai-chat {
  flex: 1;
  height: auto;
}
.playground-chat-empty {
  padding: 24px 4px;
  max-width: 360px;
  line-height: 1.7;
  color: var(--frame-muted);
}
.playground-chat-empty strong {
  color: var(--frame-text);
  font-size: 15px;
  font-weight: 500;
}
</style>
