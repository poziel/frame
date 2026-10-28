import {Channel, invoke} from '@tauri-apps/api/core';
import type {
  AgentConnection,
  AgentEventEnvelope,
} from '@frame/core/modules/chat';

/** Invocation boundary, replaceable for offline transport tests. */
export type AgentInvoke = <T>(
  command: string,
  args: Record<string, unknown>
) => Promise<T>;

/** Owns the reusable Tauri request/event connection for one host-created runtime. */
export class TauriAgentConnection implements AgentConnection {

  /** Subscribers scoped to this connection. */
  private readonly listeners = new Set<(event: AgentEventEnvelope) => void>();

  /** Shared disconnect result makes disposal idempotent, including failures. */
  private disposal?: Promise<void>;

  /** Stops requests and event delivery immediately when disposal begins. */
  private disposed = false;

  /** Uses an identity created by the native host, never a provider credential. */
  constructor(
    private readonly runtimeId: string,
    private readonly call: AgentInvoke = invoke
  ) {}

  /** Sends an operation through the optional frame-agent-connectors Rust plugin. */
  request<T>(method: string, params: unknown = {}): Promise<T> {
    if (this.disposed)
      return Promise.reject(new Error('Agent connection is disposed'));
    return this.call('plugin:frame-agent-connectors|request', {
      runtimeId: this.runtimeId,
      method,
      params,
    });
  }

  /** Observes events until unsubscribed or disposed. */
  subscribe(listener: (event: AgentEventEnvelope) => void): () => void {
    if (this.disposed) throw new Error('Agent connection is disposed');
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Delivers a native channel event to this connection's subscribers. */
  receive(event: AgentEventEnvelope): void {
    if (this.disposed) return;
    for (const listener of this.listeners) listener(event);
  }

  /** Releases the host runtime once and stops frontend subscriptions. */
  dispose(): Promise<void> {
    if (!this.disposal) {
      this.disposed = true;
      this.listeners.clear();
      this.disposal = this.call<void>(
        'plugin:frame-agent-connectors|disconnect',
        {runtimeId: this.runtimeId}
      );
    }
    return this.disposal;
  }
}

/** Host-created connection metadata; applications may add their own fields. */
export interface TauriAgentInfo {

  /** Identity returned by the application's explicit native setup command. */
  runtimeId: string;
}

/** Connects through application-owned setup while reusing request/event IPC. */
export async function connectTauriAgent<T extends TauriAgentInfo>(
  connect: (events: Channel<AgentEventEnvelope>) => Promise<T>
): Promise<{info: T; connection: TauriAgentConnection}> {
  const events = new Channel<AgentEventEnvelope>();
  // Native setup creates no provider session; events begin on explicit requests.
  const info = await connect(events);
  const connection = new TauriAgentConnection(info.runtimeId);
  events.onmessage = (event) => connection.receive(event);
  return {info, connection};
}
