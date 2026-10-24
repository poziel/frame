import { expect, test } from 'bun:test';
import { createFrame } from '../packages/core/src/frame/createFrame';

test('Manage placement defaults to bottom and stays isolated from other instances and activity placement', () => {
  const first = createFrame(), second = createFrame({ manageButtonPosition: 'top' });
  expect(first.layout.manageButtonPosition).toBe('bottom');
  expect(second.layout.manageButtonPosition).toBe('top');
  first.layout.manageButtonPosition = 'top';
  first.layout.primaryViewBarPosition = 'bottom';
  second.layout.manageButtonPosition = 'bottom';
  expect(first.layout.manageButtonPosition).toBe('top');
  expect(second.layout.manageButtonPosition).toBe('bottom');
  first.resetLayout();
  expect(first.layout.manageButtonPosition).toBe('bottom');
  second.resetLayout();
  expect(second.layout.manageButtonPosition).toBe('top');
  first.dispose(); second.dispose();
});
