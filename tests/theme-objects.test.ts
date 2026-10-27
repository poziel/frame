import {TokenNormalizer} from '../packages/core/src/themes/parsing/tokenNormalizer';
import {expect, test} from 'bun:test';
import {FrameThemeController} from '../packages/core/src/themes/runtime/frameThemeController';
import type {FrameThemeDefinition} from '../packages/core/src/themes/theme';

const definition: FrameThemeDefinition = {
  version: 1,
  id: 'custom',
  name: 'Custom',
  appearance: 'dark',
  tokens: {},
};

test('theme controller callbacks stay bound and registration cleanup protects replacements', () => {
  const controller = new FrameThemeController();
  const other = new FrameThemeController();
  const {register, set, reset, dispose} = controller;
  const remove = register(definition);
  expect(controller.available.value.map((theme) => theme.id)).toEqual([
    'custom',
  ]);
  expect(() => register(definition)).toThrow('already registered');
  remove();
  const removeReplacement = register({...definition, name: 'Replacement'});
  remove();
  expect(controller.available.value[0]?.name).toBe('Replacement');
  set(definition);
  expect(other.current.value).toBeNull();
  reset();
  expect(controller.current.value).toBeNull();
  removeReplacement();
  dispose();
  dispose();
  expect(() => register(definition)).toThrow('disposed');
  expect(() => set(definition)).toThrow('disposed');
  other.dispose();
});

test('invalid theme selection retains the previous immutable definition', () => {
  const controller = new FrameThemeController(definition);
  const previous = controller.current.value;
  expect(() =>
    controller.set({...definition, tokens: {'--frame-accent': 'invalid()'}})
  ).toThrow();
  expect(controller.current.value).toBe(previous);
  expect(controller.available.value).toEqual([previous]);
  controller.dispose();
});

test('normalization retries after failure without retaining ancestors or changing prior results', () => {
  const normalizer = new TokenNormalizer();
  const first = normalizer.normalize({'frame.accent': '#123456'});
  const cyclic: Record<string, unknown> = {};
  cyclic.frame = cyclic;
  expect(() => normalizer.normalize(cyclic)).toThrow('cyclic token tree');
  delete cyclic.frame;
  cyclic['frame.accent'] = '#abcdef';
  expect(normalizer.normalize(cyclic)).toEqual({'--frame-accent': '#abcdef'});
  expect(first).toEqual({'--frame-accent': '#123456'});
  expect(normalizer.normalize({})).toEqual({});
});
