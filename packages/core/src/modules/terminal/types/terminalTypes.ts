/** One shell profile discovered by the host execution backend. */
export interface TerminalProfile {

  /** Backend identifier used when spawning this shell. */
  id: string;

  /** Display name shown by profile selectors and new sessions. */
  name: string;

  /** Executable path supplied by the host for display or diagnostics. */
  path: string;

  /** Whether this profile is preferred when the host specifies no default. */
  default: boolean;
}

/**
 * Backend output and lifecycle messages delivered to terminal subscribers.
 * Data contains bytes for xterm. Clear and closed are controller notifications
 * used to clear retained output or release a renderer after a successful close.
 */
export type TerminalEvent =
  | {type: 'data'; data: number[]}
  | {type: 'exit'; code: number}
  | {type: 'error'; message: string}
  | {type: 'clear'}
  | {type: 'closed'};

/** Host execution parameters for creating one terminal process. */
export interface TerminalSpawnOptions {

  /** Detected profile identifier selected by the controller. */
  profile: string;

  /** Working directory, interpreted by the host backend. */
  cwd?: string;

  /** Initial character columns before the mounted renderer reports its size. */
  cols: number;

  /** Initial character rows before the mounted renderer reports its size. */
  rows: number;
}

/**
 * Explicit host execution boundary; Core does not spawn processes itself.
 * The backend owns process transport and delivers events through spawn's
 * callback, including output received before the spawn promise resolves.
 */
export interface TerminalBackend {

  /** Discovers shells available on this host. */
  profiles(): Promise<TerminalProfile[]>;

  /** Starts a process and resolves its identifier; events may arrive early. */
  spawn(
    options: TerminalSpawnOptions,
    receive: (event: TerminalEvent) => void
  ): Promise<string>;

  /** Sends input to an existing process. */
  write(id: string, data: string): Promise<void>;

  /** Updates the process character dimensions after renderer fitting. */
  resize(id: string, cols: number, rows: number): Promise<void>;

  /** Closes a process; rejection leaves its controller session available to retry. */
  close(id: string): Promise<void>;
}

/** Presentation metadata for one process retained by a terminal controller. */
export interface TerminalSession {

  /** Backend process identifier used by controller operations. */
  id: string;

  /** Profile identifier from which this session was created. */
  profile: string;

  /** User-editable session name, initially the profile display name. */
  name: string;

  /** Optional six-digit hexadecimal session accent. */
  color?: string;

  /** Latest process state; exited sessions remain until explicitly closed. */
  status: 'running' | 'exited' | 'error';

  /** Exit code supplied by the backend when the process finishes. */
  exitCode?: number;

  /** Latest backend error associated with this session. */
  error?: string;
}

/** Host configuration retained by one terminal controller. */
export interface TerminalOptions {

  /** Explicit execution adapter; constructing a controller starts no process. */
  backend: TerminalBackend;

  /** Default shell identifier or display name, before detected preference. */
  profile?: string;

  /** Default working directory for newly created sessions. */
  cwd?: string;

  /** Optional host link opener; omitted handlers use a browser window. */
  openUrl?: (url: string) => Promise<void>;
}

/** Per-creation presentation and execution overrides. */
export interface TerminalCreateOptions {

  /** Adds the new process to the active split group instead of a new group. */
  split?: boolean;

  /** Overrides the controller's default working directory for this process. */
  cwd?: string;
}

/** Presentation mode for selecting terminal session groups. */
export type TerminalSessionLayout = 'sidebar' | 'tabs';
