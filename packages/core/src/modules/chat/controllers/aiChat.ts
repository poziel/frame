import {copyChatMessages} from '../services/content/chatParts';
import {reactive} from 'vue';
import {ChatTurn} from './chatTurn';
import type {
  ChatState,
  ChatOptions,
  ChatApprovalDecision,
  ChatQuestionAnswer,
  ChatAttachment,
} from '../types/chatTypes';

export type * from '../types/chatTypes';

/**
 * Owns one conversation's messages, draft, rewind preview, and active response.
 * Construction never invokes the responder. Each send owns a separate ChatTurn,
 * allowing cancellation and late writes to stay isolated across generations.
 *
 * @example
 * ```ts
 * const chat = createAIChat({respond: (_request, writer) => {writer.message('Hello');}});
 * chat.state.draft = 'Hi';
 * await chat.send();
 * chat.dispose();
 * ```
 */
export class ChatController {

  /** Host responder and optional initial messages, retained for explicit sends. */
  private readonly options: ChatOptions;

  /** Reactive conversation state shared by its visual presentations. */
  readonly state: ChatState;

  /** Turn currently permitted to mutate the conversation. */
  private active: ChatTurn | undefined;

  /** Blocks sends after the owning conversation has ended. */
  private disposed = false;

  /** Unsent content restored when a rewind preview is cancelled. */
  private savedDraft: {text: string; attachments: ChatAttachment[]} | undefined;

  /** Creates independent state and binds operations used as callbacks by consumers. */
  constructor(options: ChatOptions) {
    this.options = options;
    this.state = reactive({
      messages: copyChatMessages(options.messages ?? []),
      draft: '',
      attachments: [],
      busy: false,
      rewindId: undefined,
    });
    this.send = this.send.bind(this);
    this.stop = this.stop.bind(this);
    this.rewind = this.rewind.bind(this);
    this.cancelRewind = this.cancelRewind.bind(this);
    this.fork = this.fork.bind(this);
    this.clear = this.clear.bind(this);
    this.resolveApproval = this.resolveApproval.bind(this);
    this.answerQuestions = this.answerQuestions.bind(this);
    this.cancelInteraction = this.cancelInteraction.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Restores the saved draft and attachments without changing message history. */
  cancelRewind() {
    if (!this.state.rewindId) return;
    this.state.draft = this.savedDraft?.text ?? '';
    this.state.attachments = this.savedDraft?.attachments ?? [];
    this.state.rewindId = undefined;
    this.savedDraft = undefined;
  }

  /** Previews replacement of a user message while retaining the prior unsent draft. */
  rewind(messageId: string) {
    if (this.state.busy) return;
    if (this.state.rewindId === messageId) {
      this.cancelRewind();
      return;
    }
    const message = this.state.messages.find(
      (item) => item.id === messageId && item.role === 'user'
    );
    if (!message) return;
    if (!this.state.rewindId)
      this.savedDraft = {
        text: this.state.draft,
        attachments: this.state.attachments.slice(),
      };
    this.state.rewindId = messageId;
    this.state.draft = message.parts
      .filter((part) => part.type === 'message')
      .map((part) => part.text)
      .join('\n\n');
    this.state.attachments = message.attachments.map((item) => ({...item}));
  }

  /** Stops the active response without waiting for the host responder. */
  stop() {
    this.active?.stop();
  }

  /** Returns an independent conversation prefix ending at a completed assistant message. */
  fork(messageId: string) {
    const index = this.state.messages.findIndex(
      (message) =>
        message.id === messageId &&
        message.role === 'assistant' &&
        message.status !== 'pending'
    );
    return index < 0
      ? []
      : copyChatMessages(this.state.messages.slice(0, index + 1));
  }

  /** Stops the response and clears local history, draft, attachments, and rewind state. */
  clear() {
    this.stop();
    this.state.messages = [];
    this.state.draft = '';
    this.state.attachments = [];
    this.state.rewindId = undefined;
    this.savedDraft = undefined;
  }

  /**
   * Sends the draft once and resolves when its owned response completes or stops.
   *
   * @returns False for an empty draft, concurrent send, or disposed controller;
   * true when a generation started, including one later stopped or failed.
   * @remarks Responder failures become response errors rather than leaking an
   * unhandled rejection. A stopped send does not await an uncooperative responder.
   */
  async send(): Promise<boolean> {
    const prompt = this.state.draft.trim();
    if (
      (!prompt && !this.state.attachments.length) ||
      this.state.busy ||
      this.disposed
    )
      return false;
    if (this.state.rewindId) {
      const index = this.state.messages.findIndex(
        (item) => item.id === this.state.rewindId
      );
      if (index < 0) return false;
      this.state.messages.splice(index);
      this.state.rewindId = undefined;
      this.savedDraft = undefined;
    }
    const attachments = this.state.attachments.slice();
    this.state.messages.push({
      id: this.id(),
      role: 'user',
      createdAt: Date.now(),
      parts: [{id: this.id(), type: 'message', text: prompt}],
      attachments,
      status: 'complete',
    });
    const history = copyChatMessages(this.state.messages);
    const responseId = this.id();
    this.state.messages.push({
      id: responseId,
      role: 'assistant',
      createdAt: Date.now(),
      parts: [],
      attachments: [],
      status: 'pending',
    });
    const response = this.state.messages.find(
      (item) => item.id === responseId
    )!;
    this.state.draft = '';
    this.state.attachments = [];
    this.state.busy = true;
    const turn: ChatTurn = new ChatTurn(
      response,
      () => this.active === turn,
      () => {
        this.active = undefined;
        this.state.busy = false;
      }
    );
    this.active = turn;
    turn.run(
      {messages: history, prompt, attachments, signal: turn.controller.signal},
      (request, writer) => this.options.respond(request, writer)
    );
    await turn.done;
    return true;
  }

  /** Resolves an approval only in the active generation. */
  resolveApproval(id: string, decision: ChatApprovalDecision): boolean {
    return this.active?.resolveApproval(id, decision) ?? false;
  }

  /** Submits validated answers only to the active generation. */
  answerQuestions(id: string, answers: ChatQuestionAnswer[]): boolean {
    return this.active?.answerQuestions(id, answers) ?? false;
  }

  /** Cancels one interaction only in the active generation. */
  cancelInteraction(id: string): boolean {
    return this.active?.cancelInteraction(id) ?? false;
  }

  /** Permanently stops this conversation while leaving host services caller-owned. */
  dispose(): void {
    this.disposed = true;
    this.stop();
  }

  /** Generates message and part IDs using the existing chat identity prefix. */
  private id(): string {
    return 'chat-' + crypto.randomUUID();
  }
}

/** Structural conversation API, including native or host-provided implementations. */
export type AIChatController = Pick<ChatController, keyof ChatController>;

/** Creates a class-backed conversation through the existing public factory. */
export function createAIChat(options: ChatOptions): AIChatController {
  return new ChatController(options);
}
