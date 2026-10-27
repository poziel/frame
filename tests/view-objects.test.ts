import {expect, test} from 'bun:test';
import {computed} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';
import {Navigation} from '../packages/core/src/framework/views/navigation';
import {Notifications} from '../packages/core/src/framework/views/notifications';
import {Status} from '../packages/core/src/framework/views/status';
import {Toolbar} from '../packages/core/src/framework/views/toolbar';
import {ContextMenuCommands} from '../packages/core/src/framework/commands/contextMenuCommands';

test('Frame owns independent view-service class instances', () => {
  const first = createFrame();
  const second = createFrame();
  expect(first.navigation).toBeInstanceOf(Navigation);
  expect(first.notifications).toBeInstanceOf(Notifications);
  expect(first.status).toBeInstanceOf(Status);
  expect(first.toolbar).toBeInstanceOf(Toolbar);
  const {set, dispose} = first.status;
  set('First shell');
  expect(first.status.message.value.text).toBe('First shell');
  expect(second.status.message.value.text).toBe('Ready');
  dispose();
  set('Ignored');
  expect(first.status.message.value.text).toBe('');
  first.dispose();
  second.dispose();
});

test('composed bars preserve reactive state and block detached methods when unavailable', () => {
  const frame = createFrame();
  const other = createFrame();
  const display = computed(() => frame.primaryViewBar.display.value);
  const {setDisplay} = frame.primaryViewBar;
  expect(setDisplay('text')).toBe(true);
  expect(display.value).toBe('text');
  expect(other.primaryViewBar.display.value).toBe('icons');
  for (const bar of [
    frame.primaryViewBar,
    frame.secondaryViewBar,
    frame.panelViewBar,
    frame.navigationBar,
  ]) {
    expect('registry' in bar).toBe(false);
    expect('options' in bar).toBe(false);
    expect('sourceAvailable' in bar).toBe(false);
  }
  frame.features.setAvailable('primarySidebar', false);
  expect(setDisplay('both')).toBe(false);
  expect(display.value).toBe('text');
  frame.features.setAvailable('primarySidebar', true);
  expect(setDisplay('both')).toBe(true);
  expect(display.value).toBe('both');
  frame.dispose();
  expect(setDisplay('text')).toBe(false);
  other.dispose();
});

test('context-menu callbacks retain their owning instance when handed to lifecycle APIs', async () => {
  const frame = createFrame();
  let runs = 0;
  const menu = new ContextMenuCommands(
    frame,
    'test.context',
    () => 'shell',
    () => {
      runs++;
    }
  );
  const {bind, dispose} = menu;
  bind([{id: 'edit', label: 'Edit'}]);
  await frame.commands.execute('test.context.edit');
  expect(runs).toBe(1);
  dispose();
  dispose();
  expect(frame.commands.get('test.context.edit')).toBeUndefined();
  frame.dispose();
});
