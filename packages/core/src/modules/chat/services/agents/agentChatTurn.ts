import type {AIChatController} from '../../controllers/aiChat';
import type {ChatRequest, ChatResponseWriter} from '../../types/chatTypes';
import type {
  AgentConnection,
  AgentSession,
  AgentChatOptions,
  AgentEventEnvelope,
} from '../../types/agentTypes';

/** Dependencies for one native turn, retaining host ownership of external resources. */
export interface AgentChatTurnContext {

  /** Connection carrying provider events and RPC replies. */
  connection: AgentConnection;

  /** Native session to which this turn belongs. */
  session: AgentSession;

  /** Isolated conversation request and cancellation signal. */
  request: ChatRequest;

  /** Writer accepting events for this response only. */
  writer: ChatResponseWriter;

  /** Conversation used to cancel local pending interactions on provider completion. */
  chat: AIChatController;

  /** Host authorization, attachment, and metadata callbacks. */
  options: AgentChatOptions;

  /** Reports whether the owning native session has been disposed. */
  isDisposed: () => boolean;
}

/**
 * Owns native event translation, turn-scoped subscriptions, and asynchronous jobs.
 * The session owns the chat and the host owns the connection. A completed or
 * cancelled turn cannot submit late interaction replies into another generation.
 */
export class AgentChatTurn {

  /** Connection retained for this turn's explicit RPC operations. */
  private readonly connection: AgentConnection;

  /** Session identity used to reject cross-session events. */
  private readonly session: AgentSession;

  /** Request context and abort signal for this generation. */
  private readonly request: ChatRequest;

  /** Response writer whose own lifetime checks reject stale writes. */
  private readonly writer: ChatResponseWriter;

  /** Conversation whose local pending interactions mirror provider requests. */
  private readonly chat: AIChatController;

  /** Reads the owning session's lifetime without owning its disposal. */
  private readonly isDisposed: () => boolean;

  /** Host resolver authorizing native artifact paths before presentation. */
  private readonly resolveArtifact: AgentChatOptions['resolveArtifact'];

  /** Optional host callback for metadata and unexposed artifacts. */
  private readonly onMetadata: AgentChatOptions['onMetadata'];

  /** Host-owned attachment preparation invoked only for explicit sends. */
  private readonly prepareAttachments: AgentChatOptions['prepareAttachments'];

  /** Native request identity shared by every event and reply in this generation. */
  private readonly turnId = crypto.randomUUID();

  /** Settles successful completion or cancellation of this turn. */
  private resolve!: () => void;

  /** Settles the native turn with a provider or integration failure. */
  private reject!: (error: Error) => void;

  /** Whether provider events and interaction replies are still accepted. */
  private accepting = true;

  /** Whether this turn promise has settled or been cancelled. */
  private finished = false;

  /** Cleanup for the current connection event subscription. */
  private unsubscribe = () => {};

  /** Provider message IDs mapped to local writer part identities. */
  private readonly messages = new Map<string, string>();

  /** Provider thought IDs mapped to local text and writer identities. */
  private readonly thoughts = new Map<
    string,
    {
      id: string;
      text: string;
    }
  >();

  /** Provider activity IDs mapped to local writer identities. */
  private readonly activities = new Map<string, string>();

  /** Provider request IDs mapped to local interaction handles. */
  private readonly interactions = new Map<string, string>();

  /** Outstanding authorized artifact and interaction-response jobs. */
  private readonly jobs = new Set<Promise<void>>();

  /** Captures dependencies without sending requests or starting a provider turn. */
  constructor(context: AgentChatTurnContext) {
    this.connection = context.connection;
    this.session = context.session;
    this.request = context.request;
    this.writer = context.writer;
    this.chat = context.chat;
    this.isDisposed = context.isDisposed;
    this.resolveArtifact = context.options.resolveArtifact;
    this.onMetadata = context.options.onMetadata;
    this.prepareAttachments = context.options.prepareAttachments;
    this.cleanup = this.cleanup.bind(this);
    this.fail = this.fail.bind(this);
    this.abort = this.abort.bind(this);
    this.track = this.track.bind(this);
    this.reply = this.reply.bind(this);
    this.artifact = this.artifact.bind(this);
    this.receive = this.receive.bind(this);
    this.send = this.send.bind(this);
  }

  /** Subscribes before sending so synchronous provider events are never missed. */
  run(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      try {
        this.unsubscribe = this.connection.subscribe(this.receive);
        this.request.signal.addEventListener('abort', this.abort, {once: true});
        if (this.request.signal.aborted || this.disposed) {
          this.abort();
          return;
        }

        const sending = this.request.attachments.length
          ? this.prepareAttachments!(
              this.request.attachments,
              this.request.signal
            ).then(this.send)
          : this.send();
        void sending?.catch((error) => {
          if (this.accepting) this.fail(error);
        });
      } catch (error) {
        this.fail(error);
      }
    });
  }

  /** Current lifetime of the owning native session. */
  private get disposed(): boolean {
    return this.isDisposed();
  }

  /** Releases the connection subscription and abort listener. */
  private cleanup() {
    this.unsubscribe();
    this.request.signal.removeEventListener('abort', this.abort);
  }

  /** Fails once, cancels an accepting native turn, and releases subscriptions. */
  private fail(error: unknown) {
    if (this.finished) return;
    const cancel = this.accepting;
    this.accepting = false;
    this.finished = true;
    this.cleanup();
    if (cancel)
      void this.connection
        .request('turn/cancel', {
          sessionId: this.session.sessionId,
          turnId: this.turnId,
        })
        .catch(() => {});
    this.reject(error instanceof Error ? error : new Error(String(error)));
  }

  /** Cancels the native turn and settles locally without waiting for its provider. */
  private abort() {
    if (this.finished) return;
    this.accepting = false;
    this.finished = true;
    this.cleanup();
    void this.connection
      .request('turn/cancel', {
        sessionId: this.session.sessionId,
        turnId: this.turnId,
      })
      .catch(() => {});
    this.resolve();
  }

  /** Retains an asynchronous job until it settles and forwards failures. */
  private track(job: Promise<void>) {
    this.jobs.add(job);
    void job.catch(this.fail).finally(() => this.jobs.delete(job));
  }

  /** Sends one interaction result only while its native turn remains active. */
  private reply(requestId: string, result: Promise<unknown>) {
    this.track(
      result.then(async (response) => {
        if (!this.accepting || this.disposed || this.request.signal.aborted)
          return;
        await this.connection.request('interaction/respond', {
          sessionId: this.session.sessionId,
          turnId: this.turnId,
          requestId,
          response,
        });
      })
    );
  }

  /** Publishes only host-authorized artifact URLs or safe provider URL references. */
  private artifact(event: Extract<AgentEventEnvelope, {type: 'artifact'}>) {
    if (this.resolveArtifact)
      this.track(
        this.resolveArtifact(event).then((result) => {
          if (!this.finished && !this.request.signal.aborted && result)
            this.writer.artifact(result);
        })
      );
    else if (event.url && /^(https?:|blob:|data:)/i.test(event.url))
      this.writer.artifact({
        name: event.name,
        url: event.url,
        kind: event.mimeType?.startsWith('image/') ? 'image' : 'file',
        mimeType: event.mimeType ?? undefined,
      });
    else this.onMetadata?.(event);
  }

  /** Filters session/turn identity before translating provider events into writer calls. */
  private receive(event: AgentEventEnvelope) {
    if (
      !this.accepting ||
      event.sessionId !== this.session.sessionId ||
      event.turnId !== this.turnId
    )
      return;
    try {
      switch (event.type) {
        case 'message': {
          const id = this.messages.get(event.id);
          if (!id)
            this.messages.set(
              event.id,
              this.writer.message(event.text, {phase: event.phase})
            );
          else if (event.delta) this.writer.append(id, event.text);
          else this.writer.updateMessage(id, event.text, {phase: event.phase});
          break;
        }
        case 'thinking': {
          let thought = this.thoughts.get(event.id);
          if (!thought) {
            thought = {id: this.writer.thinking(event.text), text: event.text};
            this.thoughts.set(event.id, thought);
          } else {
            thought.text = event.delta ? thought.text + event.text : event.text;
            this.writer.updateThinking(thought.id, thought.text);
          }
          if (event.finished) this.writer.finishThinking(thought.id);
          break;
        }
        case 'activity': {
          let id = this.activities.get(event.id);
          if (!id) {
            id = this.writer.activity({
              label: event.label,
              text: event.text,
              output: event.output,
            });
            this.activities.set(event.id, id);
          } else
            this.writer.updateActivity(id, {
              label: event.label,
              text: event.text,
              output: event.output,
            });
          if (event.status === 'completed' || event.status === 'failed')
            this.writer.finishActivity(id, event.status);
          break;
        }
        case 'approval': {
          if (this.interactions.has(event.requestId)) break;
          const handle = this.writer.requestApproval({
            text: event.text,
            detail: event.detail ?? undefined,
          });
          this.interactions.set(event.requestId, handle.id);
          this.reply(
            event.requestId,
            handle.result.then((result) =>
              result.status === 'answered'
                ? {type: 'approval', decision: result.decision}
                : {type: 'cancel'}
            )
          );
          break;
        }
        case 'questions': {
          if (this.interactions.has(event.requestId)) break;
          const handle = this.writer.askQuestions({
            text: event.text,
            questions: event.questions,
          });
          this.interactions.set(event.requestId, handle.id);
          this.reply(
            event.requestId,
            handle.result.then((result) =>
              result.status === 'answered'
                ? {type: 'answers', answers: result.answers}
                : {type: 'cancel'}
            )
          );
          break;
        }
        case 'artifact':
          this.artifact(event);
          break;
        case 'completed': {
          this.accepting = false;
          this.cleanup();
          for (const id of this.interactions.values())
            this.chat.cancelInteraction(id);
          if (event.error || ['error', 'failed'].includes(event.status)) {
            this.fail(event.error ?? 'Agent turn failed');
            break;
          }
          if (['cancelled', 'canceled', 'stopped'].includes(event.status)) {
            this.finished = true;
            this.chat.stop();
            this.resolve();
            break;
          }
          void Promise.all([...this.jobs]).then(() => {
            if (this.finished) return;
            this.finished = true;
            this.writer.complete();
            this.resolve();
          }, this.fail);
          break;
        }
        default:
          this.onMetadata?.(event);
      }
    } catch (error) {
      this.fail(error);
    }
  }

  /** Sends prepared references only while this native generation is still accepting work. */
  private send(
    references?: readonly {
      name: string;
      data: string;
    }[]
  ) {
    if (!this.accepting || this.request.signal.aborted) return;
    return this.connection.request('turn/send', {
      sessionId: this.session.sessionId,
      turnId: this.turnId,
      text: this.request.prompt,
      ...(references?.length ? {references} : {}),
    });
  }
}
