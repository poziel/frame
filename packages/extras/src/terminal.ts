import { readonly, ref, shallowRef } from 'vue';

export interface TerminalProfile { id: string; name: string; path: string; default: boolean }
export type TerminalEvent = { type: 'data'; data: number[] } | { type: 'exit'; code: number } | { type: 'error'; message: string } | { type: 'clear' } | { type: 'closed' };
export interface TerminalSpawnOptions { profile: string; cwd?: string; cols: number; rows: number }
/** The native bridge is replaceable so a future remote backend need not change the UI. */
export interface TerminalBackend {
  profiles(): Promise<TerminalProfile[]>;
  spawn(options: TerminalSpawnOptions, receive: (event: TerminalEvent) => void): Promise<string>;
  write(id: string, data: string): Promise<void>;
  resize(id: string, cols: number, rows: number): Promise<void>;
  close(id: string): Promise<void>;
}
export interface TerminalSession {
  id: string; profile: string; name: string; color?: string;
  status: 'running' | 'exited' | 'error'; exitCode?: number; error?: string;
}
export interface TerminalOptions { backend?: TerminalBackend; profile?: string; cwd?: string }
export type TerminalSessionLayout = 'sidebar' | 'tabs';

export function createTerminal(options: TerminalOptions = {}) {
  const profiles = shallowRef<TerminalProfile[]>([]);
  const sessions = shallowRef<TerminalSession[]>([]);
  const groups = shallowRef<string[][]>([]);
  const activeId = ref<string>();
  const error = ref('');
  const listeners = new Map<string, Set<(event: TerminalEvent) => void>>();
  const history = new Map<string, number[][]>();
  const historyBytes = new Map<string, number>();
  const pending = new Set<Promise<unknown>>();
  let backendPromise: Promise<TerminalBackend> | undefined;
  let profilePromise: Promise<readonly TerminalProfile[]> | undefined;
  let disposed = false;
  const backend = () => backendPromise ??= options.backend ? Promise.resolve(options.backend) : import('./terminalTauri').then(m => m.createTauriTerminalBackend());
  function update(id: string, patch: Partial<TerminalSession>) {
    sessions.value = sessions.value.map(s => s.id === id ? { ...s, ...patch } : s);
  }
  function receive(id: string, event: TerminalEvent) {
    if (event.type === 'data') {
      // Replay only until a renderer subscribes; the retained xterm surface owns scrollback afterwards.
      if (!listeners.get(id)?.size) {
        const chunks = history.get(id) ?? [];
        chunks.push(event.data);
        let bytes = (historyBytes.get(id) ?? 0) + event.data.length;
        while (bytes > 1024 * 1024 && chunks.length > 1) bytes -= chunks.shift()!.length;
        history.set(id, chunks); historyBytes.set(id, bytes);
      }
    } else if (event.type === 'exit') update(id, { status: 'exited', exitCode: event.code });
    else if (event.type === 'error') update(id, { status: 'error', error: event.message });
    for (const listener of listeners.get(id) ?? []) listener(event);
  }
  async function detectProfiles() {
    if (disposed) throw new Error('Terminal controller is disposed');
    return profilePromise ??= backend().then(b => b.profiles()).then(result => { profiles.value = result; return result; }).catch(cause => { profilePromise = undefined; throw cause; });
  }
  function create(profile = options.profile, config: { split?: boolean; cwd?: string } = {}) {
    const task = (async () => {
      if (disposed) throw new Error('Terminal controller is disposed');
      const available = await detectProfiles();
      const selected = profile ? available.find(p => p.id === profile || p.name === profile) : available.find(p => p.default) ?? available[0];
      if (!selected) throw new Error(profile ? `Unknown terminal profile: ${profile}` : 'No installed shells were found');
      if (disposed) throw new Error('Terminal controller is disposed');
      const bridge = await backend();
      const early: TerminalEvent[] = [];
      let sessionId: string | undefined;
      const id = await bridge.spawn({ profile: selected.id, cwd: config.cwd ?? options.cwd, cols: 80, rows: 24 }, event => sessionId ? receive(sessionId, event) : early.push(event));
      if (disposed) { await bridge.close(id); throw new Error('Terminal controller is disposed'); }
      const session: TerminalSession = { id, profile: selected.id, name: selected.name, status: 'running' };
      sessions.value = [...sessions.value, session];
      const group = config.split ? groups.value.find(g => g.includes(activeId.value ?? '')) : undefined;
      groups.value = group ? groups.value.map(g => g === group ? [...g, id] : g) : [...groups.value, [id]];
      activeId.value = id;
      sessionId = id;
      for (const event of early) receive(id, event);
      return session;
    })();
    pending.add(task); void task.finally(() => pending.delete(task)).catch(() => {});
    return task;
  }
  async function close(id: string) {
    if (!sessions.value.some(s => s.id === id)) return;
    await (await backend()).close(id);
    receive(id, { type: 'closed' }); listeners.delete(id); history.delete(id); historyBytes.delete(id);
    const previous = groups.value.find(g => g.includes(id));
    sessions.value = sessions.value.filter(s => s.id !== id);
    groups.value = groups.value.map(g => g.filter(item => item !== id)).filter(g => g.length);
    if (activeId.value === id) activeId.value = previous?.find(item => item !== id) ?? groups.value[0]?.[0];
  }
  function activate(id: string) { if (sessions.value.some(s => s.id === id)) activeId.value = id; }
  function unsplit() {
    const group = groups.value.find(g => g.includes(activeId.value ?? ''));
    if (group) groups.value = groups.value.flatMap(g => g === group ? g.map(id => [id]) : [g]);
  }
  function subscribe(id: string, listener: (event: TerminalEvent) => void) {
    const set = listeners.get(id) ?? new Set(); set.add(listener); listeners.set(id, set);
    for (const data of history.get(id) ?? []) listener({ type: 'data', data });
    history.delete(id); historyBytes.delete(id);
    return () => { set.delete(listener); };
  }
  function clear(id = activeId.value) { if (id) { history.delete(id); historyBytes.delete(id); receive(id, { type: 'clear' }); } }
  function reportError(cause: unknown) { error.value = cause instanceof Error ? cause.message : String(cause); }
  async function dispose() {
    disposed = true;
    await Promise.allSettled([...pending]);
    const results = await Promise.allSettled(sessions.value.map(s => close(s.id)));
    const failed = results.find(r => r.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
  }
  return {
    profiles: readonly(profiles), sessions: readonly(sessions), groups: readonly(groups), activeId: readonly(activeId), error: readonly(error),
    detectProfiles, create, close, activate, unsplit, subscribe, clear, dispose, reportError,
    dismissError: () => { error.value = ''; },
    rename(id: string, name: string) { if (name.trim()) update(id, { name: name.trim().slice(0, 120) }); },
    setColor(id: string, color: string) { if (/^#[\da-f]{6}$/i.test(color)) update(id, { color }); },
    async write(id: string, data: string) { if (sessions.value.find(s => s.id === id)?.status === 'running') await (await backend()).write(id, data); },
    async resize(id: string, cols: number, rows: number) { if (sessions.value.find(s => s.id === id)?.status === 'running') await (await backend()).resize(id, cols, rows); },
  };
}
export type TerminalController = ReturnType<typeof createTerminal>;
