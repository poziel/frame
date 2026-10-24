import { reactive } from "vue";
import { copyChatMessages, type ChatAttachment, type ChatOptions, type ChatPart, type ChatResponseWriter, type ChatApprovalDecision, type ChatQuestionAnswer, type ChatApprovalPart, type ChatQuestionPart } from "./chatTypes";
import { createChatInteractions, validateQuestions } from "./chatInteractions";
export type * from "./chatTypes";

export function createAIChat(options: ChatOptions) {
  const state = reactive({ messages: copyChatMessages(options.messages ?? []), draft: "", attachments: [] as ChatAttachment[], busy: false, rewindId: undefined as string | undefined });
  const id = () => `chat-${crypto.randomUUID()}`;
  let active: { controller: AbortController; interactions: ReturnType<typeof createChatInteractions>; finish: (status: "complete" | "stopped" | "error", error?: string) => void } | undefined;
  let disposed = false;
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
    active?.finish("stopped");
  }
  async function send() {
    const prompt = state.draft.trim();
    if (!prompt || state.busy || disposed) return false;
    if (state.rewindId) {
      const index = state.messages.findIndex(item => item.id === state.rewindId);
      if (index < 0) return false;
      state.messages.splice(index);
      state.rewindId = undefined; savedDraft = undefined;
    }
    const attachments = state.attachments.slice();
    state.messages.push({ id: id(), role: "user", createdAt: Date.now(), parts: [{ id: id(), type: "message", text: prompt }], attachments, status: "complete" });
    const history = copyChatMessages(state.messages);
    const responseId = id();
    state.messages.push({ id: responseId, role: "assistant", createdAt: Date.now(), parts: [], attachments: [], status: "pending" });
    const response = state.messages.find(item => item.id === responseId)!;
    state.draft = ""; state.attachments = []; state.busy = true;
    const controller = new AbortController();
    let settle!: () => void;
    const done = new Promise<void>(resolve => { settle = resolve; });
    let returned = false;
    const interactions = createChatInteractions(() => { if (returned) writer.complete(); });
    const writable = () => active?.controller === controller && !controller.signal.aborted && response.status === "pending";
    function finish(status: "complete" | "stopped" | "error", error?: string) {
      if (!writable()) return;
      response.status = status; response.finishedAt = Date.now();
      if (error !== undefined) response.error = error;
      active = undefined; state.busy = false;
      interactions.cancelAll();
      for (const part of response.parts) {
        if (part.type === "thinking" && part.finishedAt === undefined) part.finishedAt = response.finishedAt;
        if (part.type === "activity" && part.status === "running") {
          part.status = status === "complete" ? "completed" : status === "error" ? "failed" : "cancelled";
          part.finishedAt = response.finishedAt;
        }
      }
      if (status !== "complete") controller.abort();
      settle();
    }
    active = { controller, interactions, finish };
    function add(part: ChatPart) {
      if (writable()) {
        for (const current of response.parts) if (current.type === "thinking" && current.finishedAt === undefined) current.finishedAt = Date.now();
        if (writable()) response.parts.push(part);
      }
      return part.id;
    }
    const writer: ChatResponseWriter = {
      thinking(text = "") { return add({ id: id(), type: "thinking", text, startedAt: Date.now() }); },
      updateThinking(partId, text) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "thinking" && part.finishedAt === undefined) part.text = text; },
      finishThinking(partId) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "thinking" && part.finishedAt === undefined) part.finishedAt = Date.now(); },
      message(text, options = {}) { return add({ id: id(), type: "message", text, phase: options.phase ?? "final" }); },
      append(partId, text) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "message") part.text += text; },
      updateMessage(partId, text, options = {}) { if (!writable()) return; const part = response.parts.find(item => item.id === partId); if (part?.type === "message") { part.text = text; if (options.phase) part.phase = options.phase; } },
      commentary(text) { return add({ id: id(), type: "commentary", text }); },
      activityGroup(options) {
        const partId = id();
        if (!writable()) return partId;
        if (!options.label.trim()) throw new Error("Give the activity group a name.");
        return add({ id: partId, type: "activityGroup", label: options.label.trim(), text: "" });
      },
      activity(options) {
        const partId = id();
        if (!writable()) return partId;
        if (options.groupId !== undefined && !response.parts.some(part => part.type === "activityGroup" && part.id === options.groupId)) throw new Error("Choose a group from the current turn.");
        return add({ id: partId, type: "activity", label: options.label, text: options.text ?? "", output: options.output ?? "", outputLanguage: options.outputLanguage, groupId: options.groupId, status: "running", startedAt: Date.now() });
      },
      updateActivity(partId, update) {
        if (!writable()) return;
        const part = response.parts.find(item => item.id === partId);
        if (part?.type !== "activity" || part.status !== "running") return;
        if (update.label !== undefined) part.label = update.label;
        if (update.text !== undefined) part.text = update.text;
        if (update.output !== undefined) part.output = update.output;
        if (update.outputLanguage !== undefined) part.outputLanguage = update.outputLanguage;
      },
      finishActivity(partId, status = "completed") {
        if (!writable()) return;
        const part = response.parts.find(item => item.id === partId);
        if (part?.type === "activity" && part.status === "running") { part.status = status; part.finishedAt = Date.now(); }
      },
      requestApproval(options) {
        const partId = id();
        if (!writable()) return { id: partId, result: Promise.resolve({ status: "cancelled" as const }) };
        if (!options.text.trim()) throw new Error("Approval needs a proposed action.");
        const part = reactive<ChatApprovalPart>({ ...options, id: partId, type: "approval", status: "pending" });
        const handle = interactions.approval(part);
        add(part);
        return handle;
      },
      askQuestions(options) {
        const partId = id();
        if (!writable()) return { id: partId, result: Promise.resolve({ status: "cancelled" as const }) };
        validateQuestions(options.questions);
        const part = reactive<ChatQuestionPart>({ id: partId, type: "question", text: options.text ?? "Questions", status: "pending",
          questions: options.questions.map(question => ({ ...question, choices: question.choices.map(choice => ({ ...choice })) })) });
        const handle = interactions.questions(part);
        add(part);
        return handle;
      },
      artifact(options) { return add({ ...options, id: id(), type: "artifact", text: options.text ?? "" }); },
      complete() { if (!writable() || interactions.size) return false; finish("complete"); return true; },
      fail(message) { finish("error", message); },
    };
    try {
      const result = options.respond({ messages: history, prompt, attachments, signal: controller.signal }, writer);
      void Promise.resolve(result).then(() => { returned = true; writer.complete(); }, error => writer.fail(error instanceof Error ? error.message : "Unable to generate a response."));
    } catch (error) {
      writer.fail(error instanceof Error ? error.message : "Unable to generate a response.");
    }
    await done;
    return true;
  }
  function fork(messageId: string) {
    const index = state.messages.findIndex(message => message.id === messageId && message.role === "assistant" && message.status !== "pending");
    return index < 0 ? [] : copyChatMessages(state.messages.slice(0, index + 1));
  }
  function clear() { stop(); state.messages = []; state.draft = ""; state.attachments = []; state.rewindId = undefined; savedDraft = undefined; }
  return { state, send, stop, rewind, cancelRewind, fork, clear,
    resolveApproval: (id: string, decision: ChatApprovalDecision) => active?.interactions.resolveApproval(id, decision) ?? false,
    answerQuestions: (id: string, answers: ChatQuestionAnswer[]) => active?.interactions.answerQuestions(id, answers) ?? false,
    cancelInteraction: (id: string) => active?.interactions.cancel(id) ?? false,
    dispose() { disposed = true; stop(); },
  };
}
export type AIChatController = ReturnType<typeof createAIChat>;
