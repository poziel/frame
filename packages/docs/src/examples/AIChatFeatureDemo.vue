<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue';
import { FrameButton, FrameCheckbox, FrameSelect, FrameSlider, FrameTextField, useFrame } from '@frame/core';
import { AIChat, AIConversation, AIHistory, AIPrompt, createAIChatHistory, createAIChatView, type ChatAttachment } from '@frame/core/modules/chat';
import AIChatPlayground from './AIChatPlayground.vue';
import { createChatPlayground } from './chatPlayground';
import type { AIChatFeatureKind } from './aiFeatureKinds';
const props = withDefaults(defineProps<{ kind: AIChatFeatureKind; preview?: boolean }>(), { preview: false });
const frame = useFrame(), id = `docs-ai-view-${useId()}`;
const session = createChatPlayground(); session.setMode('demo');
const sessions = [session];
const history = createAIChatHistory({ applicationId: 'frame-docs', createChat: () => {
  const item = createChatPlayground(); item.setMode('demo'); if (props.kind === 'ai-history') item.setScenario('reply'); sessions.push(item); return item.chat;
} });
const scope = ref('application'), registered = ref(false), density = ref('comfortable'), placeholder = ref('Write a message…');
const width = ref(860), disabled = ref(false), busy = ref(false), reversed = ref(false);
const draft = ref(''), attachments = ref<ChatAttachment[]>([]), feedback = ref('');
if (props.preview) {
  if (props.kind === 'ai-conversation') session.chat.state.messages.push(
    { id: 'preview-user', role: 'user', createdAt: Date.now(), status: 'complete', attachments: [], parts: [{ id: 'preview-prompt', type: 'message', text: 'Help me plan a small illustrated weather journal.' }] },
    { id: 'preview-assistant', role: 'assistant', createdAt: Date.now(), finishedAt: Date.now(), status: 'complete', attachments: [], parts: [{ id: 'preview-answer', type: 'message', text: 'Start with one page for today: a weather icon, a short observation, and a color you associate with the day. Add a new page tomorrow.' }] },
  );
  if (props.kind === 'ai-history') { history.create('Weather journal ideas'); history.create('Explore a forest palette'); history.create('Plan an icon set'); }
}
const style = computed(() => ({ '--frame-chat-composer-padding': density.value === 'compact' ? '5px' : '8px', '--frame-ai-chat-font-size': density.value === 'compact' ? '12px' : '13px', '--frame-ai-history-prompt-padding': density.value === 'compact' ? '6px' : '12px' }));
let unregister: (() => void) | undefined;
const sidebar = computed(() => !props.preview && (props.kind === 'ai-chat' || props.kind === 'ai-view'));
function createView() {
  if (!unregister) {
    frame.secondarySidebar.enable();
    const definition = createAIChatView({ id, label: 'AI demo', history });
    definition.props = { ...definition.props, get style() { return style.value; }, get placeholder() { return placeholder.value; }, get userAlignment() { return reversed.value ? 'left' : 'right'; } };
    unregister = frame.secondarySidebar.register(definition); registered.value = true;
  }
  frame.secondarySidebar.open(id);
}
function removeView() { if (!unregister) return; unregister(); unregister = undefined; registered.value = false; if (!frame.secondarySidebar.views.value.length) frame.secondarySidebar.close(); }
function seed() { const item = history.create('Another application', 'other-app'); item.chat.state.draft = 'Give me a quick idea for another project'; void item.chat.send(); }
function submit(value: { text: string; attachments: ChatAttachment[] }) { feedback.value = `Submitted: ${value.text} · ${value.attachments.length} attachments`; draft.value = ''; attachments.value = []; }
if (sidebar.value) createView();
onBeforeUnmount(() => { removeView(); history.dispose(); sessions.forEach(item => item.dispose()); });
</script>
<template>
  <section class="docs-ai-feature-demo" :aria-label="`${kind} interactive demo`">
    <div v-if="!preview" class="docs-ai-controls">
      <FrameSelect v-model="density" label="Preview density" :options="[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]" />
      <FrameTextField v-model="placeholder" aria-label="Composer placeholder" placeholder="Composer placeholder" />
      <template v-if="kind === 'ai-prompt'"><FrameCheckbox v-model="disabled" label="Disable prompt" /><FrameCheckbox v-model="busy" label="Working state" /></template>
      <FrameCheckbox v-if="kind === 'ai-conversation' || sidebar" v-model="reversed" label="Left-align user messages" />
      <label v-if="!sidebar">Preview width · {{ width }}px<FrameSlider :model-value="width" :min="300" :max="1100" :step="10" aria-label="Preview width" @update:model-value="width = Number($event)" /></label>
    </div>
    <template v-if="sidebar">
      <p>The complete chat lives in this application's secondary sidebar. Use its history prompt to start a conversation. Removing the view closes the sidebar when it is empty.</p>
      <div class="showcase-row"><FrameButton @click="createView">{{ registered ? 'Open AI view' : 'Create AI view' }}</FrameButton><FrameButton :disabled="!registered" @click="removeView">Remove AI view</FrameButton></div>
    </template>
    <template v-else>
      <div v-if="kind === 'ai-history' || kind === 'ai-chat'" class="showcase-row"><FrameSelect v-model="scope" label="Conversation scope" :options="[{ value: 'application', label: 'This application' }, { value: 'all', label: 'All applications' }]" @update:model-value="history.setScope($event as 'application' | 'all')" /><FrameButton @click="seed">Add another application's conversation</FrameButton></div>
      <div class="docs-ai-feature-room" :class="{ 'prompt-only': kind === 'ai-prompt' }" :style="{ ...style, maxWidth: `${width}px` }">
        <AIPrompt v-if="kind === 'ai-prompt'" v-model="draft" v-model:attachments="attachments" :placeholder="placeholder" :busy="busy" :disabled="disabled" @submit="submit" @stop="busy = false; feedback = 'Stop requested'" />
        <AIConversation v-else-if="kind === 'ai-conversation'" :chat="session.chat" :placeholder="placeholder" :user-alignment="reversed ? 'left' : 'right'" />
        <AIHistory v-else-if="kind === 'ai-history'" :history="history" :placeholder="placeholder" @select="feedback = 'Selected conversation'" @create="feedback = 'Created conversation'" />
        <AIChat v-else :history="history" />
      </div>
      <output v-if="feedback" role="status">{{ feedback }}</output>
      <AIChatPlayground v-if="kind === 'ai-conversation' && !preview" :session="session" />
    </template>
  </section>
</template>
<style scoped>
.docs-ai-feature-demo { width:100%; min-width:0; box-sizing:border-box; }
.docs-ai-controls { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-block:12px; }
.docs-ai-controls > label { display:flex; flex-direction:column; gap:6px; min-width:180px; }
.docs-ai-feature-room { width:100%; min-width:min(100%,320px); height:560px; min-height:320px; max-height:75dvh; border:1px solid var(--frame-line); border-radius:var(--frame-input-radius,4px); overflow:hidden; margin-block:16px; box-sizing:border-box; }
.docs-ai-feature-room.prompt-only { height:auto; min-height:0; border:0; overflow:visible; }
output { display:block; margin-block:8px; color:var(--frame-muted); }
</style>
