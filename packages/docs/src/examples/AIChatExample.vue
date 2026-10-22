<script setup lang="ts">
import { onBeforeUnmount, shallowRef, ref } from "vue";
import { AIChat, createAIChat, type ChatMessage, type ChatResponder } from "@frame/extras";
import { FrameCheckbox } from "@frame/core";
const emit = defineEmits<{ feedback: [text: string] }>();
const reversed = ref(false);
const respond: ChatResponder = async (request, writer) => {
  // File objects stay local; a real host explicitly chooses how to upload attachment data.
  const response = await fetch('/api/chat-demo', { method: 'POST', signal: request.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: request.prompt }) });
  if (!response.ok || !response.body) throw new Error('Demo server unavailable. Run the docs dev or preview server.');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  const thinking = new Map<string, string>();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const event = JSON.parse(line) as { type: string; id: string; text: string };
        if (event.type === 'thinking') thinking.set(event.id, writer.thinking(event.text));
        else if (event.type === 'update-thinking') writer.updateThinking(thinking.get(event.id)!, event.text);
        else if (event.type === 'finish-thinking') writer.finishThinking(thinking.get(event.id)!);
        else if (event.type === 'message') writer.message(event.text);
        else if (event.type === 'complete') writer.complete();
      }
      if (done) break;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
};
const chat = shallowRef(createAIChat({ respond }));
function forge(messages: ChatMessage[]) {
  if (!messages.length) return;
  chat.value.dispose(); chat.value = createAIChat({ respond, messages });
  emit('feedback', 'Forged a new conversation from this response. Later messages were left out.');
}
function context() { chat.value.state.attachments.push({ id: crypto.randomUUID(), kind: 'context', name: 'Current workspace' }); }
onBeforeUnmount(() => chat.value.dispose());
</script>
<template>
  <div class="frame-chat-demo">
    <div class="frame-chat-demo-toolbar"><FrameCheckbox v-model="reversed" label="Reverse message alignment"/><span>Local demo · random replies · no AI connection</span></div>
    <div class="frame-chat-demo-room"><AIChat :chat="chat" :user-alignment="reversed ? 'left' : 'right'" :assistant-alignment="reversed ? 'right' : 'left'" :attachment-actions="[{ id: 'workspace', label: 'Current workspace' }]" @forge="forge" @attachment-action="context"><template #empty><div class="frame-chat-demo-empty"><strong>A little room to think.</strong><p>Send a prompt to see thinking unfold, followed by two messages in one response.</p></div></template></AIChat></div>
  </div>
</template>
<style scoped>
.frame-chat-demo { width: 100%; min-width: 0; }
.frame-chat-demo-toolbar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.frame-chat-demo-toolbar > span { color: var(--frame-muted); font-size: 11px; }
.frame-chat-demo-room { height: 620px; max-height: 75dvh; min-height: 320px; border: 1px solid #ffffff18; border-radius: 8px; overflow: hidden; }
.frame-chat-demo-empty { padding: 28px 10px; max-width: 350px; color: var(--frame-muted); }
.frame-chat-demo-empty strong { font-weight: 500; font-size: 16px; color: var(--frame-text); }
.frame-chat-demo-empty p { margin-top: 8px; }
</style>
