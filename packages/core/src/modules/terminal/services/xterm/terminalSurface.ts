import {Terminal as XTerminal, type IDisposable} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {SearchAddon} from '@xterm/addon-search';
import {WebLinksAddon} from '@xterm/addon-web-links';
import type {TerminalController} from '../../controllers/terminal';
import type {TerminalEvent} from '../../types/terminalTypes';
import '@xterm/xterm/css/xterm.css';

/** Retained surfaces are isolated by controller and backend session identity. */
const surfaces = new WeakMap<
  TerminalController,
  Map<string, TerminalSurface>
>();

/**
 * Owns one retained xterm renderer and its DOM, addons, queues, and subscription.
 *
 * Detachment removes presentation and observation while preserving scrollback
 * and backend output delivery. Session close disposes the renderer and removes
 * its cache entry. Use terminalSurface() to reuse the same renderer on reopen.
 */
export class TerminalSurface {

  /** Controller owning process execution and error reporting. */
  private readonly controller: TerminalController;

  /** Backend session rendered by this surface. */
  private readonly id: string;

  /** Removes this surface from its controller's retained-renderer cache. */
  private readonly release: () => void;

  /** Persistent renderer element moved between presentation hosts. */
  private readonly element: HTMLDivElement;

  /** xterm instance retaining screen contents and scrollback across detachment. */
  private readonly terminal: XTerminal;

  /** Measures and applies character dimensions from the current DOM host. */
  private readonly fit: FitAddon;

  /** Search decorations and forward/backward matching for this renderer. */
  private readonly searchAddon: SearchAddon;

  /** Releases the xterm input listener when the process surface is disposed. */
  private readonly input: IDisposable;

  /** Releases backend output delivery when the process surface is disposed. */
  private readonly unsubscribe: () => void;

  /** Current presentation's callback for opening its search UI. */
  private onFind?: () => void;

  /** Serializes backend writes without losing subsequent input after a failure. */
  private writes = Promise.resolve();

  /** Observer attached only to the currently mounted presentation host. */
  private observer?: ResizeObserver;

  /** Scheduled fitting frame, cancelled on detachment or disposal. */
  private frame = 0;

  /** Current host, used to reject cleanup from an older presentation. */
  private host?: HTMLElement;

  /** Last fitted character dimensions, avoiding duplicate backend resizes. */
  private dimensions = '';

  /** Serializes backend resize requests independently of input writes. */
  private resizing = Promise.resolve();

  /**
   * Creates a renderer and subscribes to its process without mounting a host.
   * @param controller - Process owner whose events and operations drive xterm.
   * @param id - Session identifier retained by the controller.
   * @param release - Cache cleanup invoked when this renderer is disposed.
   */
  constructor(controller: TerminalController, id: string, release: () => void) {
    this.controller = controller;
    this.id = id;
    this.release = release;
    this.attach = this.attach.bind(this);
    this.detach = this.detach.bind(this);
    this.focus = this.focus.bind(this);
    this.search = this.search.bind(this);
    this.dispose = this.dispose.bind(this);
    this.openLink = this.openLink.bind(this);
    this.resize = this.resize.bind(this);
    this.element = document.createElement('div');
    this.element.className = 'frame-terminal-screen';
    this.terminal = new XTerminal({
      cursorBlink: true,
      scrollback: 5000,
      fontSize: 13,
      fontFamily: 'Cascadia Mono, Consolas, monospace',
      theme: {
        background: '#181818',
        foreground: '#cccccc',
        cursor: '#cccccc',
        selectionBackground: '#264f78',
      },
      allowProposedApi: false,
      linkHandler: {activate: this.openLink},
    });
    this.fit = new FitAddon();
    this.searchAddon = new SearchAddon();
    this.terminal.loadAddon(this.fit);
    this.terminal.loadAddon(this.searchAddon);
    this.terminal.loadAddon(new WebLinksAddon(this.openLink));
    this.terminal.open(this.element);
    this.input = this.terminal.onData((data) => {
      this.writes = this.writes
        .then(() => this.controller.write(this.id, data))
        .catch(this.controller.reportError);
    });
    this.terminal.attachCustomKeyEventHandler((event) => this.key(event));
    this.unsubscribe = this.controller.subscribe(this.id, (event) =>
      this.receive(event)
    );
  }

  /** Moves the retained element into a host and starts observing its dimensions. */
  attach(target: HTMLElement, find?: () => void): void {
    this.observer?.disconnect();
    this.host = target;
    this.onFind = find;
    target.appendChild(this.element);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(target);
    this.resize();
  }

  /** Stops presentation for the current host without disposing xterm or its output. */
  detach(target: HTMLElement): void {
    if (this.host !== target) return;
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.onFind = undefined;
    this.element.remove();
    this.host = undefined;
  }

  /** Focuses the retained xterm input element. */
  focus(): void {
    this.terminal.focus();
  }

  /** Finds a match in either direction, or clears decorations for an empty query. */
  search(query: string, previous = false): boolean {
    return query
      ? previous
        ? this.searchAddon.findPrevious(query)
        : this.searchAddon.findNext(query)
      : (this.searchAddon.clearDecorations(), true);
  }

  /** Releases observers, event delivery, xterm resources, DOM, and cache ownership. */
  dispose(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.unsubscribe();
    this.input.dispose();
    this.terminal.dispose();
    this.element.remove();
    this.release();
  }

  /** Opens HTTP(S) links only when the host activation modifier is held. */
  private openLink(event: MouseEvent, uri: string): void {
    if (!(event.ctrlKey || event.metaKey) || !/^https?:\/\//i.test(uri)) return;
    void this.controller.openUrl(uri).catch(this.controller.reportError);
  }

  /** Handles search and explicit clipboard shortcuts before xterm processes input. */
  private key(event: KeyboardEvent): boolean {
    if (event.type !== 'keydown') return true;
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'f' &&
      this.onFind
    ) {
      event.preventDefault();
      this.onFind();
      return false;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === 'c'
    ) {
      event.preventDefault();
      if (this.terminal.hasSelection()) {
        void navigator.clipboard
          .writeText(this.terminal.getSelection())
          .catch(this.controller.reportError);
      }
      return false;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === 'v'
    ) {
      event.preventDefault();
      void navigator.clipboard
        .readText()
        .then((text) => this.terminal.paste(text))
        .catch(this.controller.reportError);
      return false;
    }
    return true;
  }

  /** Fits visible hosts on the next frame and queues changed backend dimensions. */
  private resize(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      if (
        !this.host?.isConnected ||
        this.host.clientWidth < 20 ||
        this.host.clientHeight < 20
      )
        return;
      this.fit.fit();
      const next = `${this.terminal.cols}:${this.terminal.rows}`;
      if (next === this.dimensions) return;
      this.dimensions = next;
      const cols = this.terminal.cols,
        rows = this.terminal.rows;
      this.resizing = this.resizing
        .then(() => this.controller.resize(this.id, cols, rows))
        .catch(this.controller.reportError);
    });
  }

  /** Applies output and clear events; session closure releases this renderer. */
  private receive(event: TerminalEvent): void {
    if (event.type === 'data') this.terminal.write(new Uint8Array(event.data));
    else if (event.type === 'clear')
      this.terminal.write('', () => this.terminal.clear());
    else if (event.type === 'closed') this.dispose();
  }
}

/** Reuses the retained surface for a controller/session pair, creating it lazily. */
export function terminalSurface(
  controller: TerminalController,
  id: string
): TerminalSurface {
  let map = surfaces.get(controller);
  if (!map) {
    map = new Map();
    surfaces.set(controller, map);
  }
  const existing = map.get(id);
  if (existing) return existing;
  const surface = new TerminalSurface(controller, id, () => map!.delete(id));
  map.set(id, surface);
  return surface;
}
