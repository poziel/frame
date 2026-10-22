import { reactive } from "vue";

export interface ChatAttachment { id: string; name: string; kind: "file" | "folder" | "context"; files?: File[]; }
export interface ChatTextPart { id: string; type: "message"; text: string; }
export interface ChatThinkingPart { id: string; type: "thinking"; text: string; startedAt: number; finishedAt?: number; }
export type ChatPart = ChatTextPart | ChatThinkingPart;
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  createdAt: number;
  parts: ChatPart[];
  attachments: ChatAttachment[];
  status: "pending" | "complete" | "stopped" | "error";
  finishedAt?: number;
  error?: string;
}
export interface ChatRequest { messages: ChatMessage[]; prompt: string; attachments: ChatAttachment[]; signal: AbortSignal; }
/** Parts are appended in call order. Keep the writer until the complete generation ends. */
export interface ChatResponseWriter {
  thinking(text?: string): string;
  updateThinking(id: string, text: string): void;
  finishThinking(id: string): void;
  message(text: string): string;
  append(id: string, text: string): void;
  complete(): void;
}
export type ChatResponder = (request: ChatRequest, response: ChatResponseWriter) => void | Promise<void>;
export interface ChatOptions { respond: ChatResponder; messages?: ChatMessage[]; }

function copyMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(message => ({ ...message, parts: message.parts.map(part => ({ ...part })), attachments: message.attachments.map(item => ({ ...item, files: item.files?.slice() })) }));
}

export function createAIChat(options: ChatOptions) {
  const state = reactive({ messages: copyMessages(options.messages ?? []), draft: "", attachments: [] as ChatAttachment[], busy: false, rewindId: undefined as string | undefined });
  const id = () => `chat-${crypto.randomUUID()}`;
  let active: AbortController | undefined;
  let savedDraft: { text: string; attachments: ChatAttachment[] } | undefined;
  function cancelRewind() {
    if (!state.rewindId) return;
    state.draft = savedDraft?.text ?? "";
    state.attachments = savedDraft?.attachments ?? [];
    state.rewindId = undefined;
    savedDraft = undefined;
  }
  function rewind(messageId: string) {
    if (state.busy) return;
    if (state.rewindId === messageId) { cancelRewind(); return; }
    const message = state.messages.find(item => item.id === messageId && item.role === "user");
    if (!message) return;
    if (!state.rewindId) savedDraft = { text: state.draft, attachments: state.attachments.slice() };
    state.rewindId = messageId;
    state.draft = message.parts.filter(part => part.type === "message").map(part => part.text).join("\n\n");
    state.attachments = message.attachments.map(item => ({ ...item }));
  }
  function stop() {
    active?.abort();
    active = undefined;
    const message = state.messages.find(item => item.status === "pending");
    if (message) {
      message.status = "stopped"; message.finishedAt = Date.now();
      for (const part of message.parts) if (part.type === "thinking" && !part.finishedAt) part.finishedAt = message.finishedAt;
    }
    state.busy = false;
  }
  async function send() {
    const prompt = state.draft.trim();
    if (!prompt || state.busy) return false;
    if (state.rewindId) {
      const index = state.messages.findIndex(item => item.id === state.rewindId);
      if (index < 0) return false;
      state.messages.splice(index);
      state.rewindId = undefined; savedDraft = undefined;
    }
    const attachments = state.attachments.slice();
    state.messages.push({ id: id(), role: "user", createdAt: Date.now(), parts: [{ id: id(), type: "message", text: prompt }], attachments, status: "complete" });
    const history = copyMessages(state.messages);
    const responseId = id();
    state.messages.push({ id: responseId, role: "assistant", createdAt: Date.now(), parts: [], attachments: [], status: "pending" });
    const response = state.messages.find(item => item.id === responseId)!;
    state.draft = ""; state.attachments = []; state.busy = true;
    const controller = new AbortController(); active = controller;
    const writable = () => active === controller && !controller.signal.aborted && response.status === "pending";
    const writer: ChatResponseWriter = {
      thinking(text = "") { const partId = id(); if (writable()) response.parts.push({ id: partId, type: "thinking", text, startedAt: Date.now() }); return partId; },
      updateThinking(partId, text) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "thinking" && !part.finishedAt) part.text = text; },
      finishThinking(partId) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "thinking" && !part.finishedAt) part.finishedAt = Date.now(); },
      message(text) { const partId = id(); if (writable()) response.parts.push({ id: partId, type: "message", text }); return partId; },
      append(partId, text) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "message") part.text += text; },
      complete() {
        if (!writable()) return;
        response.finishedAt = Date.now(); response.status = "complete";
        for (const part of response.parts) if (part.type === "thinking" && !part.finishedAt) part.finishedAt = response.finishedAt;
        state.busy = false; active = undefined;
      },
    };
    try {
      await options.respond({ messages: history, prompt, attachments, signal: controller.signal }, writer);
      writer.complete();
    } catch (error) {
      if (writable()) {
        writer.complete(); response.status = "error";
        response.error = error instanceof Error ? error.message : "Unable to generate a response.";
      }
    }
    return true;
  }
  function fork(messageId: string) {
    const index = state.messages.findIndex(message => message.id === messageId && message.role === "assistant" && message.status !== "pending");
    return index < 0 ? [] : copyMessages(state.messages.slice(0, index + 1));
  }
  return { state, send, stop, rewind, cancelRewind, fork, dispose: stop };
}
export type AIChatController = ReturnType<typeof createAIChat>;
