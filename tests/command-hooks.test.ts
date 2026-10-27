import { expect, test } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('after-command hooks run once after success and await custom asynchronous work', async () => {
  const frame = createFrame(); const calls: string[] = [];
  frame.registerCommand({ id: 'app.close', label: 'Close', run: async () => { calls.push('run'); } });
  const remove = frame.commands.hook('app.close', async event => { await Promise.resolve(); calls.push(event.id); });
  frame.commands.hook(event => { calls.push(`global:${event.label}`); });
  await frame.commands.get('app.close')!.run();
  expect(calls).toEqual(['run', 'app.close', 'global:Close']);
  remove(); remove(); calls.length = 0;
  await frame.commands.execute('app.close'); expect(calls).toEqual(['run', 'global:Close']);
  frame.dispose();
});

test('unknown, blocked and failed commands do not fire successful completion hooks', async () => {
  const frame = createFrame(), second = createFrame(); let calls = 0;
  frame.commands.hook(() => { calls++; });
  frame.registerCommand({ id: 'blocked', label: 'Blocked', enabled: false, run() {} });
  frame.registerCommand({ id: 'failed', label: 'Failed', run() { throw Error('failure'); } });
  second.registerCommand({ id: 'other', label: 'Other', run() {} });
  await frame.commands.execute('unknown'); await frame.commands.execute('blocked');
  await frame.commands.execute('failed'); await second.commands.execute('other');
  expect(calls).toBe(0); frame.dispose(); second.dispose();
});

test('hook errors and removal during dispatch do not prevent other active hooks', async () => {
  const frame = createFrame(); const calls: string[] = [];
  frame.registerCommand({ id: 'sample', label: 'Sample', run() {} });
  let removeLater = () => {};
  frame.commands.hook('sample', () => { removeLater(); throw Error('hook failed'); });
  removeLater = frame.commands.hook('sample', () => { calls.push('removed'); });
  frame.commands.hook('sample', () => { calls.push('last'); });
  await frame.commands.execute('sample'); expect(calls).toEqual(['last']); frame.dispose();
});

test('disposal prevents hooks after pending commands and rejects new subscriptions', async () => {
  const frame = createFrame(); let finish!: () => void, calls = 0;
  frame.registerCommand({ id: 'pending', label: 'Pending', run: () => new Promise<void>(resolve => { finish = resolve; }) });
  const remove = frame.commands.hook('pending', () => { calls++; });
  const executing = frame.commands.execute('pending'); frame.dispose(); finish(); await executing;
  expect(calls).toBe(0); remove();
  expect(() => frame.commands.hook(() => {})).toThrow();
});
