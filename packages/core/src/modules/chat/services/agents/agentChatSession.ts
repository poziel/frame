import type {AIChatController} from '../../controllers/aiChat';
import {AgentChatController} from '../../controllers/agentChatController';
import {AgentChatTurn} from './agentChatTurn';
import type {ChatRequest, ChatResponseWriter} from '../../types/chatTypes';
import type {
  AgentConnection,
  AgentChatOptions,
  AgentSession,
} from '../../types/agentTypes';

/**
 * Owns an explicitly created native session and its embeddable conversation.
 * The host owns the connection and any underlying process. Disposal stops the
 * conversation and closes this session without disposing the shared connection.
 */
export class AgentChatSession {

  /** Conversation enforcing native provider history restrictions. */
  readonly chat: AIChatController;

  /** Metadata returned by the provider's explicit session/create operation. */
  readonly session: AgentSession;

  /** Caller-owned provider connection used for this session's RPC calls. */
  private readonly connection: AgentConnection;

  /** Host attachment, artifact authorization, and metadata integration. */
  private readonly options: AgentChatOptions;

  /** Guards session closure and suppresses later interaction replies. */
  private disposed = false;

  /** Wraps an existing native session without starting requests or registering views. */
  constructor(
    connection: AgentConnection,
    session: AgentSession,
    options: AgentChatOptions
  ) {
    this.connection = connection;
    this.session = session;
    this.options = options;
    this.dispose = this.dispose.bind(this);
    this.chat = new AgentChatController(
      {respond: (request, writer) => this.respond(request, writer)},
      () => this.disposed
    );
  }

  /** Explicitly requests a native session, omitting host-only callbacks from its payload. */
  static async create(
    connection: AgentConnection,
    options: AgentChatOptions
  ): Promise<AgentChatSession> {
    const {resolveArtifact, onMetadata, prepareAttachments, ...sessionOptions} =
      options;
    const session = await connection.request<AgentSession>(
      'session/create',
      sessionOptions
    );
    return new AgentChatSession(connection, session, {
      ...sessionOptions,
      resolveArtifact,
      onMetadata,
      prepareAttachments,
    });
  }

  /** Stops local work and closes this native session once; the connection stays caller-owned. */
  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.chat.dispose();
    await this.connection.request('session/close', {
      sessionId: this.session.sessionId,
    });
  }

  /** Creates one event-translation owner for an explicitly submitted conversation turn. */
  private respond(
    request: ChatRequest,
    writer: ChatResponseWriter
  ): Promise<void> {
    if (request.attachments.length && !this.options.prepareAttachments)
      throw new Error(
        'Native agent attachments require host integration; this connection currently accepts text prompts only.'
      );
    return new AgentChatTurn({
      connection: this.connection,
      session: this.session,
      request,
      writer,
      chat: this.chat,
      options: this.options,
      isDisposed: () => this.disposed,
    }).run();
  }
}

/** Structural session API retained for existing native chat consumers. */
export type AgentChatSessionController = Pick<
  AgentChatSession,
  keyof AgentChatSession
>;

/** Creates one native session without registering or opening any shell contribution. */
export async function createAgentChatSession(
  connection: AgentConnection,
  options: AgentChatOptions
): Promise<AgentChatSessionController> {
  return AgentChatSession.create(connection, options);
}
