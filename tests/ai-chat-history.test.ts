import { expect, test } from 'bun:test';
import { createAIChat } from '../packages/core/src/modules/chat/controllers/aiChat';
import { createAIChatHistory } from '../packages/core/src/modules/chat/controllers/aiChatHistory';

test('history is lazy, scopes conversations, and preserves controller state when switching', async () => {
  let created = 0;
  const history = createAIChatHistory({ applicationId: 'pixloom', createChat: () => { created++; return createAIChat({ respond: (
    _request,
    writer
  ) => { writer.message('Done'); } }); } });
  expect(created).toBe(0);
  const first = history.create('First');
  first.chat.state.draft = 'My image'; await first.chat.send();
  first.chat.state.draft = 'Unsent draft';
  const foreign = history.create('Other', 'orchestrator');
  expect(history.visible.value.map(item => item.id)).toEqual([first.id]);
  expect(history.select(foreign.id)).toBe(false);
  history.setScope('all'); expect(history.select(foreign.id)).toBe(true);
  history.setScope('application'); expect(history.active.value).toBeUndefined();
  expect(history.select(first.id)).toBe(true);
  expect(history.active.value?.chat.state.draft).toBe('Unsent draft');
  expect(first.chat.state.messages).toHaveLength(2);
  history.dispose();
});

test('deleting and disposing history stops owned pending chats and prevents further creation', async () => {
  const history = createAIChatHistory({ scope: 'all', createChat: () => createAIChat({ respond: () => new Promise(() => {}) }) });
  const first = history.create(); first.chat.state.draft = 'Start'; const pending = first.chat.send();
  expect(first.chat.state.busy).toBe(true);
  expect(history.remove(first.id)).toBe(true); await pending;
  expect(first.chat.state.busy).toBe(false); expect(history.active.value).toBeUndefined();
  const second = history.create(); second.chat.state.draft = 'Again'; const another = second.chat.send();
  history.dispose(); history.dispose(); await another;
  expect(history.conversations.value).toHaveLength(0);
  expect(() => history.create()).toThrow('disposed');
  expect(history.select(second.id)).toBe(false);
});

test('application scope requires an application identity and stores remain independent', () => {
  const createChat = () => createAIChat({ respond() {} });
  expect(() => createAIChatHistory({ createChat })).toThrow('applicationId');
  const first = createAIChatHistory({ applicationId: 'one', createChat });
  const second = createAIChatHistory({ applicationId: 'two', createChat });
  first.create(); expect(second.conversations.value).toHaveLength(0);
  first.dispose(); second.dispose();
});

test('rename, pin, archive, restore, and delete share the same live history state', () => {
  const history = createAIChatHistory({ applicationId: 'pixloom', createChat: () => createAIChat({ respond() {} }) });
  const first = history.create('First'), second = history.create('Second');
  expect(history.rename(first.id, '  Project notes  ')).toBe(true);
  expect(first.title).toBe('Project notes');
  expect(history.rename(first.id, ' ')).toBe(false);
  expect(history.pin(first.id)).toBe(true);
  expect(history.visible.value.map(item => item.id)).toEqual([first.id, second.id]);
  history.select(first.id); history.archive(first.id);
  expect(history.active.value).toBeUndefined();
  expect(history.visible.value.map(item => item.id)).toEqual([second.id]);
  expect(history.archived.value.map(item => item.id)).toEqual([first.id]);
  expect(history.archive(first.id, false)).toBe(true);
  expect(history.visible.value[0]).toBe(first);
  expect(history.pin(first.id, false)).toBe(true);
  expect(history.visible.value[0]).toBe(second);
  history.dispose();
  expect(history.rename(first.id, 'Late')).toBe(false);
  expect(history.archive(second.id)).toBe(false);
});
