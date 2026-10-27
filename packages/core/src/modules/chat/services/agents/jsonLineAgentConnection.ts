import type {
  AgentConnection,
  AgentEventEnvelope,
  AgentLineTransport,
  AgentLineConnectionOptions,
} from '../../types/agentTypes';

/**
 * Frames a host-owned JSON-line transport and correlates asynchronous RPC calls.
 * Construction subscribes to the supplied transport but starts no process and
 * sends no requests. Disposal releases timers and rejects outstanding calls.
 */
export class JsonLineAgentConnection implements AgentConnection {

  /** Host-owned transport; disposing this adapter never closes a process. */
  private readonly transport: AgentLineTransport;

  /** Framing and RPC limits supplied by the host. */
  private readonly options: AgentLineConnectionOptions;

  /** Event subscriptions independent of pending RPC response correlation. */
  private readonly listeners = new Set<(event: AgentEventEnvelope) => void>();

  /** Outstanding requests with timers released on response, failure, or disposal. */
  private readonly pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  /** Incomplete trailing JSON-line frame retained between transport chunks. */
  private buffer = '';

  /** Monotonic RPC correlation identifier for this connection. */
  private nextId = 0;

  /** Terminal failure retained so later requests reject consistently. */
  private closed: Error | undefined = undefined;

  /** Cleanup for the host transport subscription. */
  private unsubscribe = () => {};

  /** Maximum permitted buffered frame length. */
  private readonly limit: number;

  /** Deadline for ordinary RPC requests. */
  private readonly timeout: number;

  /** Independent deadline for long-running turn/send requests. */
  private readonly turnTimeout: number;

  /** Validates limits and attaches the host transport subscription. */
  constructor(
    transport: AgentLineTransport,
    options: AgentLineConnectionOptions = {}
  ) {
    this.transport = transport;
    this.options = options;
    this.request = this.request.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.dispose = this.dispose.bind(this);
    this.receive = this.receive.bind(this);
    this.limit = this.options.maxBufferLength ?? 16 * 1024 * 1024;
    this.timeout = this.options.timeoutMs ?? 30000;
    this.turnTimeout = this.options.turnTimeoutMs ?? 3600000;
    if (
      !Number.isFinite(this.limit) ||
      this.limit < 1 ||
      !Number.isFinite(this.timeout) ||
      this.timeout < 1 ||
      !Number.isFinite(this.turnTimeout) ||
      this.turnTimeout < 1
    )
      throw new Error('Agent framing limits must be positive.');
    this.unsubscribe = this.transport.subscribe(this.receive);
  }

  /** Rejects all outstanding work and releases this adapter's subscription exactly once. */
  dispose(reason = new Error('Agent connection disposed')) {
    if (this.closed) return;
    this.closed = reason;
    this.unsubscribe();
    this.buffer = '';
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(reason);
    }
    this.pending.clear();
    this.listeners.clear();
  }

  /**
   * Correlates one RPC request until a response, timeout, write failure, or disposal.
   *
   * @typeParam T - Expected host response type; framing does not validate its domain schema.
   * @param method - Provider RPC operation; turn/send uses its own longer deadline.
   * @param params - Serializable request payload owned by the caller.
   * @returns The correlated result, or a rejection when the request cannot complete.
   */
  request<T>(method: string, params: unknown): Promise<T> {
    if (this.closed) return Promise.reject(this.closed);
    const id = ++this.nextId;
    return new Promise<T>((resolve, reject) => {
      const key = String(id);
      const timer = setTimeout(
        () => {
          this.pending.delete(key);
          reject(new Error(`Agent request timed out: ${method}`));
        },
        method === 'turn/send' ? this.turnTimeout : this.timeout
      );
      this.pending.set(key, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });
      try {
        const line =
          JSON.stringify({jsonrpc: '2.0', id, method, params}) + '\n';
        void Promise.resolve(this.transport.write(line)).catch((error) => {
          const item = this.pending.get(key);
          if (item) {
            this.pending.delete(key);
            clearTimeout(item.timer);
            item.reject(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        });
      } catch (error) {
        this.pending.delete(key);
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /** Registers an event callback and returns its identity-specific cleanup. */
  subscribe(listener: (event: AgentEventEnvelope) => void) {
    if (this.closed) throw this.closed;
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Parses bounded transport chunks and routes complete frames to RPCs or events. */
  private receive(chunk: string): void {
    if (this.closed) return;
    this.buffer += chunk;
    while (this.buffer.includes('\n')) {
      const newline = this.buffer.indexOf('\n');
      if (newline > this.limit) {
        this.dispose(new Error('Agent JSONL frame exceeds configured limit'));
        return;
      }
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (!line) continue;
      let value: Record<string, unknown>;
      try {
        value = JSON.parse(line);
        if (!value || typeof value !== 'object' || Array.isArray(value))
          throw new Error();
      } catch {
        this.dispose(new Error('Invalid agent JSONL frame'));
        return;
      }
      if (value.method === 'event') {
        const event = value.params as AgentEventEnvelope | undefined;
        if (
          !event ||
          typeof event.sessionId !== 'string' ||
          typeof event.turnId !== 'string' ||
          typeof event.type !== 'string'
        ) {
          this.dispose(new Error('Invalid agent event envelope'));
          return;
        }
        for (const listener of [...this.listeners]) {
          try {
            listener(event);
          } catch {
            /* Each subscriber owns its failure handling. */
          }
        }
      } else if (value.id !== undefined) {
        const key = String(value.id),
          item = this.pending.get(key);
        if (!item) continue;
        this.pending.delete(key);
        clearTimeout(item.timer);
        if (value.error !== undefined) {
          const error = value.error as {
            message?: unknown;
          };
          item.reject(
            new Error(
              typeof error?.message === 'string'
                ? error.message
                : 'Agent request failed'
            )
          );
        } else item.resolve(value.result);
      }
    }
    if (this.buffer.length > this.limit)
      this.dispose(new Error('Agent JSONL frame exceeds configured limit'));
  }
}

/** Adapts an existing transport through the original public factory contract. */
export function createJsonLineAgentConnection(
  transport: AgentLineTransport,
  options: AgentLineConnectionOptions = {}
): Pick<JsonLineAgentConnection, keyof JsonLineAgentConnection> {
  return new JsonLineAgentConnection(transport, options);
}
