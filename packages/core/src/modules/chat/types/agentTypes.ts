import type {
  ChatArtifactOptions,
  ChatQuestion,
  ChatAttachment,
} from './chatTypes';

/** Supported provider identifiers forwarded to the host agent integration. */
export type AgentProvider =
  'codex' | 'claude' | 'gemini' | 'copilot' | 'opencode';

/** Capabilities advertised by the host for a provider session. */
export interface AgentCapabilities {

  /** Whether the host supports resuming provider-owned sessions. */
  resume: boolean;

  /** Whether the host can enumerate provider sessions. */
  listSessions: boolean;

  /** Whether the provider integration supports approval requests. */
  approvals: boolean;

  /** Whether the provider integration supports user question requests. */
  questions: boolean;

  /** Whether the provider integration reports tool activity. */
  tools: boolean;

  /** Whether the provider integration reports artifact references. */
  artifacts: boolean;
}

/** Host session identity, provider identity, and negotiated capabilities. */
export interface AgentSession {

  /** Host session identity used to route requests and events. */
  sessionId: string;

  /** Provider-owned identity retained for native session continuation. */
  providerSessionId: string;

  /** Provider selected for the host agent session. */
  provider: AgentProvider;

  /** Capability flags reported for this session by the host. */
  capabilities: AgentCapabilities;
}

/** Explicit host parameters for creating or resuming an agent session. */
export interface AgentSessionOptions {

  /** Provider selected for the host agent session. */
  provider: AgentProvider;

  /** Host application scope forwarded when creating the session. */
  applicationId: string;

  /** Working directory interpreted by the host provider integration. */
  cwd: string;

  /** Optional provider model selection forwarded to the host. */
  model?: string;

  /** Optional system instructions forwarded when creating the session. */
  systemPrompt?: string;

  /** Optional provider session identity to resume instead of starting fresh. */
  resumeId?: string;
}

/**
 * Normalized provider event variants routed by their type discriminator.
 * Message and thinking deltas are distinguished from authoritative snapshots;
 * provider status strings remain unmodified for the adapter to interpret.
 */
export type AgentEvent =
  | {
      /** Identifies message content for discriminated event or part routing. */
      type: 'message';
      /**
       * Stable identity used to address this entry within its owning message or
       * schema.
       */
      id: string;
      /** Text content displayed by the owning response presentation. */
      text: string;
      /**
       * Intermediate progress or final-answer phase used by response
       * presentation.
       */
      phase: 'intermediate' | 'final';
      /** True for appended text; false for an authoritative text snapshot. */
      delta: boolean;
    }
  | {
      /**
       * Identifies thinking content for discriminated event or part routing.
       */
      type: 'thinking';
      /**
       * Stable identity used to address this entry within its owning message or
       * schema.
       */
      id: string;
      /** Text content displayed by the owning response presentation. */
      text: string;
      /** True for appended text; false for an authoritative text snapshot. */
      delta: boolean;
      /** Whether this thinking event finishes the current thought. */
      finished: boolean;
    }
  | {
      /**
       * Identifies activity content for discriminated event or part routing.
       */
      type: 'activity';
      /**
       * Stable identity used to address this entry within its owning message or
       * schema.
       */
      id: string;
      /** Human-readable label shown by the owning presentation. */
      label: string;
      /** Text content displayed by the owning response presentation. */
      text: string;
      /**
       * Reported activity output, retained independently of the activity
       * description.
       */
      output: string;
      /** Provider lifecycle status interpreted by the agent event adapter. */
      status: string;
    }
  | {
      /**
       * Identifies approval content for discriminated event or part routing.
       */
      type: 'approval';

      /** Host request identity used to correlate an interaction reply. */
      requestId: string;

      /** Text content displayed by the owning response presentation. */
      text: string;

      /** Optional supporting detail shown with the approval prompt. */
      detail?: string | null;
    }
  | {
      /**
       * Identifies questions content for discriminated event or part routing.
       */
      type: 'questions';
      /** Host request identity used to correlate an interaction reply. */
      requestId: string;
      /** Text content displayed by the owning response presentation. */
      text: string;
      /** Ordered question schemas displayed and validated together. */
      questions: ChatQuestion[];
    }
  | {
      /**
       * Identifies artifact content for discriminated event or part routing.
       */
      type: 'artifact';
      /**
       * Stable identity used to address this entry within its owning message or
       * schema.
       */
      id: string;
      /**
       * Provider metadata key or artifact display name, according to event
       * type.
       */
      name: string;
      /**
       * Optional artifact URL; the host resolver decides whether to expose it.
       */
      url?: string | null;
      /**
       * Optional native artifact path; only the host resolver may authorize
       * exposure.
       */
      path?: string | null;
      /** Optional provider-reported media type for an artifact. */
      mimeType?: string | null;
    }
  | {
      /** Identifies status content for discriminated event or part routing. */
      type: 'status';

      /** Provider status or diagnostic message for host metadata handling. */
      message: string;
    }
  | {
      /**
       * Identifies metadata content for discriminated event or part routing.
       */
      type: 'metadata';

      /**
       * Provider metadata key or artifact display name, according to event
       * type.
       */
      name: string;

      /** Host-defined metadata payload, or host-prepared attachment content. */
      data: unknown;
    }
  | {
      /**
       * Identifies completed content for discriminated event or part routing.
       */
      type: 'completed';

      /** Provider lifecycle status interpreted by the agent event adapter. */
      status: string;

      /** Optional provider failure detail on a completed turn. */
      error?: string | null;
    };

/** Provider event tagged with routing identities for one session and turn. */
export type AgentEventEnvelope = AgentEvent & {
  /** Host session identity used to route requests and events. */
  sessionId: string;
  /** Turn identity used to reject events from other or previous responses. */
  turnId: string;
};

/**
 * Host-owned RPC and event channel shared by agent sessions.
 * Closing a chat session does not imply ownership of this connection.
 */
export interface AgentConnection {

  /**
   * Sends one RPC and resolves the correlated host response.
   *
   * @typeParam T - Expected response type; the connection does not validate its domain schema.
   * @param method - Host RPC method name.
   * @param params - Host-defined request parameters.
   */
  request<T>(method: string, params: unknown): Promise<T>;

  /**
   * Observes incoming events or text chunks and returns subscription cleanup.
   */
  subscribe(listener: (event: AgentEventEnvelope) => void): () => void;
}

/**
 * Session configuration with host attachment, artifact, and metadata adapters.
 */
export interface AgentChatOptions extends AgentSessionOptions {

  /**
   * Host validates and snapshots selected files. The returned references are
   * forwarded with the turn.
   */
  prepareAttachments?: (
    attachments: readonly ChatAttachment[],
    signal: AbortSignal
  ) => Promise<
    readonly {
      /** Display name supplied by the host. */
      name: string;

      /** Host-defined metadata payload, or host-prepared attachment content. */
      data: string;
    }[]
  >;

  /**
   * Only a host resolver may authorize and expose native paths. Returned URLs
   * remain host-owned.
   */
  resolveArtifact?: (
    event: Extract<
      AgentEventEnvelope,
      {
        /**
         * Identifies artifact content for discriminated event or part routing.
         */
        type: 'artifact';
      }
    >
  ) => Promise<ChatArtifactOptions | undefined>;

  /** Optional receiver for provider metadata and status events. */
  onMetadata?: (event: AgentEventEnvelope) => void;
}

/**
 * Host-owned text transport; received chunks may split or combine JSON lines.
 */
export interface AgentLineTransport {

  /**
   * Writes text supplied by the framing adapter without taking ownership of the
   * transport.
   */
  write(line: string): Promise<void> | void;

  /**
   * Observes incoming events or text chunks and returns subscription cleanup.
   */
  subscribe(listener: (chunk: string) => void): () => void;
}

/** Bounds and deadlines used by the JSON-line connection adapter. */
export interface AgentLineConnectionOptions {

  /** Ordinary RPC deadline in milliseconds; defaults to 30,000. */
  timeoutMs?: number;

  /** Independent turn/send deadline in milliseconds; defaults to 3,600,000. */
  turnTimeoutMs?: number;

  /** Maximum buffered input string length; defaults to 16 * 1024 * 1024. */
  maxBufferLength?: number;
}
