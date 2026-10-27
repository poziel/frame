import {expect, test} from 'bun:test';
import {computed, reactive} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';

test('permissions combine reactive automatic state, manual overrides, and context', () => {
  const frame = createFrame();
  const application = reactive({readOnly: false});
  const permission = frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (document) => !application.readOnly && !document.readOnly,
    reason: 'Document is read-only',
  });
  const document = reactive({readOnly: false});
  const allowed = computed(() => permission.check(document).allowed);
  expect(allowed.value).toBe(true);
  application.readOnly = true;
  expect(allowed.value).toBe(false);
  permission.enable();
  expect(allowed.value).toBe(true);
  permission.reset();
  expect(allowed.value).toBe(false);
  application.readOnly = false;
  frame.permissions['document.edit'].disable('AI is editing');
  expect(permission.check(document)).toEqual({
    allowed: false,
    reason: 'AI is editing',
  });
  frame.permissions.reset('document.edit');
  expect(permission.check({readOnly: true}).allowed).toBe(false);
  expect(permission.check(document).allowed).toBe(true);
  frame.dispose();
  permission.enable();
  expect(permission.check(document).allowed).toBe(false);
});

test('permissions fail closed, reject collisions, and isolate Frame instances', () => {
  const frame = createFrame();
  const other = createFrame();
  expect(frame.permissions.check('missing', undefined).allowed).toBe(false);
  expect(() =>
    frame.permissions.register({id: 'get', allowed: true})
  ).toThrow();
  const permission = frame.permissions.register({
    id: 'document.edit',
    allowed: true,
  });
  expect(() =>
    frame.permissions.register({id: permission.id, allowed: true})
  ).toThrow();
  expect(other.permissions.get(permission.id)).toBeUndefined();
  permission.unregister();
  const replacement = frame.permissions.register({
    id: permission.id,
    allowed: true,
  });
  permission.unregister();
  expect(frame.permissions.get(permission.id)).toBe(replacement);
  frame.dispose();
  other.dispose();
});

test('permission, namespace, command, and feature restrictions remain independent', async () => {
  const frame = createFrame();
  const target = reactive({readOnly: false});
  frame.permissions.register<{readOnly: boolean}>({
    id: 'document.edit',
    allowed: (document) => !document.readOnly,
  });
  let runs = 0;
  const command = frame.commands.register({
    id: 'artwork.edit.erase',
    label: 'Erase',
    feature: 'artwork',
    requires: ['document.edit'],
    context: () => target,
    run: () => {
      runs++;
    },
  });
  const run = command.run;
  await run();
  expect(runs).toBe(1);
  target.readOnly = true;
  await run();
  expect(runs).toBe(1);
  frame.permissions.enable('document.edit');
  frame.commands.disable('artwork.edit');
  await command.run();
  expect(runs).toBe(1);
  command.disable();
  frame.commands.enable('artwork.edit');
  expect(frame.commands.isEnabled(command.id)).toBe(false);
  command.enable();
  frame.features.disable('artwork');
  await command.run();
  expect(runs).toBe(1);
  frame.features.get('artwork')!.enable();
  await command.run();
  expect(runs).toBe(2);
  command.unregister();
  frame.commands.register({
    id: command.id,
    label: 'Replacement',
    run: () => {
      runs += 10;
    },
  });
  await run();
  command.disable();
  expect(runs).toBe(2);
  expect(frame.commands.isEnabled(command.id)).toBe(true);
  frame.dispose();
});

test('namespace matching respects dot boundaries and future registrations', () => {
  const frame = createFrame();
  frame.commands.disable('artwork.edit');
  frame.commands.register({id: 'artwork.edit.brush', label: 'Brush', run() {}});
  frame.commands.register({id: 'artwork.editor', label: 'Editor', run() {}});
  expect(frame.commands.isEnabled('artwork.edit.brush')).toBe(false);
  expect(frame.commands.isEnabled('artwork.editor')).toBe(true);
  expect(frame.commands['artwork.edit.brush']).toBe(
    frame.commands.get('artwork.edit.brush')
  );
  frame.dispose();
});

test('registered parent restrictions propagate through every command entry point', async () => {
  const frame = createFrame();
  const runs: string[] = [];
  const parent = frame.commands.register({
    id: 'artwork.edit',
    label: 'Edit artwork',
    run: () => {
      runs.push('parent');
    },
  });
  const child = frame.commands.register({
    id: 'artwork.edit.tools.erase',
    label: 'Erase',
    shortcut: 'Ctrl+E',
    run: () => {
      runs.push('child');
    },
  });
  const changes: boolean[] = [];
  child.subscribe(({current}) => changes.push(current.enabled));
  const shortcut = {
    key: 'e',
    ctrlKey: true,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  } as KeyboardEvent;
  expect(frame.commands.resolveShortcut(shortcut)?.id).toBe(child.id);
  parent.disable();
  await parent.run();
  await child.run();
  await frame.commands.execute(child.id);
  expect(runs).toEqual([]);
  expect(frame.commands.resolveShortcut(shortcut)).toBeUndefined();
  frame.openQuickInput();
  expect(
    frame.quickInputItems.value.find((item) => item.id === child.id)?.disabled
  ).toBe(true);
  const menu = frame.resolveMenuItems([
    {id: 'erase', label: 'Erase', command: child.id},
  ]);
  expect(menu[0]?.type !== 'separator' && menu[0]?.disabled).toBe(true);
  child.enable();
  expect(frame.commands.isEnabled(child.id)).toBe(false);
  parent.enable();
  expect(frame.commands.resolveShortcut(shortcut)?.id).toBe(child.id);
  child.disable();
  parent.disable();
  parent.enable();
  expect(frame.commands.isEnabled(child.id)).toBe(false);
  child.enable();
  await parent.run();
  await child.run();
  expect(runs).toEqual(['parent', 'child']);
  expect(changes).toEqual([false, true, false, true]);
  frame.dispose();
});

test('Command Center submenus mix hidden commands, structural entries and nested choices', async () => {
  const frame = createFrame();
  let runs = 0;
  const command = frame.commands.register({
    id: 'background.black',
    label: 'Black',
    commandCenter: false,
    run: () => {
      runs++;
    },
  });
  frame.commandCenter.register({
    id: 'background',
    label: 'Change background',
    searchable: false,
    items: [
      command,
      {id: 'divider', type: 'separator', label: 'More'},
      {
        id: 'custom',
        type: 'submenu',
        label: 'Custom',
        items: [
          {
            id: 'white',
            label: 'White',
            run: () => {
              runs += 2;
            },
          },
        ],
      },
    ],
  });
  frame.openQuickInput();
  expect(
    frame.quickInputItems.value.some((item) => item.id === command.id)
  ).toBe(false);
  expect(
    frame.quickInputItems.value.some((item) => item.id === 'background')
  ).toBe(true);
  const pending = frame.commands.execute('background');
  expect(frame.quickInput.value?.searchable).toBe(false);
  frame.acceptQuickInput('divider');
  expect(frame.quickInput.value).not.toBeNull();
  frame.quickInput.value!.onStateChange?.({
    query: 'custom',
    selectedId: 'custom',
  });
  frame.acceptQuickInput('custom');
  await Promise.resolve();
  frame.acceptQuickInput('__frame_command_center_back__');
  await Promise.resolve();
  expect(frame.quickInput.value?.initialQuery).toBe('custom');
  expect(frame.quickInput.value?.initialSelectedId).toBe('custom');
  command.disable();
  expect(
    frame.quickInputItems.value.find((item) => item.id === command.id)?.disabled
  ).toBe(true);
  command.enable();
  frame.acceptQuickInput(command.id);
  await pending;
  expect(runs).toBe(1);
  frame.dispose();
});

test('disposing a Frame cancels an open nested submenu', async () => {
  const frame = createFrame();
  const pending = frame.commandCenter.open({
    id: 'submenu',
    label: 'Page',
    items: [{id: 'one', label: 'One'}],
  });
  frame.dispose();
  expect(await pending).toBeUndefined();
});

test('live feature objects retain identity and cannot alter replacement registrations', () => {
  const frame = createFrame();
  const feature = frame.features.register({id: 'artwork.edit'});
  expect(frame.features['artwork.edit']).toBe(feature);
  feature.disable();
  expect(feature.available).toBe(false);
  feature.unregister();
  const replacement = frame.features.register({id: feature.id});
  feature.disable();
  expect(replacement.available).toBe(true);
  frame.dispose();
  replacement.enable();
  expect(replacement.available).toBe(false);
});

test('permission requirements propagate to menus and unknown requirements block execution', async () => {
  const frame = createFrame();
  let runs = 0;
  const command = frame.commands.register({
    id: 'artwork.edit.erase',
    label: 'Erase',
    requires: ['document.edit'],
    run: () => {
      runs++;
    },
  });
  await command.run();
  expect(runs).toBe(0);
  frame.permissions.register({id: 'document.edit', allowed: true});
  expect(frame.commands.list().find((item) => item.id === command.id)).toBe(
    frame.commands.get(command.id)
  );
  frame.commands
    .list()
    .find((item) => item.id === command.id)!
    .disable();
  const menu = frame.resolveMenuItems([
    {id: 'erase', label: 'Erase', command: command.id},
  ]);
  expect(menu[0]?.disabled).toBe(true);
  frame.dispose();
});

test('submenu permission revocation disables local choices and blocks completion', async () => {
  const frame = createFrame();
  const permission = frame.permissions.register({
    id: 'document.edit',
    allowed: true,
  });
  let runs = 0;
  frame.commandCenter.register({
    id: 'artwork.choices',
    label: 'Choices',
    requires: ['document.edit'],
    items: [
      {
        id: 'local',
        label: 'Local action',
        run: () => {
          runs++;
        },
      },
    ],
  });
  const pending = frame.commandCenter.open('artwork.choices');
  permission.disable();
  expect(frame.quickInputItems.value[0]?.disabled).toBe(true);
  frame.acceptQuickInput('local');
  frame.commandCenter.close();
  expect(await pending).toBeUndefined();
  expect(runs).toBe(0);
  frame.dispose();
});
