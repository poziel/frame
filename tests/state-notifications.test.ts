import {expect, spyOn, test} from 'bun:test';
import {effectScope, reactive, ref, shallowRef} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';

test('permission subscriptions observe automatic changes and atomic manual overrides', () => {
  const frame = createFrame();
  const allowed = ref(true);
  const permission = frame.permissions.register({id: 'document.edit', allowed});
  const changes: unknown[] = [];
  permission.subscribe((event) => changes.push(event));
  expect(changes).toHaveLength(0);
  allowed.value = false;
  expect(changes).toHaveLength(1);
  expect(changes[0]).toMatchObject({
    previous: {allowed: true, mode: 'automatic', active: true},
    current: {allowed: false, mode: 'automatic', active: true},
  });
  permission.disable('AI is editing');
  expect(changes).toHaveLength(2);
  expect(changes[1]).toMatchObject({
    current: {
      allowed: false,
      mode: 'disabled',
      reason: 'AI is editing',
    },
  });
  allowed.value = true;
  expect(changes).toHaveLength(2);
  permission.reset();
  expect(changes).toHaveLength(3);
  permission.enable();
  expect(changes).toHaveLength(4);
  permission.enable();
  expect(changes).toHaveLength(4);
  frame.dispose();
});

test('contextual permission subscriptions stay independent and follow reactive targets', () => {
  const frame = createFrame();
  const first = reactive({readOnly: false});
  const second = reactive({readOnly: false});
  const selected = shallowRef(first);
  const permission = frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (document) => !document.readOnly,
  });
  let firstChanges = 0;
  let secondChanges = 0;
  permission.subscribe(
    () => {
      firstChanges++;
    },
    () => selected.value
  );
  permission.subscribe(() => {
    secondChanges++;
  }, second);
  first.readOnly = true;
  expect(firstChanges).toBe(1);
  expect(secondChanges).toBe(0);
  selected.value = second;
  expect(firstChanges).toBe(2);
  second.readOnly = true;
  expect(firstChanges).toBe(3);
  expect(secondChanges).toBe(1);
  frame.dispose();
});

test('ID cancellation and repeated cleanup stop subscriptions without affecting others', () => {
  const frame = createFrame();
  const allowed = ref(true);
  const permission = frame.permissions.register({id: 'document.edit', allowed});
  let removed = 0;
  let retained = 0;
  const listener = () => {
    removed++;
  };
  const removedId = permission.subscribe(listener);
  const retainedId = permission.subscribe(() => {
    retained++;
  });
  permission.unsubscribe(removedId);
  allowed.value = false;
  expect(removed).toBe(0);
  expect(retained).toBe(1);
  permission.unsubscribe(retainedId);
  permission.unsubscribe(retainedId);
  allowed.value = true;
  expect(retained).toBe(1);
  frame.dispose();
});

test('terminal permission changes release reactive sources and reject new subscriptions', () => {
  const frame = createFrame();
  const document = reactive({readOnly: false});
  let reads = 0;
  let changes = 0;
  const permission = frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (target) => !target.readOnly,
  });
  permission.subscribe(
    ({current}) => {
      changes++;
      expect(Object.isFrozen(current)).toBe(true);
    },
    () => {
      reads++;
      return document;
    }
  );
  permission.unregister();
  expect(changes).toBe(1);
  const finalReads = reads;
  document.readOnly = true;
  expect(reads).toBe(finalReads);
  expect(() => permission.subscribe(() => {}, document)).toThrow();
  frame.dispose();
});

test('commands and features share state subscriptions without observing command execution', async () => {
  const frame = createFrame();
  const allowed = ref(true);
  frame.permissions.register({id: 'document.edit', allowed});
  const feature = frame.features.register({id: 'artwork.edit'});
  const command = frame.commands.register({
    id: 'artwork.edit.erase',
    label: 'Erase',
    feature: feature.id,
    requires: ['document.edit'],
    run() {},
  });
  const commandChanges: unknown[] = [];
  const featureChanges: unknown[] = [];
  command.subscribe((event) => commandChanges.push(event));
  feature.subscribe((event) => featureChanges.push(event));
  await command.run();
  expect(commandChanges).toHaveLength(0);
  allowed.value = false;
  expect(commandChanges).toHaveLength(1);
  expect(commandChanges[0]).toMatchObject({current: {enabled: false}});
  expect(featureChanges).toHaveLength(0);
  feature.disable();
  expect(featureChanges).toHaveLength(1);
  expect(commandChanges[commandChanges.length - 1]).toMatchObject({
    current: {available: false, enabled: false},
  });
  frame.commands.disable('artwork.edit');
  feature.enable();
  expect(commandChanges[commandChanges.length - 1]).toMatchObject({
    current: {available: true, enabled: false},
  });
  frame.dispose();
});

test('command cleanup and Frame disposal deliver terminal state then detach subscriptions', () => {
  const frame = createFrame();
  const feature = frame.features.register({id: 'artwork.edit'});
  const command = frame.commands.register({
    id: 'artwork.erase',
    label: 'Erase',
    run() {},
  });
  let commandActive = true;
  let featureActive = true;
  command.subscribe(({current}) => {
    commandActive = current.active;
  });
  feature.subscribe(({current}) => {
    featureActive = current.active;
  });
  command();
  expect(commandActive).toBe(false);
  expect(() => command.subscribe(() => {})).toThrow();
  frame.dispose();
  expect(featureActive).toBe(false);
  expect(() => feature.subscribe(() => {})).toThrow();
});

test('one failing subscription does not prevent delivery to other subscriptions', () => {
  const frame = createFrame();
  const permission = frame.permissions.register({
    id: 'document.edit',
    allowed: true,
  });
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  try {
    let calls = 0;
    permission.subscribe(() => {
      throw new Error('Listener failed');
    });
    permission.subscribe(() => {
      calls++;
    });
    permission.disable();
    expect(calls).toBe(1);
    expect(errors).toHaveBeenCalledTimes(1);
    permission.unsubscribe();
    frame.dispose();
  } finally {
    errors.mockRestore();
  }
});

test('subscriptions remain registration-owned when a host reactive scope ends', () => {
  const frame = createFrame();
  const allowed = ref(true);
  const permission = frame.permissions.register({id: 'document.edit', allowed});
  const hostScope = effectScope();
  let calls = 0;
  hostScope.run(() =>
    permission.subscribe(() => {
      calls++;
    })
  );
  hostScope.stop();
  allowed.value = false;
  expect(calls).toBe(1);
  frame.dispose();
  const finalCalls = calls;
  allowed.value = true;
  expect(calls).toBe(finalCalls);
});

test('rejected asynchronous subscription actions are reported without unhandled rejection', async () => {
  const frame = createFrame();
  const permission = frame.permissions.register({
    id: 'document.edit',
    allowed: true,
  });
  const errors = spyOn(console, 'error').mockImplementation(() => {});
  try {
    permission.subscribe(async () => {
      throw new Error('Async listener failed');
    });
    permission.disable();
    await Promise.resolve();
    await Promise.resolve();
    expect(errors).toHaveBeenCalledTimes(1);
    permission.unsubscribe();
    frame.dispose();
  } finally {
    errors.mockRestore();
  }
});

test('unsubscribe removes only the addressed subscription when callbacks match', () => {
  const frame = createFrame();
  const first = reactive({readOnly: false});
  const second = reactive({readOnly: false});
  const permission = frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (document) => !document.readOnly,
  });
  let calls = 0;
  const action = () => {
    calls++;
  };
  const firstId = permission.subscribe(action, first);
  permission.subscribe(action, second);
  permission.unsubscribe(firstId);
  first.readOnly = true;
  second.readOnly = true;
  expect(calls).toBe(1);
  frame.dispose();
});

test('one-time contextual subscriptions release their source after the next change', () => {
  const frame = createFrame();
  const document = reactive({readOnly: false});
  const permission = frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (target) => !target.readOnly,
  });
  let reads = 0;
  let calls = 0;
  permission.subscribeOnce(
    ({previous, current}) => {
      calls++;
      expect(previous.allowed).toBe(true);
      expect(current.allowed).toBe(false);
      document.readOnly = false;
    },
    () => {
      reads++;
      return document;
    }
  );
  document.readOnly = true;
  const finalReads = reads;
  document.readOnly = true;
  expect(calls).toBe(1);
  expect(reads).toBe(finalReads);
  frame.dispose();
});

test('explicit item invocation delivers one payload without executing an action', () => {
  const frame = createFrame();
  let executions = 0;
  const command = frame.commands.register({
    id: 'document.save',
    label: 'Save',
    run: () => {
      executions++;
    },
  });
  const events: unknown[] = [];
  command.subscribeOnce((event) => {
    events.push(event);
  });
  const event = {
    previous: {active: true, available: true, enabled: true, visible: true},
    current: {active: true, available: true, enabled: false, visible: true},
  };
  command.invoke(event);
  command.invoke(event);
  expect(events).toEqual([event]);
  expect(executions).toBe(0);
  expect(frame.commands.isEnabled(command.id)).toBe(true);
  frame.dispose();
});
