import {expect, test} from 'bun:test';
import {computed} from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';
import {SelectItem} from '../packages/core/src/components/forms/shared/selectItem';
import {SelectOption} from '../packages/core/src/components/forms/shared/selectOption';
import {SelectSeparator} from '../packages/core/src/components/forms/shared/selectSeparator';

test('invalid replacement preserves overrides and future registrations inherit bindings', () => {
  const frame = createFrame();
  frame.commands.replaceKeybindings({'later.save': 'ctrl+s'});
  expect(() =>
    frame.commands.replaceKeybindings({'later.save': 'Ctrl+O', broken: ''})
  ).toThrow();
  expect(frame.commands.getKeybindings()).toEqual({'later.save': 'Ctrl+S'});
  const unregister = frame.commands.register({
    id: 'later.save',
    label: 'Save',
    shortcut: 'Ctrl+O',
    run() {},
  });
  const shortcut = computed(() => frame.commands.get('later.save')?.shortcut);
  expect(shortcut.value).toBe('Ctrl+S');
  const {setKeybinding, resetKeybinding} = frame.commands;
  setKeybinding('later.save', null);
  expect(shortcut.value).toBeUndefined();
  resetKeybinding('later.save');
  expect(shortcut.value).toBe('Ctrl+O');
  unregister();
  expect(() => setKeybinding('later.save', 'Ctrl+S')).toThrow();
  frame.dispose();
});

test('select constructors preserve option content and shared base identity', () => {
  const option = new SelectOption({
    value: 'dark',
    label: 'Dark',
    description: 'Dim',
    detail: 'Low light',
    disabled: true,
  });
  const separator = new SelectSeparator('themes');
  expect(option).toBeInstanceOf(SelectItem);
  expect(separator).toBeInstanceOf(SelectItem);
  expect(option).toMatchObject({
    value: 'dark',
    label: 'Dark',
    description: 'Dim',
    detail: 'Low light',
    disabled: true,
  });
  expect(separator).toMatchObject({id: 'themes', type: 'separator'});
});
