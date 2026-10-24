<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FrameIcon, FrameIconButton, FrameDropdownMenu, FrameTextArea, type FrameMenuItem } from "@frame/core";
import type { AIChatController, ChatAttachment, ChatMessage } from "./aiChat";
import { groupChatParts } from "./chatParts";
import ChatTurn from "./ChatTurn.vue";

const props = withDefaults(defineProps<{
  chat: AIChatController;
  label?: string;
  placeholder?: string;
  userAlignment?: "left" | "right";
  assistantAlignment?: "left" | "right";
  attachmentActions?: readonly FrameMenuItem[];
  speechEnabled?: boolean;
}>(), { label: "AI chat", placeholder: "Write a message…", userAlignment: "right", assistantAlignment: "left", attachmentActions: () => [], speechEnabled: false });
const emit = defineEmits<{ forge: [messages: ChatMessage[], source: ChatMessage]; attachmentAction: [item: FrameMenuItem]; speech: []; copy: [message: ChatMessage] }>();
const composerInput = ref<{ element?: HTMLTextAreaElement; focus: () => void }>();
const input = computed(() => composerInput.value?.element);
const transcript = ref<HTMLElement>();
const files = ref<HTMLInputElement>(), folders = ref<HTMLInputElement>();
const menuOpen = ref(false), nearBottom = ref(true), now = ref(Date.now()), announcement = ref("");
let timer: ReturnType<typeof setInterval> | undefined;
const state = computed(() => props.chat.state);
const canSend = computed(() => !!state.value.draft.trim() && !state.value.busy);
const menuItems = computed<readonly FrameMenuItem[]>(() => [
  { id: "chat-files", label: "Files…" }, { id: "chat-folders", label: "Folder…" },
  ...(props.attachmentActions.length ? [{ id: "chat-separator", type: "separator" as const }, ...props.attachmentActions] : []),
]);
const rewindIndex = computed(() => state.value.messages.findIndex(item => item.id === state.value.rewindId));
const originalPrompt = computed(() => state.value.messages[rewindIndex.value]?.parts.filter(part => part.type === "message").map(part => part.text).join("\n\n") ?? "");
const messageElements = new Map<string, HTMLElement>();
function jumpToRewind() {
  const element = messageElements.get(state.value.rewindId ?? "");
  const container = transcript.value;
  if (!element || !container) return;
  nearBottom.value = false;
  container.scrollTo({ top: container.scrollTop + element.getBoundingClientRect().top - container.getBoundingClientRect().top - 12 });
}
function timestamp(value: number) { return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function measure() { if (input.value) { input.value.style.height = "auto"; input.value.style.height = `${Math.min(input.value.scrollHeight, 180)}px`; } }
function scroll() { const el = transcript.value; if (el) el.scrollTop = el.scrollHeight; }
function trackScroll() { const el = transcript.value; if (el) nearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 70; }
async function send() { if (!canSend.value) return; nearBottom.value = true; const task = props.chat.send(); await nextTick(); measure(); scroll(); input.value?.focus(); await task; }
function key(event: KeyboardEvent) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); void send(); } if (event.key === "Escape" && state.value.rewindId) { event.preventDefault(); props.chat.cancelRewind(); } }
async function rewind(id: string) { props.chat.rewind(id); await nextTick(); input.value?.focus(); measure(); }
function selectAttachment(item: FrameMenuItem) { if (item.id === "chat-files") files.value?.click(); else if (item.id === "chat-folders") folders.value?.click(); else emit("attachmentAction", item); }
function attach(event: Event, kind: "file" | "folder") {
  const target = event.target as HTMLInputElement;
  const selected = Array.from(target.files ?? []);
  if (kind === "folder" && selected.length) {
    state.value.attachments.push({ id: crypto.randomUUID(), name: selected[0]!.webkitRelativePath.split("/")[0] || "Folder", kind, files: selected });
  } else for (const file of selected) state.value.attachments.push({ id: crypto.randomUUID(), name: file.name, kind, files: [file] });
  target.value = ""; input.value?.focus();
}
async function copy(message: ChatMessage) {
  try { await navigator.clipboard.writeText(message.parts.filter(part => part.type === "message" && part.phase !== "intermediate").map(part => part.text).join("\n\n")); announcement.value = "Message copied."; emit("copy", message); }
  catch { announcement.value = "Unable to copy. Select the message text to copy it manually."; }
}
function removeAttachment(item: ChatAttachment) { state.value.attachments = state.value.attachments.filter(value => value.id !== item.id); }
watch(() => state.value.draft, () => nextTick(measure));
watch(() => state.value.busy, (busy, wasBusy) => {
  if (timer) clearInterval(timer);
  timer = undefined; now.value = Date.now();
  if (busy) {
    announcement.value = "Agent is working.";
    timer = setInterval(() => { now.value = Date.now(); }, 250);
  } else if (wasBusy) {
    const last = state.value.messages[state.value.messages.length - 1];
    announcement.value = last?.status === "error" ? "Agent response failed." : last?.status === "stopped" ? "Agent response stopped." : "Agent response completed.";
  }
}, { immediate: true });
watch(() => JSON.stringify(state.value.messages.map(message => [message.status, message.parts])), () => nextTick(() => { if (nearBottom.value && !transcript.value?.contains(document.activeElement)) scroll(); }));
watch(() => state.value.messages.flatMap(message => message.parts.filter(part => part.type === 'approval' || part.type === 'question').map(part => `${part.id}:${part.status}`)).join('|'), () => {
  const pending = state.value.messages.flatMap(message => message.parts).filter(part => (part.type === 'approval' || part.type === 'question') && part.status === 'pending').length;
  if (pending) announcement.value = `${pending} request${pending === 1 ? '' : 's'} waiting for your response.`;
  else if (state.value.busy) announcement.value = 'All requests resolved. Agent is working.';
});
onMounted(measure);
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <section class="frame-ai-chat" :aria-label="label">
    <div ref="transcript" class="frame-chat-transcript" role="log" aria-label="Conversation" aria-live="off" @scroll="trackScroll">
      <slot v-if="!state.messages.length" name="empty"><p class="frame-chat-empty">Start a conversation.</p></slot>
      <article v-for="(message, index) in state.messages" :key="message.id" :ref="element => { if (element) messageElements.set(message.id, element as HTMLElement); else messageElements.delete(message.id); }" class="frame-chat-message" :class="[message.role, (message.role === 'user' ? userAlignment : assistantAlignment), { editing: message.id === state.rewindId, 'after-rewind': rewindIndex >= 0 && index > rewindIndex }]" :aria-label="`${message.role === 'user' ? 'You' : 'Assistant'}, ${timestamp(message.createdAt)}`">
        <span v-if="message.id === state.rewindId" class="frame-chat-edit-label">Editing this message</span>
        <ChatTurn v-if="message.role === 'assistant'" :message="message" :chat="chat" :now="now"/>
        <div v-for="part in message.role === 'user' ? groupChatParts(message.parts) : []" :key="part.id" class="frame-chat-text">{{ part.text }}</div>
        <div v-if="message.attachments.length" class="frame-chat-attachments"><span v-for="item in message.attachments" :key="item.id" class="frame-chat-chip">{{ item.name }}</span></div>
        <p v-if="message.error" class="frame-chat-error" role="alert">{{ message.error }}</p>
        <footer class="frame-chat-message-footer">
          <div class="frame-chat-message-actions">
            <template v-if="message.role === 'assistant'"><FrameIconButton label="Copy message" icon="copy" @click="copy(message)"/><FrameIconButton label="Forge conversation from here" icon="repo-forked" :disabled="state.busy" @click="emit('forge', chat.fork(message.id), message)"/></template>
            <FrameIconButton v-else :label="message.id === state.rewindId ? 'Cancel rewind' : 'Rewind to this message'" icon="history" :aria-pressed="message.id === state.rewindId" :disabled="state.busy" @click="rewind(message.id)"/>
            <slot name="message-actions" :message="message"/>
          </div>
          <span class="frame-chat-message-meta"><time :datetime="new Date(message.createdAt).toISOString()" :title="new Date(message.createdAt).toLocaleString()">{{ timestamp(message.createdAt) }}</time></span>
        </footer>
      </article>
    </div>
    <form class="frame-chat-composer" :class="{ populated: state.draft.length > 0, busy: state.busy, rewinding: state.rewindId }" @submit.prevent="send">
      <button v-if="!nearBottom" type="button" class="frame-chat-latest" aria-label="Jump to latest" title="Jump to latest" @click="nearBottom = true; scroll()"><FrameIcon name="arrow-down" :size="16" /></button>
      <div v-if="state.rewindId" class="frame-chat-rewind-notice"><button type="button" class="frame-chat-original-prompt" :title="originalPrompt" aria-label="Jump to original prompt" @click="jumpToRewind">{{ originalPrompt }}</button><FrameIconButton label="Cancel rewind" icon="close" @click="chat.cancelRewind()"/></div>
      <div v-if="state.attachments.length" class="frame-chat-attachments"><span v-for="item in state.attachments" :key="item.id" class="frame-chat-chip">{{ item.name }}<FrameIconButton :label="`Remove ${item.name}`" icon="close" :size="20" @click="removeAttachment(item)"/></span></div>
      <FrameTextArea ref="composerInput" v-model="state.draft" :rows="2" :placeholder="placeholder" aria-label="Message" @keydown="key"/>
      <div class="frame-chat-composer-actions">
        <FrameDropdownMenu v-model:open="menuOpen" :items="menuItems" label="Add context" @select="selectAttachment">
          <template #trigger><FrameIconButton label="Add attachment" icon="add" :tooltip="false"/></template>
        </FrameDropdownMenu>
        <slot name="composer-actions"/>
        <span class="frame-chat-spacer"/>
        <FrameIconButton :label="speechEnabled ? 'Voice input' : 'Voice input is not configured'" icon="mic" :disabled="!speechEnabled || state.busy" @click="emit('speech')"/>
        <FrameIconButton v-if="state.busy" label="Stop response" icon="debug-stop" @click="chat.stop()"/>
        <FrameIconButton v-else class="frame-chat-send" label="Send message" icon="arrow-up" :disabled="!canSend" @click="send"/>
      </div>
    </form>
    <input ref="files" class="frame-chat-file-input" type="file" multiple tabindex="-1" aria-label="Select files" @change="attach($event, 'file')"/>
    <input ref="folders" class="frame-chat-file-input" type="file" webkitdirectory multiple tabindex="-1" aria-label="Select folder" @change="attach($event, 'folder')"/>
    <span class="sr-only" role="status">{{ announcement }}</span>
  </section>
</template>
