/**
 * Host-selected file, folder, or context reference attached to a chat message.
 */
export interface ChatAttachment {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Display name supplied by the host. */
  name: string;

  /** Distinguishes file, folder, and application-context references. */
  kind: 'file' | 'folder' | 'context';

  /**
   * Optional browser File objects retained by reference; copying clones only
   * the list.
   */
  files?: File[];
}

/**
 * Assistant or user message text with an optional response presentation phase.
 */
export interface ChatTextPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies message content for discriminated event or part routing. */
  type: 'message';

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Omitted means final answer for compatibility with existing responders. */
  phase?: 'intermediate' | 'final';
}

/** Transient reasoning text with timestamps for its active interval. */
export interface ChatThinkingPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies thinking content for discriminated event or part routing. */
  type: 'thinking';

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Start timestamp in milliseconds since the Unix epoch. */
  startedAt: number;

  /**
   * Completion timestamp in milliseconds since the Unix epoch, when finished.
   */
  finishedAt?: number;
}

/** Progress commentary retained in the ordered response timeline. */
export interface ChatCommentaryPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies commentary content for discriminated event or part routing. */
  type: 'commentary';

  /** Text content displayed by the owning response presentation. */
  text: string;
}

/** Initial content and optional explicit grouping for one reported activity. */
export interface ChatActivityOptions {

  /** Human-readable label shown by the owning presentation. */
  label: string;

  /** Text content displayed by the owning response presentation. */
  text?: string;

  /**
   * Reported activity output, retained independently of the activity
   * description.
   */
  output?: string;

  /** Optional language identifier used to render the activity output. */
  outputLanguage?: string;

  /**
   * Optional group created by this turn's writer.activityGroup(). Omit for
   * automatic grouping.
   */
  groupId?: string;
}

/** Named activity boundary used to collect related work in presentation. */
export interface ChatActivityGroupPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /**
   * Identifies activityGroup content for discriminated event or part routing.
   */
  type: 'activityGroup';

  /** Human-readable label shown by the owning presentation. */
  label: string;

  /** Text content displayed by the owning response presentation. */
  text: string;
}

/** Reported work, its output, and lifecycle timestamps within a response. */
export interface ChatActivityPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies activity content for discriminated event or part routing. */
  type: 'activity';

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Human-readable label shown by the owning presentation. */
  label: string;

  /**
   * Reported activity output, retained independently of the activity
   * description.
   */
  output: string;

  /** Optional language identifier used to render the activity output. */
  outputLanguage?: string;

  /**
   * Optional explicit activity-group identity; omitted values use presentation
   * grouping.
   */
  groupId?: string;

  /** Current work state, including cancellation when its turn stops. */
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  /** Start timestamp in milliseconds since the Unix epoch. */
  startedAt: number;

  /**
   * Completion timestamp in milliseconds since the Unix epoch, when finished.
   */
  finishedAt?: number;
}

/** Prompt and supporting detail for a user approval request. */
export interface ChatApprovalOptions {

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Optional supporting detail shown with the approval prompt. */
  detail?: string;
}

/** User decision submitted to an approval interaction. */
export type ChatApprovalDecision = 'allow' | 'deny';

/** Cancellation result shared by pending interaction promises. */
export interface ChatCancelledResult {

  /** Marks cancellation without treating it as an answered interaction. */
  status: 'cancelled';
}

/** Discriminated approval result; cancellation carries no decision. */
export type ChatApprovalResult =
  | {
      /** Marks the answered branch of the approval result. */
      status: 'answered';

      /** User decision retained after an approval is answered. */
      decision: ChatApprovalDecision;
    }
  | ChatCancelledResult;

/** Rendered approval prompt and its pending, answered, or cancelled state. */
export interface ChatApprovalPart extends ChatApprovalOptions {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies approval content for discriminated event or part routing. */
  type: 'approval';

  /** Whether the approval is pending, answered, or cancelled. */
  status: 'pending' | 'answered' | 'cancelled';

  /** User decision retained after an approval is answered. */
  decision?: ChatApprovalDecision;
}

/** One identified answer choice displayed in a question. */
export interface ChatChoice {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Human-readable label shown by the owning presentation. */
  label: string;

  /** Optional supporting text displayed with the choice. */
  description?: string;
}

/** Question schema governing available choices and permitted user answers. */
export interface ChatQuestion {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Ordered answer choices available to this question. */
  choices: ChatChoice[];

  /** Allows multiple selections; omitted values permit only one answer. */
  multiple?: boolean;

  /** Requires a choice or custom answer unless explicitly set to false. */
  required?: boolean;

  /** Allows a free-text answer in addition to the configured choices. */
  allowCustom?: boolean;
}

/** Answer snapshot addressed to one question in its originating schema. */
export interface ChatQuestionAnswer {

  /** Identity of the question this answer addresses. */
  questionId: string;

  /** Selected choice identities from the originating question schema. */
  choiceIds: string[];

  /** Optional custom answer text, accepted only when the schema allows it. */
  customText?: string;
}

/** A collection of questions with an optional shared introductory prompt. */
export interface ChatQuestionsOptions {

  /** Text content displayed by the owning response presentation. */
  text?: string;

  /** Ordered question schemas displayed and validated together. */
  questions: ChatQuestion[];
}

/** Discriminated question result; cancellation carries no answer collection. */
export type ChatQuestionsResult =
  | {
      /** Marks the answered branch of the question result. */
      status: 'answered';

      /**
       * Validated answer snapshots retained after the interaction is answered.
       */
      answers: ChatQuestionAnswer[];
    }
  | ChatCancelledResult;

/**
 * Rendered question collection and its pending, answered, or cancelled state.
 */
export interface ChatQuestionPart {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies question content for discriminated event or part routing. */
  type: 'question';

  /** Text content displayed by the owning response presentation. */
  text: string;

  /** Ordered question schemas displayed and validated together. */
  questions: ChatQuestion[];

  /** Whether the question collection is pending, answered, or cancelled. */
  status: 'pending' | 'answered' | 'cancelled';

  /** Validated answer snapshots retained after the interaction is answered. */
  answers?: ChatQuestionAnswer[];
}

/**
 * One pending interaction identity and its eventual typed result.
 *
 * @typeParam T - Answered-or-cancelled result produced by this interaction.
 */
export interface ChatInteractionHandle<T> {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Promise settled when this interaction is answered or cancelled. */
  result: Promise<T>;
}

/**
 * The host owns the URL and must keep it valid for all presentations/snapshots
 * using it.
 */
export interface ChatArtifactOptions {

  /** Display name supplied by the host. */
  name: string;

  /**
   * Host-owned resource URL whose lifetime must cover all referencing
   * snapshots.
   */
  url: string;

  /** Presentation kind selecting an image preview or downloadable file. */
  kind: 'image' | 'file';

  /** Optional media type supplied by the host for presentation. */
  mimeType?: string;

  /** Optional caption or explanatory text for the resource. */
  text?: string;

  /** Optional resource byte size supplied by the host. */
  size?: number;
}

/** Artifact reference published into the ordered response timeline. */
export interface ChatArtifactPart extends ChatArtifactOptions {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Identifies artifact content for discriminated event or part routing. */
  type: 'artifact';

  /** Caption retained with the published artifact reference. */
  text: string;
}

/**
 * Discriminated conversation content consumed by renderers and response writers.
 * Narrow by type before reading fields specific to a message, activity,
 * interaction, or artifact. Parts remain plain data, not lifecycle owners.
 */
export type ChatPart =
  | ChatTextPart
  | ChatThinkingPart
  | ChatCommentaryPart
  | ChatActivityPart
  | ChatActivityGroupPart
  | ChatApprovalPart
  | ChatQuestionPart
  | ChatArtifactPart;

/**
 * One ordered conversation entry, including content, attachments, and
 * completion.
 */
export interface ChatMessage {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Conversation role identifying the entry as user or assistant content. */
  role: 'user' | 'assistant';

  /** Creation timestamp in milliseconds since the Unix epoch. */
  createdAt: number;

  /** Content parts retained in their original event order. */
  parts: ChatPart[];

  /**
   * Host-selected attachment references associated with this entry or request.
   */
  attachments: ChatAttachment[];

  /** Whether the entry is pending, complete, stopped, or failed. */
  status: 'pending' | 'complete' | 'stopped' | 'error';

  /**
   * Completion timestamp in milliseconds since the Unix epoch, when finished.
   */
  finishedAt?: number;

  /** Failure explanation retained when the message finishes with an error. */
  error?: string;
}

/**
 * Responder input with copied conversation context and turn-scoped
 * cancellation.
 */
export interface ChatRequest {

  /** Ordered conversation snapshots supplied by the owner. */
  messages: ChatMessage[];

  /** Submitted user prompt for this turn. */
  prompt: string;

  /**
   * Host-selected attachment references associated with this entry or request.
   */
  attachments: ChatAttachment[];

  /**
   * Turn cancellation signal observed by the host responder and async adapters.
   */
  signal: AbortSignal;
}

/**
 * Publishes ordered content for one active response generation.
 *
 * Writes after completion or cancellation are ignored. Returned part identities
 * address later updates; interaction handles settle as answered or cancelled.
 * Pending interactions prevent successful completion until they are settled.
 *
 * @example
 * const part = response.message('Working...', {phase: 'intermediate'});
 * response.updateMessage(part, 'Finished', {phase: 'final'});
 * response.complete();
 */
export interface ChatResponseWriter {

  /**
   * Starts the single current thought, superseding the previous one. New
   * non-thinking events clear it.
   */
  thinking(text?: string): string;

  /** Replaces the text of the current unfinished thought. */
  updateThinking(id: string, text: string): void;

  /** Marks an existing current thought as finished. */
  finishThinking(id: string): void;

  /**
   * Appends message text and returns its part identity; phase defaults to
   * final.
   */
  message(
    text: string,
    options?: {
      /**
       * Intermediate progress or final-answer phase used by response
       * presentation.
       */
      phase?: 'intermediate' | 'final';
    }
  ): string;

  /**
   * Apply an authoritative provider snapshot, including promotion to the final
   * answer.
   */
  updateMessage(
    id: string,
    text: string,
    options?: {
      /**
       * Intermediate progress or final-answer phase used by response
       * presentation.
       */
      phase?: 'intermediate' | 'final';
    }
  ): void;

  /** Appends a streamed text delta to an existing message part. */
  append(id: string, text: string): void;

  /** Appends progress commentary and returns its part identity. */
  commentary(text: string): string;

  /**
   * Creates an explicit named group and returns its identity for later
   * activities.
   */
  activityGroup(
    options: {
    /** Human-readable label shown by the owning presentation. */
    label: string;
  }
  ): string;

  /** Starts an activity and returns its part identity. */
  activity(options: ChatActivityOptions): string;

  /** Updates existing activity content without changing its group identity. */
  updateActivity(
    id: string,
    update: Partial<Omit<ChatActivityOptions, 'groupId'>>
  ): void;

  /** Finishes an activity; omitted status means completed. */
  finishActivity(id: string, status?: 'completed' | 'failed'): void;

  /**
   * Publishes an approval prompt and returns its answered-or-cancelled handle.
   */
  requestApproval(
    options: ChatApprovalOptions
  ): ChatInteractionHandle<ChatApprovalResult>;

  /**
   * Validates and publishes questions, returning their answered-or-cancelled
   * handle.
   */
  askQuestions(
    options: ChatQuestionsOptions
  ): ChatInteractionHandle<ChatQuestionsResult>;

  /**
   * Publishes a host-owned artifact reference and returns its part identity.
   */
  artifact(options: ChatArtifactOptions): string;

  /**
   * Returns false while interactions are pending, or when this writer is no
   * longer active.
   */
  complete(): boolean;

  /**
   * Fails the current response and settles its pending interactions as
   * cancelled.
   */
  fail(message: string): void;
}

/**
 * Host responder invoked for one turn; responses are published through its
 * writer.
 */
export type ChatResponder = (
  request: ChatRequest,
  response: ChatResponseWriter
) => void | Promise<void>;

/** Initial conversation data and the host-owned response implementation. */
export interface ChatOptions {

  /**
   * Host callback that produces responses when the conversation explicitly
   * sends.
   */
  respond: ChatResponder;

  /** Ordered conversation snapshots supplied by the owner. */
  messages?: ChatMessage[];
}

/**
 * Reactive conversation values shared by all presentations of one controller.
 */
export interface ChatState {

  /** Ordered user and assistant messages retained for this conversation. */
  messages: ChatMessage[];

  /** Unsent composer text, independent of streamed response parts. */
  draft: string;

  /** Host-selected references attached to the next explicit send. */
  attachments: ChatAttachment[];

  /** Whether a response is currently owned by the controller. */
  busy: boolean;

  /** User message being previewed for replacement, or undefined. */
  rewindId: string | undefined;
}
