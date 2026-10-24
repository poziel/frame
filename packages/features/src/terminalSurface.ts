import { Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import type { TerminalController } from './terminal';
import '@xterm/xterm/css/xterm.css';

const surfaces = new WeakMap<TerminalController, Map<string, TerminalSurface>>();
export function terminalSurface(controller: TerminalController, id: string): TerminalSurface {
  let map = surfaces.get(controller);
  if (!map) { map = new Map(); surfaces.set(controller, map); }
  const existing = map.get(id);
  if (existing) return existing;
  const element = document.createElement('div'); element.className = 'frame-terminal-screen';
  const terminal = new XTerminal({
    cursorBlink: true, scrollback: 5000, fontSize: 13,
    fontFamily: 'Cascadia Mono, Consolas, monospace',
    theme: { background: '#181818', foreground: '#cccccc', cursor: '#cccccc', selectionBackground: '#264f78' },
    allowProposedApi: false,
    linkHandler: { activate: openLink },
  });
  function openLink(event: MouseEvent, uri: string) {
    if (!(event.ctrlKey || event.metaKey) || !/^https?:\/\//i.test(uri)) return;
    void controller.openUrl(uri).catch(controller.reportError);
  }
  const fit = new FitAddon(), search = new SearchAddon();
  terminal.loadAddon(fit); terminal.loadAddon(search); terminal.loadAddon(new WebLinksAddon(openLink));
  terminal.open(element);
  let onFind: (() => void) | undefined;
  let writes = Promise.resolve();
  const input = terminal.onData(data => { writes = writes.then(() => controller.write(id, data)).catch(controller.reportError); });
  terminal.attachCustomKeyEventHandler(event => {
    if (event.type !== 'keydown') return true;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && onFind) { event.preventDefault(); onFind(); return false; }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      if (terminal.hasSelection()) void navigator.clipboard.writeText(terminal.getSelection()).catch(controller.reportError);
      return false;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'v') {
      event.preventDefault(); void navigator.clipboard.readText().then(text => terminal.paste(text)).catch(controller.reportError); return false;
    }
    return true;
  });
  let observer: ResizeObserver | undefined;
  let frame = 0, host: HTMLElement | undefined;
  let dimensions = '', resizing = Promise.resolve();
  function resize() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!host?.isConnected || host.clientWidth < 20 || host.clientHeight < 20) return;
      fit.fit();
      const next = `${terminal.cols}:${terminal.rows}`;
      if (next === dimensions) return;
      dimensions = next;
      const cols = terminal.cols, rows = terminal.rows;
      resizing = resizing.then(() => controller.resize(id, cols, rows)).catch(controller.reportError);
    });
  }
  const unsubscribe = controller.subscribe(id, event => {
    if (event.type === 'data') terminal.write(new Uint8Array(event.data));
    else if (event.type === 'clear') terminal.write('', () => terminal.clear());
    else if (event.type === 'closed') surface.dispose();
  });
  const surface = {
    attach(target: HTMLElement, find?: () => void) {
      observer?.disconnect(); host = target; onFind = find; target.appendChild(element);
      observer = new ResizeObserver(resize); observer.observe(target); resize();
    },
    detach(target: HTMLElement) {
      if (host !== target) return;
      observer?.disconnect(); cancelAnimationFrame(frame); onFind = undefined;
      element.remove(); host = undefined;
    },
    focus() { terminal.focus(); },
    search(query: string, previous = false) { return query ? previous ? search.findPrevious(query) : search.findNext(query) : (search.clearDecorations(), true); },
    dispose() { observer?.disconnect(); cancelAnimationFrame(frame); unsubscribe(); input.dispose(); terminal.dispose(); element.remove(); map!.delete(id); },
  };
  map.set(id, surface); return surface;
}
export type TerminalSurface = { attach(host: HTMLElement, find?: () => void): void; detach(host: HTMLElement): void; focus(): void; search(query: string, previous?: boolean): boolean; dispose(): void };
