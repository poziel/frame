import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { watch } from 'vue';
import { defineTheme, parseTheme, FrameThemeError } from '../packages/core/src/themes/theme';
import { themeTokens, renderThemeCSS } from '../packages/core/src/themes/tokens';
import { createFrame } from '../packages/core/src/frame/createFrame';

const input = { version: 1 as const, id: 'custom', name: 'Custom', appearance: 'dark' as const, tokens: { '--frame-accent': '#123456', '--frame-spacing-unit': '6px' } };
// CSSStyleDeclaration storage only; rendered inheritance is tested in the production browser fixture.
function element() {
  const values = new Map<string, [string, string]>();
  const attributes = new Map<string, string>();
  return {
    getAttribute: (key: string) => attributes.get(key) ?? null,
    setAttribute: (key: string, value: string) => { attributes.set(key, value); },
    removeAttribute: (key: string) => { attributes.delete(key); },
    style: {
    getPropertyValue: (key: string) => values.get(key)?.[0] ?? '',
    getPropertyPriority: (key: string) => values.get(key)?.[1] ?? '',
    setProperty: (key: string, value: string, priority = '') => { values.set(key, [value, priority]); },
    removeProperty: (key: string) => { const old = values.get(key)?.[0] ?? ''; values.delete(key); return old; },
  } } as unknown as HTMLElement;
}

describe('theme definitions', () => {
  test('typed and JSON themes are defensive immutable copies', () => {
    const original = structuredClone(input);
    const theme = defineTheme(original);
    original.tokens['--frame-accent'] = '#fff';
    expect(theme.tokens['--frame-accent']).toBe('#123456');
    expect(Object.isFrozen(theme)).toBe(true);
    expect(Object.isFrozen(theme.tokens)).toBe(true);
    expect(parseTheme(JSON.stringify(input))).toEqual(theme);
  });
  test('CSS defaults are generated from the public catalog', () => {
    expect(readFileSync('packages/core/src/themes/default.css', 'utf8').replaceAll('\r\n', '\n')).toBe(renderThemeCSS());
    expect(themeTokens['--frame-font-size-body'].value).toBe('12px');
  });
  test('metadata, sizes, versions and unknown keys fail with field paths', () => {
    for (const invalid of [{ ...input, version: 2 }, { ...input, id: '' }, { ...input, name: 'x'.repeat(201) }, { ...input, appearance: 'auto' }, { ...input, surprise: 1 }, { ...input, tokens: { '--app-color': '#fff' } }, { ...input, tokens: null }]) {
      expect(() => defineTheme(invalid as any)).toThrow(FrameThemeError);
    }
    expect(() => parseTheme('{')).toThrow(FrameThemeError);
    expect(() => parseTheme(' '.repeat(131073))).toThrow('128 KiB');
    expect(() => defineTheme({ ...input, tokens: { '--frame-bg': 5 } } as any)).toThrow('tokens.--frame-bg');
  });
  test('validates value categories and references without browser globals', () => {
    expect(() => defineTheme({ ...input, tokens: { '--frame-accent': 'rgb(10 20 30 / 50%)', '--frame-font-body': '"My Sans", system-ui', '--frame-content-padding': 'calc(var(--frame-spacing-unit) * 3)', '--frame-overlay-shadow': '0 1px 2px #0006', '--frame-ease': 'cubic-bezier(0.2, 0, 0, 1)' } })).not.toThrow();
    for (const tokens of [
      { '--frame-bg': 'url(https://example.com)' }, { '--frame-bg': 'red; color:blue' }, { '--frame-bg': 'var(--unknown)' },
      { '--frame-bg': 'var(--frame-bg)' }, { '--frame-bg': 'var(--frame-accent)', '--frame-accent': 'var(--frame-bg)' },
      { '--frame-bg': 'var(--frame-spacing-unit)' }, { '--frame-spacing-unit': 'banana' }, { '--frame-spacing-unit': '-2px' },
      { '--frame-duration': '-1ms' }, { '--frame-bg': 'inherit' }, { '--frame-bg': 'rgb(banana)' }, { '--frame-font-body': 'x'.repeat(513) },
      { '--frame-overlay-background': 'color-mix(in srgb, var(--frame-overlay-background) 80%, transparent)' },
    ]) expect(() => defineTheme({ ...input, tokens } as any)).toThrow(FrameThemeError);
  });
  test('rejects invalid CSS dimensions and zero-weight color mixes', () => {
    for (const tokens of [
      { '--frame-overlay-shadow': '0 10% 4px #000' },
      { '--frame-overlay-backdrop-filter': 'blur(10%)' },
      { '--frame-bg': 'rgb(10%, 20, 30%)' },
      { '--frame-bg': 'color-mix(in srgb, red 0%, blue 0%)' },
      ...['.0%', '+0%', '00%', '-0%'].map(weight => ({ '--frame-bg': `color-mix(in srgb, red ${weight}, blue ${weight})` })),
    ]) expect(() => defineTheme({ ...input, tokens } as any)).toThrow(FrameThemeError);
  });
});

describe('Frame theme ownership', () => {
  test('component tokens preserve contextual defaults and restore caller overrides', () => {
    const frame = createFrame(), root = element(), otherRoot = element();
    root.style.setProperty('--frame-text-input-padding', '3px');
    const detach = frame.theme.attach(root);
    frame.theme.attach(otherRoot);
    frame.theme.set(input);
    expect(root.style.getPropertyValue('--frame-text-input-padding')).toBe('3px');
    expect(otherRoot.style.getPropertyValue('--frame-text-input-padding')).toBe('');
    frame.theme.set({ ...input, tokens: { frame: { text: { input: { padding: '24px' } } } } });
    expect(root.style.getPropertyValue('--frame-text-input-padding')).toBe('24px');
    frame.theme.set(input);
    expect(root.style.getPropertyValue('--frame-text-input-padding')).toBe('3px');
    expect(otherRoot.style.getPropertyValue('--frame-text-input-padding')).toBe('');
    detach(); frame.dispose();
    expect(root.style.getPropertyValue('--frame-text-input-padding')).toBe('3px');
  });
  test('construction is SSR safe; current is reactive; instances remain independent', () => {
    const first = createFrame({ theme: input }), second = createFrame();
    const events: unknown[] = [];
    const stop = watch(first.theme.current, value => events.push(value), { flush: 'sync' });
    first.theme.reset();
    expect(first.theme.current.value).toBeNull();
    expect(second.theme.current.value).toBeNull();
    expect(events).toEqual([null]);
    stop(); first.dispose(); second.dispose();
  });
  test('replacement is atomic and reset restores inherited values', () => {
    const frame = createFrame(), root = element();
    const detach = frame.theme.attach(root);
    expect(root.style.getPropertyValue('--frame-accent')).toBe('');
    frame.theme.set(input);
    expect(root.style.getPropertyValue('--frame-accent')).toBe('#123456');
    expect(root.style.getPropertyValue('--frame-menu-background')).toBe('var(--frame-overlay-background)');
    expect(() => frame.theme.set({ ...input, tokens: { '--frame-accent': 'invalid()' } } as any)).toThrow();
    expect(root.style.getPropertyValue('--frame-accent')).toBe('#123456');
    frame.theme.set({ ...input, tokens: { '--frame-bg': '#abc' } });
    expect(root.style.getPropertyValue('--frame-accent')).toBe('#0078d4');
    frame.theme.reset();
    expect(root.style.getPropertyValue('--frame-bg')).toBe('');
    detach(); frame.dispose();
  });
  test('exclusive attachments restore caller styles and stale cleanup is harmless', () => {
    const frame = createFrame({ theme: input }), other = createFrame(), root = element();
    root.style.setProperty('--frame-accent', '#aaa', 'important');
    root.style.setProperty('color', 'pink');
    root.setAttribute('data-frame-theme-scope', 'host');
    const detach = frame.theme.attach(root);
    expect(root.getAttribute('data-frame-theme-scope')).toBe('');
    expect(() => other.theme.attach(root)).toThrow('already');
    expect(() => frame.theme.attach(root)).toThrow('already');
    root.style.setProperty('margin', '5px');
    detach();
    expect(root.getAttribute('data-frame-theme-scope')).toBe('host');
    expect(root.style.getPropertyValue('--frame-accent')).toBe('#aaa');
    expect(root.style.getPropertyPriority('--frame-accent')).toBe('important');
    expect(root.style.getPropertyValue('color')).toBe('pink');
    const removeOther = other.theme.attach(root); detach();
    other.theme.set({ ...input, tokens: { '--frame-accent': '#bbb' } });
    expect(root.style.getPropertyValue('--frame-accent')).toBe('#bbb');
    removeOther(); frame.dispose(); other.dispose();
    expect(root.style.getPropertyValue('margin')).toBe('5px');
  });
  test('disposal releases every owned root and prevents new mutations or attachment', () => {
    const frame = createFrame({ theme: input }), root = element(), portal = element();
    frame.theme.attach(root); frame.theme.attach(portal);
    frame.dispose(); frame.dispose(); frame.theme.reset();
    expect(root.style.getPropertyValue('--frame-bg')).toBe('');
    expect(portal.style.getPropertyValue('--frame-bg')).toBe('');
    expect(() => frame.theme.set(input)).toThrow('disposed');
    expect(() => frame.theme.attach(root)).toThrow('disposed');
  });
});
