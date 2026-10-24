import type { ChatArtifactOptions, ChatQuestion } from "./chatTypes";

export type AgentProvider = "codex" | "claude" | "gemini" | "copilot" | "opencode";
export interface AgentCapabilities { resume: boolean; listSessions: boolean; approvals: boolean; questions: boolean; tools: boolean; artifacts: boolean }
export interface AgentSession { sessionId: string; providerSessionId: string; provider: AgentProvider; capabilities: AgentCapabilities }
export interface AgentSessionOptions { provider: AgentProvider; applicationId: string; cwd: string; model?: string; systemPrompt?: string; resumeId?: string }
export type AgentEvent =
  | { type: "message"; id: string; text: string; phase: "intermediate" | "final"; delta: boolean }
  | { type: "thinking"; id: string; text: string; delta: boolean; finished: boolean }
  | { type: "activity"; id: string; label: string; text: string; output: string; status: string }
  | { type: "approval"; requestId: string; text: string; detail?: string | null }
  | { type: "questions"; requestId: string; text: string; questions: ChatQuestion[] }
  | { type: "artifact"; id: string; name: string; url?: string | null; path?: string | null; mimeType?: string | null }
  | { type: "status"; message: string }
  | { type: "metadata"; name: string; data: unknown }
  | { type: "completed"; status: string; error?: string | null };
export type AgentEventEnvelope = AgentEvent & { sessionId: string; turnId: string };
export interface AgentConnection {
  request<T>(method: string, params: unknown): Promise<T>;
  subscribe(listener: (event: AgentEventEnvelope) => void): () => void;
}
export interface AgentChatOptions extends AgentSessionOptions {
  /** Only a host resolver may authorize and expose native paths. Returned URLs remain host-owned. */
  resolveArtifact?: (event: Extract<AgentEventEnvelope, { type: "artifact" }>) => Promise<ChatArtifactOptions | undefined>;
  onMetadata?: (event: AgentEventEnvelope) => void;
}
export interface AgentLineTransport { write(line: string): Promise<void> | void; subscribe(listener: (chunk: string) => void): () => void }
export interface AgentLineConnectionOptions { timeoutMs?: number; turnTimeoutMs?: number; maxBufferLength?: number }

