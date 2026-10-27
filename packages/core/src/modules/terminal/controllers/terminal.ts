import {readonly, ref, shallowRef} from 'vue';
import type {
  TerminalBackend,
  TerminalCreateOptions,
  TerminalEvent,
  TerminalOptions,
  TerminalProfile,
  TerminalSession,
} from '../types/terminalTypes';

export type {
  TerminalBackend,
  TerminalCreateOptions,
  TerminalEvent,
  TerminalOptions,
  TerminalProfile,
  TerminalSession,
  TerminalSessionLayout,
  TerminalSpawnOptions,
} from '../types/terminalTypes';

/**
 * Owns backend sessions, split groups, output replay, and asynchronous cleanup.
 *
 * Construction is inert: profile discovery and process creation are explicit.
 * Renderers subscribe to session events and keep their own scrollback. Output
 * received before a renderer subscribes is buffered here. Public methods stay
 * bound when used as event handlers or promise callbacks.
 *
 * @example
 * const terminal = new TerminalSessionController({backend});
 * const session = await terminal.create();
 * terminal.rename(session.id, 'Build');
 * await terminal.dispose();
 */
export class TerminalSessionController {

  /** Host options retained for default profile, directory, and link handling. */
  private readonly options: TerminalOptions;

  /** Mutable profile list populated by successful backend discovery. */
  private readonly profileState = shallowRef<TerminalProfile[]>([]);

  /** Mutable metadata for processes not yet successfully closed. */
  private readonly sessionState = shallowRef<TerminalSession[]>([]);

  /** Ordered groups of session IDs displayed together as split panes. */
  private readonly groupState = shallowRef<string[][]>([]);

  /** Selected session ID, independent of whether its process has exited. */
  private readonly activeIdState = ref<string>();

  /** Latest controller-level error reported by UI or backend operations. */
  private readonly errorState = ref('');

  /** Readonly reactive shell profiles available to selection UI. */
  readonly profiles = readonly(this.profileState);

  /** Readonly reactive session metadata; use methods to rename or recolor it. */
  readonly sessions = readonly(this.sessionState);

  /** Readonly reactive split-group ordering shared by terminal presentations. */
  readonly groups = readonly(this.groupState);

  /** Readonly reactive selection shared by session selectors and panes. */
  readonly activeId = readonly(this.activeIdState);

  /** Readonly reactive controller error, cleared explicitly by dismissError(). */
  readonly error = readonly(this.errorState);

  /** Subscribers grouped by backend process identifier. */
  private readonly listeners = new Map<
    string,
    Set<(event: TerminalEvent) => void>
  >();

  /** Output buffered only while a session has no renderer subscribers. */
  private readonly history = new Map<string, number[][]>();

  /** Replay byte counts used to trim old chunks beyond the existing buffer cap. */
  private readonly historyBytes = new Map<string, number>();

  /** In-flight creations awaited before disposal closes retained sessions. */
  private readonly pending = new Set<Promise<unknown>>();

  /** Lazily resolved explicit host backend, shared by controller operations. */
  private backendPromise?: Promise<TerminalBackend>;

  /** Deduplicated profile discovery; failed discovery can be retried. */
  private profilePromise?: Promise<readonly TerminalProfile[]>;

  /** Prevents new discovery or creation after disposal begins. */
  private disposed = false;

  /**
   * Retains an explicit backend without discovering profiles or spawning shells.
   * @throws If the host supplies no execution backend.
   */
  constructor(options: TerminalOptions) {
    if (!options?.backend)
      throw new Error('A TerminalBackend must be supplied explicitly');
    this.options = options;
    this.detectProfiles = this.detectProfiles.bind(this);
    this.create = this.create.bind(this);
    this.close = this.close.bind(this);
    this.activate = this.activate.bind(this);
    this.unsplit = this.unsplit.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.clear = this.clear.bind(this);
    this.dispose = this.dispose.bind(this);
    this.reportError = this.reportError.bind(this);
    this.openUrl = this.openUrl.bind(this);
    this.dismissError = this.dismissError.bind(this);
    this.rename = this.rename.bind(this);
    this.setColor = this.setColor.bind(this);
    this.write = this.write.bind(this);
    this.resize = this.resize.bind(this);
  }

  /** Discovers and caches profiles, allowing a later retry after failure. */
  async detectProfiles(): Promise<readonly TerminalProfile[]> {
    if (this.disposed) throw new Error('Terminal controller is disposed');
    return (this.profilePromise ??= this.backend()
      .then((backend) => backend.profiles())
      .then((result) => {
        this.profileState.value = result;
        return result;
      })
      .catch((cause) => {
        this.profilePromise = undefined;
        throw cause;
      }));
  }

  /**
   * Creates and selects a session, optionally splitting the active group.
   * @param profile - Shell identifier or name; omitted values use host defaults.
   * @param config - Per-process directory and grouping overrides.
   * @throws If disposed, profile selection fails, or the backend cannot spawn.
   */
  create(
    profile = this.options.profile,
    config: TerminalCreateOptions = {}
  ): Promise<TerminalSession> {
    const task = this.spawn(profile, config);
    this.pending.add(task);
    void task.finally(() => this.pending.delete(task)).catch(() => {});
    return task;
  }

  /**
   * Closes a known process and releases its subscriptions, replay, and grouping.
   * Backend failures leave the session intact so closing can be retried.
   */
  async close(id: string): Promise<void> {
    if (!this.sessionState.value.some((session) => session.id === id)) return;
    await (await this.backend()).close(id);
    this.receive(id, {type: 'closed'});
    this.listeners.delete(id);
    this.history.delete(id);
    this.historyBytes.delete(id);
    const previous = this.groupState.value.find((group) => group.includes(id));
    this.sessionState.value = this.sessionState.value.filter(
      (session) => session.id !== id
    );
    this.groupState.value = this.groupState.value
      .map((group) => group.filter((item) => item !== id))
      .filter((group) => group.length);
    if (this.activeIdState.value === id) {
      this.activeIdState.value =
        previous?.find((item) => item !== id) ?? this.groupState.value[0]?.[0];
    }
  }

  /** Selects an existing session; unknown IDs leave the selection unchanged. */
  activate(id: string): void {
    if (this.sessionState.value.some((session) => session.id === id))
      this.activeIdState.value = id;
  }

  /** Separates every member of the active split group into its own group. */
  unsplit(): void {
    const group = this.groupState.value.find((item) =>
      item.includes(this.activeIdState.value ?? '')
    );
    if (group) {
      this.groupState.value = this.groupState.value.flatMap((item) =>
        item === group ? item.map((id) => [id]) : [item]
      );
    }
  }

  /**
   * Subscribes to events and immediately replays buffered output once.
   * @returns An idempotent cleanup that removes only the supplied callback.
   */
  subscribe(id: string, listener: (event: TerminalEvent) => void): () => void {
    const listeners =
      this.listeners.get(id) ?? new Set<(event: TerminalEvent) => void>();
    listeners.add(listener);
    this.listeners.set(id, listeners);
    for (const data of this.history.get(id) ?? [])
      listener({type: 'data', data});
    this.history.delete(id);
    this.historyBytes.delete(id);
    return () => {
      listeners.delete(listener);
    };
  }

  /** Clears replay and asks the selected or supplied session's renderer to clear. */
  clear(id = this.activeIdState.value): void {
    if (id) {
      this.history.delete(id);
      this.historyBytes.delete(id);
      this.receive(id, {type: 'clear'});
    }
  }

  /** Records a readable error without altering session selection or metadata. */
  reportError(cause: unknown): void {
    this.errorState.value =
      cause instanceof Error ? cause.message : String(cause);
  }

  /**
   * Stops creation, waits for pending spawns, and closes retained sessions.
   * A process returned after disposal starts is closed by its pending spawn.
   * @throws The first failed close after all close attempts have settled.
   */
  async dispose(): Promise<void> {
    this.disposed = true;
    await Promise.allSettled([...this.pending]);
    const results = await Promise.allSettled(
      this.sessionState.value.map((session) => this.close(session.id))
    );
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
  }

  /** Opens an HTTP(S) link using the host handler or a protected browser window. */
  async openUrl(url: string): Promise<void> {
    if (!/^https?:\/\//i.test(url))
      throw new Error('Unsupported terminal link');
    if (this.options.openUrl) await this.options.openUrl(url);
    else if (typeof window !== 'undefined')
      window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Clears the controller-level error without changing individual sessions. */
  dismissError(): void {
    this.errorState.value = '';
  }

  /** Trims and bounds a session name; empty names are ignored. */
  rename(id: string, name: string): void {
    if (name.trim()) this.update(id, {name: name.trim().slice(0, 120)});
  }

  /** Updates a session accent only when it is a six-digit hexadecimal color. */
  setColor(id: string, color: string): void {
    if (/^#[\da-f]{6}$/i.test(color)) this.update(id, {color});
  }

  /** Forwards input only while the session is still running. */
  async write(id: string, data: string): Promise<void> {
    if (
      this.sessionState.value.find((session) => session.id === id)?.status ===
      'running'
    ) {
      await (await this.backend()).write(id, data);
    }
  }

  /** Forwards renderer dimensions only while the session is still running. */
  async resize(id: string, cols: number, rows: number): Promise<void> {
    if (
      this.sessionState.value.find((session) => session.id === id)?.status ===
      'running'
    ) {
      await (await this.backend()).resize(id, cols, rows);
    }
  }

  /** Resolves the explicitly supplied backend without introducing host discovery. */
  private backend(): Promise<TerminalBackend> {
    return (this.backendPromise ??= Promise.resolve(this.options.backend));
  }

  /** Replaces matching metadata while retaining every other session's identity. */
  private update(id: string, patch: Partial<TerminalSession>): void {
    this.sessionState.value = this.sessionState.value.map((session) =>
      session.id === id ? {...session, ...patch} : session
    );
  }

  /** Updates lifecycle metadata, buffers unsubscribed output, and notifies listeners. */
  private receive(id: string, event: TerminalEvent): void {
    if (event.type === 'data') {
      if (!this.listeners.get(id)?.size) {
        const chunks = this.history.get(id) ?? [];
        chunks.push(event.data);
        let bytes = (this.historyBytes.get(id) ?? 0) + event.data.length;
        while (bytes > 1024 * 1024 && chunks.length > 1)
          bytes -= chunks.shift()!.length;
        this.history.set(id, chunks);
        this.historyBytes.set(id, bytes);
      }
    } else if (event.type === 'exit')
      this.update(id, {status: 'exited', exitCode: event.code});
    else if (event.type === 'error')
      this.update(id, {status: 'error', error: event.message});
    for (const listener of this.listeners.get(id) ?? []) listener(event);
  }

  /** Resolves a profile and registers a process, preserving early backend events. */
  private async spawn(
    profile: string | undefined,
    config: TerminalCreateOptions
  ): Promise<TerminalSession> {
    if (this.disposed) throw new Error('Terminal controller is disposed');
    const available = await this.detectProfiles();
    const selected = profile
      ? available.find((item) => item.id === profile || item.name === profile)
      : (available.find((item) => item.default) ?? available[0]);
    if (!selected)
      throw new Error(
        profile
          ? `Unknown terminal profile: ${profile}`
          : 'No installed shells were found'
      );
    if (this.disposed) throw new Error('Terminal controller is disposed');
    const bridge = await this.backend();
    const early: TerminalEvent[] = [];
    let sessionId: string | undefined;
    const id = await bridge.spawn(
      {
        profile: selected.id,
        cwd: config.cwd ?? this.options.cwd,
        cols: 80,
        rows: 24,
      },
      (event) =>
        sessionId ? this.receive(sessionId, event) : early.push(event)
    );
    if (this.disposed) {
      await bridge.close(id);
      throw new Error('Terminal controller is disposed');
    }
    const session: TerminalSession = {
      id,
      profile: selected.id,
      name: selected.name,
      status: 'running',
    };
    this.sessionState.value = [...this.sessionState.value, session];
    const group = config.split
      ? this.groupState.value.find((item) =>
          item.includes(this.activeIdState.value ?? '')
        )
      : undefined;
    this.groupState.value = group
      ? this.groupState.value.map((item) =>
          item === group ? [...item, id] : item
        )
      : [...this.groupState.value, [id]];
    this.activeIdState.value = id;
    sessionId = id;
    for (const event of early) this.receive(id, event);
    return session;
  }
}

/** Structural public API supporting class-backed or host-provided controllers. */
export type TerminalController = Pick<
  TerminalSessionController,
  keyof TerminalSessionController
>;

/** Creates an inert, class-backed controller through the existing public API. */
export function createTerminal(options: TerminalOptions): TerminalController {
  return new TerminalSessionController(options);
}
