import { expect, test } from 'bun:test';
import {createFrame} from '../packages/core/src/framework/frame';

test('module installation chains on the same Frame, is isolated, and cleans up once', () => {
  const frame = createFrame(), other = createFrame();
  let installs = 0, disposals = 0;
  const module = { id: 'test.editor', key: 'editor' as const, install() { installs++; return { capability: { create: () => 'editor' }, dispose() { disposals++; } }; } };
  const extended = frame.use(module);
  expect(extended).toBe(frame); expect(extended.editor.create()).toBe('editor');
  expect(frame.use(module)).toBe(frame); expect(installs).toBe(1);
  expect('editor' in other).toBe(false);
  frame.dispose(); frame.dispose(); expect(disposals).toBe(1); expect('editor' in frame).toBe(false);
  expect(() => frame.use(module)).toThrow('disposed'); other.dispose();
});

test('module installation rejects conflicting IDs and capability keys without running installers', () => {
  const frame = createFrame(); let calls = 0;
  const install = () => { calls++; return { capability: {} }; };
  frame.use({ id: 'test.first', key: 'editor', install });
  expect(() => frame.use({ id: 'test.first', key: 'second', install })).toThrow();
  expect(() => frame.use({ id: 'test.second', key: 'editor', install })).toThrow();
  expect(() => frame.use({ id: 'test.settings', key: 'settings', install })).toThrow();
  expect(calls).toBe(1); frame.dispose();
});

test('failed installers can be retried and cleanup failure still disposes the shell', () => {
  const frame = createFrame(); let fail = true;
  const module = { id: 'test.retry', key: 'retry' as const, install() { if (fail) throw new Error('retry'); return { capability: true, dispose() { throw new Error('cleanup'); } }; } };
  expect(() => frame.use(module)).toThrow('retry'); expect('retry' in frame).toBe(false);
  fail = false; frame.use(module);
  expect(() => frame.dispose()).toThrow(); expect(frame.commands.list()).toHaveLength(0);
  expect('retry' in frame).toBe(false); frame.dispose();
});

test('nested installation reserves capability keys and disposal during install releases new resources', () => {
  const frame = createFrame(); let cleaned = 0;
  frame.use({ id: 'outer', key: 'outer', install(host) {
    expect(() => host.use({ id: 'nested', key: 'outer', install: () => ({ capability: true }) })).toThrow();
    return { capability: true };
  } });
  expect(() => frame.use({ id: 'closing', key: 'closing', install(host) {
    host.dispose(); return { capability: true, dispose() { cleaned++; } };
  } })).toThrow('disposed');
  expect(cleaned).toBe(1); expect('closing' in frame).toBe(false);
});
