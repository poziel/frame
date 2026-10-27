import {expect, spyOn, test} from 'bun:test';
import {Notifier} from '../packages/core/src/framework/configuration/notifier';

test('subscriptions receive one event payload and are removed by ID', () => {
  const notifier = new Notifier<{previous: boolean; current: boolean}>();
  const events: unknown[] = [];
  const id = notifier.subscribe((event) => {
    events.push(event);
  });
  const payload = {previous: true, current: false};
  notifier.invoke(payload);
  expect(events).toEqual([payload]);
  notifier.unsubscribe(id);
  notifier.unsubscribe(id);
  notifier.invoke({previous: false, current: true});
  expect(events).toHaveLength(1);
});

test('subscription IDs cannot accidentally remove another notifier subscription', () => {
  const first = new Notifier();
  const second = new Notifier();
  const firstId = first.subscribe(() => {});
  let calls = 0;
  second.subscribe(() => {
    calls++;
  });
  second.unsubscribe(firstId);
  second.invoke();
  expect(calls).toBe(1);
});

test('one-time subscriptions are removed before reentrant invocation', () => {
  const notifier = new Notifier<number>();
  const values: number[] = [];
  notifier.subscribeOnce((value) => {
    values.push(value);
    notifier.invoke(value + 1);
  });
  notifier.invoke(1);
  notifier.invoke(3);
  expect(values).toEqual([1]);
});

test('dispatch skips removed subscriptions and defers newly added callbacks', () => {
  const notifier = new Notifier();
  const calls: string[] = [];
  let removeLater = Symbol();
  notifier.subscribeOnce(() => {
    calls.push('first');
    notifier.unsubscribe(removeLater);
    notifier.subscribe(() => {
      calls.push('new');
    });
  });
  removeLater = notifier.subscribe(() => {
    calls.push('removed');
  });
  notifier.invoke();
  expect(calls).toEqual(['first']);
  notifier.invoke();
  expect(calls).toEqual(['first', 'new']);
  notifier.unsubscribe();
  notifier.invoke();
  expect(calls).toEqual(['first', 'new']);
});

test('failed one-time callbacks stay removed and other callbacks still run', () => {
  const notifier = new Notifier();
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  try {
    let calls = 0;
    notifier.subscribeOnce(() => {
      throw new Error('Failed subscriber');
    });
    notifier.subscribe(() => {
      calls++;
    });
    notifier.invoke();
    notifier.invoke();
    expect(calls).toBe(2);
    expect(errors).toHaveBeenCalledTimes(1);
  } finally {
    errors.mockRestore();
  }
});

test('asynchronous callback failures are observed without delaying invocation', async () => {
  const notifier = new Notifier();
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  try {
    let calls = 0;
    notifier.subscribeOnce(async () => {
      throw new Error('Async subscriber failed');
    });
    notifier.subscribe(() => {
      calls++;
    });
    notifier.invoke();
    expect(calls).toBe(1);
    await Promise.resolve();
    await Promise.resolve();
    expect(errors).toHaveBeenCalledTimes(1);
  } finally {
    errors.mockRestore();
  }
});
