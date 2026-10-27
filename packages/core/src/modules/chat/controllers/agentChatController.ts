import {ChatController} from './aiChat';
import type {ChatOptions} from '../types/chatTypes';

/**
 * Conversation controller protecting provider-owned history from local rewrites.
 * Native providers carry independent histories, so clear and rewind reject
 * before mutation. Every send verifies the previously acknowledged prefix.
 */
export class AgentChatController extends ChatController {

  /** Reports session disposal independently of direct conversation disposal. */
  private readonly isSessionDisposed: () => boolean;

  /** Last acknowledged serialized provider conversation mirror. */
  private history: string;

  /** Permanently rejects later sends after an older history prefix is modified. */
  private historyChanged = false;

  /** Creates local presentation state without creating a native session or request. */
  constructor(options: ChatOptions, isSessionDisposed: () => boolean) {
    super(options);
    this.isSessionDisposed = isSessionDisposed;
    this.history = JSON.stringify(this.state.messages);
  }

  /** Rejects local clearing before either provider or local history can diverge. */
  override clear(): never {
    throw new Error(
      "Clearing a native session's history is unsupported. Dispose this session and create a new agent chat."
    );
  }

  /** Rejects local rewind before changing drafts or the conversation prefix. */
  override rewind(_messageId: string): never {
    throw new Error(
      "Rewinding a native session's history is unsupported. Create a new agent chat for a different conversation."
    );
  }

  /** Verifies history integrity and tracks the acknowledged prefix around a send. */
  override async send(): Promise<boolean> {
    if (this.state.busy || this.isSessionDisposed()) return false;
    if (
      this.state.rewindId ||
      this.historyChanged ||
      JSON.stringify(this.state.messages) !== this.history
    )
      throw new Error(
        'Local chat history differs from the native session. Dispose this session and create a new agent chat.'
      );
    const count = this.state.messages.length;
    const previous = this.history;
    try {
      return await super.send();
    } finally {
      if (JSON.stringify(this.state.messages.slice(0, count)) !== previous)
        this.historyChanged = true;
      this.history = JSON.stringify(this.state.messages);
    }
  }
}
