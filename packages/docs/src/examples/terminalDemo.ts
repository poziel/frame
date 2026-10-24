import type { TerminalBackend, TerminalEvent } from '@frame/features';
/** Browser documentation demonstration. This does not run operating-system commands. */
export function createDemoTerminalBackend(): TerminalBackend {
  let next = 0;
  const sessions = new Map<string, { receive: (event: TerminalEvent) => void; line: string }>();
  const send = (receive: (event: TerminalEvent) => void, text: string) => receive({ type: 'data', data: [...new TextEncoder().encode(text)] });
  return {
    async profiles() { return [{ id: 'demo', name: 'Browser demo', path: '', default: true }]; },
    async spawn(_options, receive) {
      const id = String(++next); sessions.set(id, { receive, line: '' });
      send(receive, 'Frame browser terminal demo. No system commands are executed.\r\nType help, echo <text>, or clear.\r\n> '); return id;
    },
    async write(id, data) {
      const session = sessions.get(id); if (!session) return;
      for (const char of data) {
        if (char === '\r') {
          const line = session.line.trim(); session.line = ''; send(session.receive, '\r\n');
          if (line === 'clear') session.receive({ type: 'clear' });
          else if (line === 'help') send(session.receive, 'help — show commands; echo <text> — print text; clear — clear display\r\n');
          else if (line.startsWith('echo ')) send(session.receive, line.slice(5) + '\r\n');
          else if (line) send(session.receive, 'Unknown demo command. Type help.\r\n');
          send(session.receive, '> ');
        } else if (char === '\x7f') { if (session.line) { session.line = session.line.slice(0, -1); send(session.receive, '\b \b'); } }
        else if (char >= ' ') { session.line += char; send(session.receive, char); }
      }
    },
    async resize() {},
    async close(id) { sessions.delete(id); },
  };
}
