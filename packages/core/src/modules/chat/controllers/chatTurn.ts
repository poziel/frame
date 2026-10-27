import {reactive} from 'vue';
import {ChatInteractions, validateQuestions} from './chatInteractions';
import type {
  ChatMessage,
  ChatRequest,
  ChatResponder,
  ChatResponseWriter,
  ChatPart,
  ChatActivityOptions,
  ChatApprovalOptions,
  ChatQuestionsOptions,
  ChatArtifactOptions,
  ChatApprovalPart,
  ChatQuestionPart,
  ChatApprovalDecision,
  ChatQuestionAnswer,
} from '../types/chatTypes';

/**
 * Owns one response writer, abort signal, interaction collection, and completion.
 * Every write checks registration with its conversation, so retained writers
 * cannot mutate a later turn after cancellation or completion.
 */
export class ChatTurn implements ChatResponseWriter {

  /** Response message whose parts are updated in call order. */
  private readonly response: ChatMessage;

  /** Checks whether this turn still belongs to its conversation. */
  private readonly isCurrent: () => boolean;

  /** Releases the conversation's active turn before settling pending interactions. */
  private readonly onFinish: () => void;

  /** Abort signal delivered to the host responder. */
  readonly controller = new AbortController();

  /** Resolves the send operation independently of an uncooperative responder. */
  private settle!: () => void;

  /** Completion observed by the owning conversation. */
  readonly done = new Promise<void>((resolve) => {
    this.settle = resolve;
  });

  /** Whether the responder returned, allowing the last interaction to complete it. */
  private returned = false;

  /** Pending interactions owned exclusively by this response. */
  private readonly interactions = new ChatInteractions(() => {
    if (this.returned) this.complete();
  });

  /** Creates an inactive writer; the owner must assign it before starting a responder. */
  constructor(
    response: ChatMessage,
    isCurrent: () => boolean,
    onFinish: () => void
  ) {
    this.response = response;
    this.isCurrent = isCurrent;
    this.onFinish = onFinish;
    this.thinking = this.thinking.bind(this);
    this.updateThinking = this.updateThinking.bind(this);
    this.finishThinking = this.finishThinking.bind(this);
    this.message = this.message.bind(this);
    this.append = this.append.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.commentary = this.commentary.bind(this);
    this.activityGroup = this.activityGroup.bind(this);
    this.activity = this.activity.bind(this);
    this.updateActivity = this.updateActivity.bind(this);
    this.finishActivity = this.finishActivity.bind(this);
    this.requestApproval = this.requestApproval.bind(this);
    this.askQuestions = this.askQuestions.bind(this);
    this.artifact = this.artifact.bind(this);
    this.complete = this.complete.bind(this);
    this.fail = this.fail.bind(this);
  }

  /** Starts the host responder after the conversation has installed this turn. */
  run(request: ChatRequest, respond: ChatResponder): void {
    try {
      const result = respond(request, this);
      void Promise.resolve(result).then(
        () => {
          this.returned = true;
          this.complete();
        },
        (error) =>
          this.fail(
            error instanceof Error
              ? error.message
              : 'Unable to generate a response.'
          )
      );
    } catch (error) {
      this.fail(
        error instanceof Error
          ? error.message
          : 'Unable to generate a response.'
      );
    }
  }

  /** Starts the current thought and closes any previously unfinished thought. */
  thinking(text = '') {
    return this.add({
      id: this.id(),
      type: 'thinking',
      text,
      startedAt: Date.now(),
    });
  }

  /** Updates a thought only while it is the current unfinished thought. */
  updateThinking(partId: string, text: string) {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type === 'thinking' && part.finishedAt === undefined)
      part.text = text;
  }

  /** Records completion of a still-active thought. */
  finishThinking(partId: string) {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type === 'thinking' && part.finishedAt === undefined)
      part.finishedAt = Date.now();
  }

  /** Appends an ordered message with its intermediate or final phase. */
  message(text: string, options: {phase?: 'intermediate' | 'final'} = {}) {
    return this.add({
      id: this.id(),
      type: 'message',
      text,
      phase: options.phase ?? 'final',
    });
  }

  /** Appends a streamed delta to an existing message in this response. */
  append(partId: string, text: string) {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type === 'message') part.text += text;
  }

  /** Applies an authoritative message snapshot without changing its identity. */
  updateMessage(
    partId: string,
    text: string,
    options: {phase?: 'intermediate' | 'final'} = {}
  ) {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type === 'message') {
      part.text = text;
      if (options.phase) part.phase = options.phase;
    }
  }

  /** Appends commentary independently of final-answer messages. */
  commentary(text: string) {
    return this.add({id: this.id(), type: 'commentary', text});
  }

  /** Creates a named group that activities in this response may reference. */
  activityGroup(options: {label: string}) {
    const partId = this.id();
    if (!this.writable()) return partId;
    if (!options.label.trim())
      throw new Error('Give the activity group a name.');
    return this.add({
      id: partId,
      type: 'activityGroup',
      label: options.label.trim(),
      text: '',
    });
  }

  /** Starts an activity after validating its optional group ownership. */
  activity(options: ChatActivityOptions) {
    const partId = this.id();
    if (!this.writable()) return partId;
    if (
      options.groupId !== undefined &&
      !this.response.parts.some(
        (part) => part.type === 'activityGroup' && part.id === options.groupId
      )
    )
      throw new Error('Choose a group from the current turn.');
    return this.add({
      id: partId,
      type: 'activity',
      label: options.label,
      text: options.text ?? '',
      output: options.output ?? '',
      outputLanguage: options.outputLanguage,
      groupId: options.groupId,
      status: 'running',
      startedAt: Date.now(),
    });
  }

  /** Updates only an activity that is still running in this response. */
  updateActivity(
    partId: string,
    update: Partial<Omit<ChatActivityOptions, 'groupId'>>
  ) {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type !== 'activity' || part.status !== 'running') return;
    if (update.label !== undefined) part.label = update.label;
    if (update.text !== undefined) part.text = update.text;
    if (update.output !== undefined) part.output = update.output;
    if (update.outputLanguage !== undefined)
      part.outputLanguage = update.outputLanguage;
  }

  /** Settles a running activity as completed or failed. */
  finishActivity(partId: string, status: 'completed' | 'failed' = 'completed') {
    if (!this.writable()) return;
    const part = this.response.parts.find((item) => item.id === partId);
    if (part?.type === 'activity' && part.status === 'running') {
      part.status = status;
      part.finishedAt = Date.now();
    }
  }

  /** Publishes an approval after registering its one-time resolver. */
  requestApproval(options: ChatApprovalOptions) {
    const partId = this.id();
    if (!this.writable())
      return {
        id: partId,
        result: Promise.resolve({status: 'cancelled' as const}),
      };
    if (!options.text.trim())
      throw new Error('Approval needs a proposed action.');
    const part = reactive<ChatApprovalPart>({
      ...options,
      id: partId,
      type: 'approval',
      status: 'pending',
    });
    const handle = this.interactions.approval(part);
    this.add(part);
    return handle;
  }

  /** Validates and snapshots questions before publishing their pending result. */
  askQuestions(options: ChatQuestionsOptions) {
    const partId = this.id();
    if (!this.writable())
      return {
        id: partId,
        result: Promise.resolve({status: 'cancelled' as const}),
      };
    validateQuestions(options.questions);
    const part = reactive<ChatQuestionPart>({
      id: partId,
      type: 'question',
      text: options.text ?? 'Questions',
      status: 'pending',
      questions: options.questions.map((question) => ({
        ...question,
        choices: question.choices.map((choice) => ({...choice})),
      })),
    });
    const handle = this.interactions.questions(part);
    this.add(part);
    return handle;
  }

  /** Publishes a host-owned artifact reference without taking URL ownership. */
  artifact(options: ChatArtifactOptions) {
    return this.add({
      ...options,
      id: this.id(),
      type: 'artifact',
      text: options.text ?? '',
    });
  }

  /** Completes only the current response and only after pending interactions settle. */
  complete() {
    if (!this.writable() || this.interactions.size) return false;
    this.finish('complete');
    return true;
  }

  /** Fails the current response and aborts its responder signal. */
  fail(message: string) {
    this.finish('error', message);
  }

  /** Stops this generation without waiting for a responder to return. */
  stop(): void {
    this.finish('stopped');
  }

  /** Settles one approval through this turn's interaction collection. */
  resolveApproval(id: string, decision: ChatApprovalDecision): boolean {
    return this.interactions.resolveApproval(id, decision);
  }

  /** Settles one validated question set through this turn's collection. */
  answerQuestions(id: string, answers: ChatQuestionAnswer[]): boolean {
    return this.interactions.answerQuestions(id, answers);
  }

  /** Cancels one interaction without affecting another response turn. */
  cancelInteraction(id: string): boolean {
    return this.interactions.cancel(id);
  }

  /** Rejects writes from completed, stopped, aborted, or replaced turns. */
  private writable(): boolean {
    return (
      this.isCurrent() &&
      !this.controller.signal.aborted &&
      this.response.status === 'pending'
    );
  }

  /** Generates a globally unique part identity using the existing chat prefix. */
  private id(): string {
    return 'chat-' + crypto.randomUUID();
  }

  /** Appends a part after finishing the previous thought and rechecking ownership. */
  private add(part: ChatPart) {
    if (this.writable()) {
      for (const current of this.response.parts)
        if (current.type === 'thinking' && current.finishedAt === undefined)
          current.finishedAt = Date.now();
      if (this.writable()) this.response.parts.push(part);
    }
    return part.id;
  }

  /** Settles response parts and the send promise while preserving cancellation ordering. */
  private finish(
    status: 'complete' | 'stopped' | 'error',
    error?: string
  ): void {
    if (!this.writable()) return;
    this.response.status = status;
    this.response.finishedAt = Date.now();
    if (error !== undefined) this.response.error = error;
    this.onFinish();
    this.interactions.cancelAll();
    for (const part of this.response.parts) {
      if (part.type === 'thinking' && part.finishedAt === undefined)
        part.finishedAt = this.response.finishedAt;
      if (part.type === 'activity' && part.status === 'running') {
        part.status =
          status === 'complete'
            ? 'completed'
            : status === 'error'
              ? 'failed'
              : 'cancelled';
        part.finishedAt = this.response.finishedAt;
      }
    }
    if (status !== 'complete') this.controller.abort();
    this.settle();
  }
}
