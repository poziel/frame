import {expect, test} from 'bun:test';
import {createAgentChatSession} from '../packages/core/src/modules/chat/services/agents/agentChatSession';
import {createJsonLineAgentConnection} from '../packages/core/src/modules/chat/services/agents/jsonLineAgentConnection';
import type {
  AgentConnection,
  AgentEventEnvelope,
} from '../packages/core/src/modules/chat/types/agentTypes';

test('host-prepared reference bytes reach the native turn, including attachment-only messages', async () => {
  let listener: ((event: AgentEventEnvelope) => void) | undefined;
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {
        listener = undefined;
      };
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      if (method === 'session/create') {
        expect(
          (params as Record<string, unknown>).prepareAttachments
        ).toBeUndefined();
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'codex',
          capabilities: {},
        } as T;
      }
      if (method === 'turn/send') {
        const turn = params as {turnId: string; references: unknown};
        expect(turn.references).toEqual([{name: 'ref.txt', data: 'cmVm'}]);
        listener?.({
          sessionId: 's',
          turnId: turn.turnId,
          type: 'completed',
          status: 'completed',
        });
      }
      return undefined as T;
    },
  };
  const native = await createAgentChatSession(connection, {
    provider: 'codex',
    applicationId: 'app',
    cwd: '.',
    prepareAttachments: async (attachments) => {
      expect(await attachments[0]!.files![0]!.text()).toBe('ref');
      return [{name: 'ref.txt', data: 'cmVm'}];
    },
  });
  native.chat.state.attachments = [
    {
      id: 'ref',
      name: 'ref.txt',
      kind: 'file',
      files: [new File(['ref'], 'ref.txt')],
    },
  ];
  expect(await native.chat.send()).toBe(true);
  expect(native.chat.state.messages[1]?.status).toBe('complete');
  await native.dispose();
});

test('JSONL bridge frames chunks and correlates concurrent responses', async () => {
  let receive!: (chunk: string) => void;
  const lines: string[] = [];
  const connection = createJsonLineAgentConnection({
    write: (line) => {
      lines.push(line);
    },
    subscribe: (listener) => {
      receive = listener;
      return () => {};
    },
  });
  const events: AgentEventEnvelope[] = [];
  connection.subscribe((event) => events.push(event));
  const first = connection.request<string>('first', {});
  const second = connection.request<string>('second', {});
  const a = JSON.parse(lines[0]!);
  const b = JSON.parse(lines[1]!);
  receive(JSON.stringify({id: b.id, result: 'b'}) + '\n' + '{"id":');
  receive(JSON.stringify(a.id) + ',"result":"a"}\n');
  expect(await first).toBe('a');
  expect(await second).toBe('b');
  receive(
    JSON.stringify({
      method: 'event',
      params: {type: 'status', sessionId: 's', turnId: 't', message: 'hello'},
    }) + '\n'
  );
  expect(events).toHaveLength(1);
  connection.dispose();
});

test('chat subscribes before send and authoritative snapshots replace streamed text', async () => {
  let listener: ((event: AgentEventEnvelope) => void) | undefined;
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {
        listener = undefined;
      };
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      if (method === 'session/create')
        return {
          sessionId: 'handle',
          providerSessionId: 'remote',
          provider: 'gemini',
          capabilities: {},
        } as T;
      if (method === 'turn/send') {
        const {turnId} = params as {turnId: string};
        expect(listener).toBeDefined();
        const emit = (event: object) =>
          listener?.({
            sessionId: 'handle',
            turnId,
            ...event,
          } as AgentEventEnvelope);
        emit({
          type: 'message',
          id: 'm',
          text: 'draft',
          phase: 'intermediate',
          delta: true,
        });
        emit({
          type: 'message',
          id: 'm',
          text: 'Correct answer',
          phase: 'final',
          delta: false,
        });
        emit({
          type: 'artifact',
          id: 'file',
          name: 'secret',
          path: 'C:/secret.txt',
        });
        emit({type: 'completed', status: 'completed'});
      }
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'gemini',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Hello';
  await chat.send();
  expect(chat.state.messages[1]!.parts).toHaveLength(1);
  expect({...chat.state.messages[1]!.parts[0]}).toMatchObject({
    type: 'message',
    text: 'Correct answer',
    phase: 'final',
  });
  expect(chat.state.messages[1]!.status).toBe('complete');
  expect(listener).toBeUndefined();
  await dispose();
});

test('stop cancels its turn and suppresses late interaction responses', async () => {
  let listener: ((event: AgentEventEnvelope) => void) | undefined;
  let turnId = '';
  const calls: {method: string; params: unknown}[] = [];
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {
        listener = undefined;
      };
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      calls.push({method, params});
      if (method === 'session/create')
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'codex',
          capabilities: {},
        } as T;
      if (method === 'turn/send') turnId = (params as {turnId: string}).turnId;
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'codex',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Go';
  const sent = chat.send();
  listener!({
    sessionId: 's',
    turnId,
    type: 'approval',
    requestId: 'a',
    text: 'Run shell?',
  });
  listener!({
    sessionId: 's',
    turnId,
    type: 'approval',
    requestId: 'a',
    text: 'Duplicate',
  });
  expect(chat.state.messages[1]!.parts).toHaveLength(1);
  expect(
    calls.filter((call) => call.method === 'interaction/respond')
  ).toHaveLength(0);
  const late = listener!;
  chat.stop();
  await sent;
  await Promise.resolve();
  late({
    sessionId: 's',
    turnId,
    type: 'message',
    id: 'm',
    text: 'late',
    phase: 'final',
    delta: true,
  });
  expect(chat.state.messages[1]!.status).toBe('stopped');
  expect(calls.filter((call) => call.method === 'turn/cancel')).toEqual([
    {method: 'turn/cancel', params: {sessionId: 's', turnId}},
  ]);
  expect(
    calls.filter((call) => call.method === 'interaction/respond')
  ).toHaveLength(0);
  expect(listener).toBeUndefined();
  await dispose();
});

test('JSONL bridge rejects RPC errors, timeouts and disposal without leaking pending calls', async () => {
  let receive!: (chunk: string) => void;
  let last = '';
  let unsubscribed = false;
  const connection = createJsonLineAgentConnection(
    {
      write(line) {
        last = line;
      },
      subscribe(listener) {
        receive = listener;
        return () => {
          unsubscribed = true;
        };
      },
    },
    {timeoutMs: 10, maxBufferLength: 200}
  );
  const failed = connection.request('fail', {});
  receive(
    JSON.stringify({id: JSON.parse(last).id, error: {message: 'Denied'}}) + '\n'
  );
  await expect(failed).rejects.toThrow('Denied');
  await expect(connection.request('timeout', {})).rejects.toThrow('timed out');
  const disposed = connection.request('pending', {});
  connection.dispose();
  await expect(disposed).rejects.toThrow('disposed');
  expect(unsubscribed).toBe(true);
  await expect(connection.request('late', {})).rejects.toThrow('disposed');
});

test('artifact resolver must authorize paths and finishes before the chat completes', async () => {
  let listener: ((event: AgentEventEnvelope) => void) | undefined;
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {
        listener = undefined;
      };
    },
    async request<T>(method, params): Promise<T> {
      if (method === 'session/create')
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'claude',
          capabilities: {},
        } as T;
      if (method === 'turn/send') {
        const {turnId} = params as {turnId: string};
        listener!({
          type: 'artifact',
          sessionId: 's',
          turnId,
          id: 'a',
          name: 'file',
          path: '/private/file.txt',
        });
        listener!({
          type: 'completed',
          sessionId: 's',
          turnId,
          status: 'completed',
        });
      }
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'claude',
    applicationId: 'app',
    cwd: '.',
    async resolveArtifact(event) {
      expect(event.path).toBe('/private/file.txt');
      return {name: 'Authorized', url: 'blob:authorized', kind: 'file'};
    },
  });
  chat.state.draft = 'Go';
  await chat.send();
  expect(chat.state.messages[1]!.parts).toHaveLength(1);
  expect({...chat.state.messages[1]!.parts[0]}).toMatchObject({
    type: 'artifact',
    name: 'Authorized',
    url: 'blob:authorized',
  });
  await dispose();
});

test('explicit approvals and questions reply once to the matching native turn', async () => {
  let listener: ((event: AgentEventEnvelope) => void) | undefined;
  let turnId = '';
  const replies: unknown[] = [];
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {
        listener = undefined;
      };
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      if (method === 'session/create')
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'copilot',
          capabilities: {},
        } as T;
      if (method === 'turn/send') turnId = (params as {turnId: string}).turnId;
      if (method === 'interaction/respond') replies.push(params);
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'copilot',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Go';
  const sent = chat.send();
  listener!({
    sessionId: 'other',
    turnId,
    type: 'approval',
    requestId: 'foreign',
    text: 'Ignore',
  });
  listener!({
    sessionId: 's',
    turnId,
    type: 'approval',
    requestId: 'permission',
    text: 'Run?',
  });
  const approval = chat.state.messages[1]!.parts[0]!;
  expect(chat.resolveApproval(approval.id, 'deny')).toBe(true);
  await Promise.resolve();
  await Promise.resolve();
  listener!({
    sessionId: 's',
    turnId,
    type: 'questions',
    requestId: 'question',
    text: 'Choose',
    questions: [{id: 'q', text: 'Which?', choices: [{id: 'x', label: 'X'}]}],
  });
  const question = chat.state.messages[1]!.parts[1]!;
  expect(
    chat.answerQuestions(question.id, [{questionId: 'q', choiceIds: ['x']}])
  ).toBe(true);
  await Promise.resolve();
  await Promise.resolve();
  expect(replies).toEqual([
    {
      sessionId: 's',
      turnId,
      requestId: 'permission',
      response: {type: 'approval', decision: 'deny'},
    },
    {
      sessionId: 's',
      turnId,
      requestId: 'question',
      response: {
        type: 'answers',
        answers: [{questionId: 'q', choiceIds: ['x']}],
      },
    },
  ]);
  const late = listener!;
  listener!({sessionId: 's', turnId, type: 'completed', status: 'completed'});
  late({
    sessionId: 's',
    turnId,
    type: 'completed',
    status: 'failed',
    error: 'duplicate',
  });
  await sent;
  expect(chat.state.messages[1]!.status).toBe('complete');
  await dispose();
});

test('oversized JSONL frames close the connection and provider failures surface in chat', async () => {
  let receive!: (chunk: string) => void;
  const framed = createJsonLineAgentConnection(
    {
      write() {},
      subscribe(next) {
        receive = next;
        return () => {};
      },
    },
    {maxBufferLength: 5}
  );
  const pending = framed.request('test', {});
  receive('123456');
  await expect(pending).rejects.toThrow('limit');
  let listener!: (event: AgentEventEnvelope) => void;
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {};
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      if (method === 'session/create')
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'opencode',
          capabilities: {},
        } as T;
      if (method === 'turn/send')
        listener({
          sessionId: 's',
          turnId: (params as {turnId: string}).turnId,
          type: 'completed',
          status: 'failed',
          error: 'Provider disconnected',
        });
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'opencode',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Go';
  await chat.send();
  expect(chat.state.messages[1]!.status).toBe('error');
  expect(chat.state.messages[1]!.error).toBe('Provider disconnected');
  await dispose();
});

test('turn/send uses its own timeout while ordinary RPCs retain their deadline', async () => {
  const connection = createJsonLineAgentConnection(
    {
      write() {},
      subscribe() {
        return () => {};
      },
    },
    {timeoutMs: 5, turnTimeoutMs: 1000}
  );
  const turn = connection.request('turn/send', {});
  let turnFailed = false;
  void turn.catch(() => {
    turnFailed = true;
  });
  await expect(connection.request('session/list', {})).rejects.toThrow(
    'timed out'
  );
  expect(turnFailed).toBe(false);
  connection.dispose();
  await expect(turn).rejects.toThrow('disposed');
});

test('attachments fail explicitly before a native turn starts', async () => {
  const methods: string[] = [];
  const connection: AgentConnection = {
    subscribe() {
      return () => {};
    },
    async request<T>(method: string): Promise<T> {
      methods.push(method);
      return {
        sessionId: 's',
        providerSessionId: 'p',
        provider: 'codex',
        capabilities: {},
      } as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'codex',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Read this';
  chat.state.attachments = [{id: 'file', name: 'context.txt', kind: 'file'}];
  await chat.send();
  expect(chat.state.messages[1]!.status).toBe('error');
  expect(chat.state.messages[1]!.error).toContain('attachments');
  expect(methods).toEqual(['session/create']);
  await dispose();
});

test('native chats reject clear and rewind before changing either history', async () => {
  let listener!: (event: AgentEventEnvelope) => void;
  const methods: string[] = [];
  const connection: AgentConnection = {
    subscribe(next) {
      listener = next;
      return () => {};
    },
    async request<T>(method: string, params: unknown): Promise<T> {
      methods.push(method);
      if (method === 'session/create')
        return {
          sessionId: 's',
          providerSessionId: 'p',
          provider: 'gemini',
          capabilities: {},
        } as T;
      if (method === 'turn/send')
        listener({
          sessionId: 's',
          turnId: (params as {turnId: string}).turnId,
          type: 'completed',
          status: 'completed',
        });
      return undefined as T;
    },
  };
  const {chat, dispose} = await createAgentChatSession(connection, {
    provider: 'gemini',
    applicationId: 'app',
    cwd: '.',
  });
  chat.state.draft = 'Remember this';
  await chat.send();
  const history = JSON.stringify(chat.state.messages);
  expect(() => chat.rewind(chat.state.messages[0]!.id)).toThrow(
    'native session'
  );
  expect(() => chat.clear()).toThrow('native session');
  expect(JSON.stringify(chat.state.messages)).toBe(history);
  expect(chat.state.rewindId).toBeUndefined();
  expect(methods.filter((method) => method === 'turn/send')).toHaveLength(1);
  chat.state.messages.splice(0, 1);
  chat.state.draft = 'Continue';
  const before = JSON.stringify(chat.state.messages);
  await expect(chat.send()).rejects.toThrow('history');
  expect(JSON.stringify(chat.state.messages)).toBe(before);
  expect(methods.filter((method) => method === 'turn/send')).toHaveLength(1);
  await dispose();
});
