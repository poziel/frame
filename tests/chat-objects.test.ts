import {expect, test} from 'bun:test';
import {
  ChatController,
  createAIChat,
} from '../packages/core/src/modules/chat/controllers/aiChat';
import {
  ChatHistoryController,
  createAIChatHistory,
} from '../packages/core/src/modules/chat/controllers/aiChatHistory';
import {ChatInteractions} from '../packages/core/src/modules/chat/controllers/chatInteractions';
import {
  JsonLineAgentConnection,
  createJsonLineAgentConnection,
} from '../packages/core/src/modules/chat/services/agents/jsonLineAgentConnection';
import {
  AgentChatSession,
  createAgentChatSession,
} from '../packages/core/src/modules/chat/services/agents/agentChatSession';
import type {ChatResponseWriter} from '../packages/core/src/modules/chat/types/chatTypes';
import type {
  AgentConnection,
  AgentSession,
} from '../packages/core/src/modules/chat/types/agentTypes';

test('chat factories return class owners and retain conversation and writer callbacks', async () => {
  const writers: ChatResponseWriter[] = [];
  const chat = createAIChat({
    respond(_request, writer) {
      writers.push(writer);
      return new Promise(() => {});
    },
  });
  expect(chat).toBeInstanceOf(ChatController);
  const {send, stop, dispose} = chat;
  chat.state.draft = 'First';
  const first = send();
  const {message, complete} = writers[0]!;
  message('First response');
  expect(complete()).toBe(true);
  expect(await first).toBe(true);
  chat.state.draft = 'Second';
  const second = send();
  message('Late response');
  expect(complete()).toBe(false);
  expect(chat.state.messages[3]!.parts).toEqual([]);
  stop();
  expect(await second).toBe(true);
  expect(chat.state.messages[3]!.status).toBe('stopped');
  dispose();
  expect(await send()).toBe(false);
});

test('history classes create lazily and dispose owned class conversations', () => {
  let created = 0;
  const history = createAIChatHistory({
    applicationId: 'app',
    createChat: () => {
      created++;
      return new ChatController({respond() {}});
    },
  });
  expect(history).toBeInstanceOf(ChatHistoryController);
  expect(created).toBe(0);
  const {create, select, rename, dispose} = history;
  const first = create('First');
  const foreign = create('Other app', 'other');
  expect(created).toBe(2);
  expect(select(first.id)).toBe(true);
  expect(rename(first.id, ' Renamed ')).toBe(true);
  expect(first.title).toBe('Renamed');
  expect(history.visible.value).toEqual([first]);
  history.setScope('all');
  expect(history.conversations.value).toContain(foreign);
  dispose();
  expect(history.conversations.value).toEqual([]);
  expect(() => create()).toThrow('disposed');
});

test('interaction instances settle their own callbacks once', async () => {
  let settlements = 0;
  const interactions = new ChatInteractions(() => {
    settlements++;
  });
  const handle = interactions.approval({
    id: 'approval',
    type: 'approval',
    text: 'Save?',
    status: 'pending',
  });
  const {resolveApproval, cancelAll} = interactions;
  expect(resolveApproval(handle.id, 'allow')).toBe(true);
  expect(resolveApproval(handle.id, 'deny')).toBe(false);
  expect(await handle.result).toEqual({status: 'answered', decision: 'allow'});
  expect(settlements).toBe(1);
  const pending = interactions.approval({
    id: 'pending',
    type: 'approval',
    text: 'Continue?',
    status: 'pending',
  });
  cancelAll();
  expect(await pending.result).toEqual({status: 'cancelled'});
  expect(interactions.size).toBe(0);
});

test('JSON-line classes retain RPC callbacks and release host subscriptions once', async () => {
  let receive!: (chunk: string) => void;
  let removals = 0;
  const lines: string[] = [];
  const connection = createJsonLineAgentConnection({
    write: (line) => {
      lines.push(line);
    },
    subscribe: (callback) => {
      receive = callback;
      return () => {
        removals++;
      };
    },
  });
  expect(connection).toBeInstanceOf(JsonLineAgentConnection);
  expect(lines).toEqual([]);
  const {request, dispose} = connection;
  const result = request<string>('echo', {});
  const id = JSON.parse(lines[0]!).id;
  receive(JSON.stringify({id, result: 'answer'}) + '\n');
  expect(await result).toBe('answer');
  const pending = request('pending', {});
  const rejection = pending.catch((error) => error);
  dispose();
  dispose();
  expect(((await rejection) as Error).message).toContain('disposed');
  expect(removals).toBe(1);
  expect(lines).toHaveLength(2);
});

test('agent session factories create class instances without owning the connection', async () => {
  const calls: string[] = [];
  const metadata: AgentSession = {
    sessionId: 's',
    providerSessionId: 'remote',
    provider: 'codex',
    capabilities: {
      resume: false,
      listSessions: false,
      approvals: true,
      questions: true,
      tools: true,
      artifacts: true,
    },
  };
  const connection: AgentConnection = {
    async request<T>(method: string) {
      calls.push(method);
      return metadata as T;
    },
    subscribe() {
      return () => {};
    },
  };
  const native = await createAgentChatSession(connection, {
    provider: 'codex',
    applicationId: 'app',
    cwd: '.',
  });
  expect(native).toBeInstanceOf(AgentChatSession);
  expect(native.chat).toBeInstanceOf(ChatController);
  expect(calls).toEqual(['session/create']);
  expect(() => native.chat.clear()).toThrow('unsupported');
  const {dispose} = native;
  await dispose();
  await dispose();
  expect(calls).toEqual(['session/create', 'session/close']);
  await connection.request('host-owned');
  expect(calls.at(-1)).toBe('host-owned');
});
