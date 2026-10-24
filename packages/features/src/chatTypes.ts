export interface ChatAttachment {
  id: string;
  name: string;
  kind: "file" | "folder" | "context";
  files?: File[];
}
export interface ChatTextPart {
  id: string;
  type: "message";
  text: string;
  /** Omitted means final answer for compatibility with existing responders. */
  phase?: "intermediate" | "final";
}
export interface ChatThinkingPart {
  id: string;
  type: "thinking";
  text: string;
  startedAt: number;
  finishedAt?: number;
}
export interface ChatCommentaryPart {
  id: string;
  type: "commentary";
  text: string;
}
export interface ChatActivityOptions {
  label: string;
  text?: string;
  output?: string;
  outputLanguage?: string;
  /** Optional group created by this turn's writer.activityGroup(). Omit for automatic grouping. */
  groupId?: string;
}
export interface ChatActivityGroupPart {
  id: string;
  type: "activityGroup";
  label: string;
  text: string;
}
export interface ChatActivityPart {
  id: string;
  type: "activity";
  text: string;
  label: string;
  output: string;
  outputLanguage?: string;
  groupId?: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startedAt: number;
  finishedAt?: number;
}
export interface ChatApprovalOptions {
  text: string;
  detail?: string;
}
export type ChatApprovalDecision = "allow" | "deny";
export interface ChatCancelledResult {
  status: "cancelled";
}
export type ChatApprovalResult =
  { status: "answered"; decision: ChatApprovalDecision } | ChatCancelledResult;
export interface ChatApprovalPart extends ChatApprovalOptions {
  id: string;
  type: "approval";
  status: "pending" | "answered" | "cancelled";
  decision?: ChatApprovalDecision;
}
export interface ChatChoice {
  id: string;
  label: string;
  description?: string;
}
export interface ChatQuestion {
  id: string;
  text: string;
  choices: ChatChoice[];
  /** Defaults to single selection, required, and no custom answer. */
  multiple?: boolean;
  required?: boolean;
  allowCustom?: boolean;
}
export interface ChatQuestionAnswer {
  questionId: string;
  choiceIds: string[];
  customText?: string;
}
export interface ChatQuestionsOptions {
  text?: string;
  questions: ChatQuestion[];
}
export type ChatQuestionsResult =
  { status: "answered"; answers: ChatQuestionAnswer[] } | ChatCancelledResult;
export interface ChatQuestionPart {
  id: string;
  type: "question";
  text: string;
  questions: ChatQuestion[];
  status: "pending" | "answered" | "cancelled";
  answers?: ChatQuestionAnswer[];
}
export interface ChatInteractionHandle<T> {
  id: string;
  result: Promise<T>;
}
/** The host owns the URL and must keep it valid for all presentations/snapshots using it. */
export interface ChatArtifactOptions {
  name: string;
  url: string;
  kind: "image" | "file";
  mimeType?: string;
  text?: string;
  size?: number;
}
export interface ChatArtifactPart extends ChatArtifactOptions {
  id: string;
  type: "artifact";
  text: string;
}
export type ChatPart =
  | ChatTextPart
  | ChatThinkingPart
  | ChatCommentaryPart
  | ChatActivityPart
  | ChatActivityGroupPart
  | ChatApprovalPart
  | ChatQuestionPart
  | ChatArtifactPart;
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
export interface ChatRequest {
  messages: ChatMessage[];
  prompt: string;
  attachments: ChatAttachment[];
  signal: AbortSignal;
}
/** Parts are appended in call order. Writes after completion or cancellation are ignored. */
export interface ChatResponseWriter {
  /** Starts the single current thought, superseding the previous one. New non-thinking events clear it. */
  thinking(text?: string): string;
  updateThinking(id: string, text: string): void;
  finishThinking(id: string): void;
  message(text: string, options?: { phase?: "intermediate" | "final" }): string;
  /** Apply an authoritative provider snapshot, including promotion to the final answer. */
  updateMessage(
    id: string,
    text: string,
    options?: { phase?: "intermediate" | "final" },
  ): void;
  append(id: string, text: string): void;
  commentary(text: string): string;
  activityGroup(options: { label: string }): string;
  activity(options: ChatActivityOptions): string;
  updateActivity(
    id: string,
    update: Partial<Omit<ChatActivityOptions, "groupId">>,
  ): void;
  finishActivity(id: string, status?: "completed" | "failed"): void;
  requestApproval(
    options: ChatApprovalOptions,
  ): ChatInteractionHandle<ChatApprovalResult>;
  askQuestions(
    options: ChatQuestionsOptions,
  ): ChatInteractionHandle<ChatQuestionsResult>;
  artifact(options: ChatArtifactOptions): string;
  /** Returns false while interactions are pending, or when this writer is no longer active. */
  complete(): boolean;
  fail(message: string): void;
}
export type ChatResponder = (
  request: ChatRequest,
  response: ChatResponseWriter,
) => void | Promise<void>;
export interface ChatOptions {
  respond: ChatResponder;
  messages?: ChatMessage[];
}

export function copyChatPart(part: ChatPart): ChatPart {
  if (part.type !== "question") return { ...part };
  return {
    ...part,
    questions: part.questions.map((question) => ({
      ...question,
      choices: question.choices.map((choice) => ({ ...choice })),
    })),
    answers: part.answers?.map((answer) => ({
      ...answer,
      choiceIds: [...answer.choiceIds],
    })),
  };
}
export function copyChatMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map(copyChatPart),
    attachments: message.attachments.map((item) => ({
      ...item,
      files: item.files?.slice(),
    })),
  }));
}
