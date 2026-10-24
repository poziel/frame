import { computed, shallowReactive, shallowRef, type ComputedRef } from 'vue';
import { defineTheme, type FrameTheme, type FrameThemeDefinition } from './theme';
import { themeTokens, themeTokenNames } from './tokens';

export interface FrameThemeController {
  readonly current: ComputedRef<FrameTheme | null>;
  readonly available: ComputedRef<readonly FrameTheme[]>;
  register(theme: FrameTheme | FrameThemeDefinition): () => void;
  set(theme: FrameTheme | FrameThemeDefinition): void;
  reset(): void;
  attach(element: HTMLElement): () => void;
  dispose(): void;
}
// Ownership bookkeeping only: theme state is always per controller.
const owners = new WeakMap<HTMLElement, object>();
const typography = {
  color: 'var(--frame-text)',
  'font-family': 'var(--frame-font-body)',
  'font-size': 'var(--frame-font-size-body)',
  'line-height': 'var(--frame-line-height-body)',
} as const;
export function createThemeController(initial?: FrameTheme | FrameThemeDefinition): FrameThemeController {
  const selected = shallowRef<FrameTheme | null>(initial ? defineTheme(initial) : null);
  const available = shallowReactive(new Map<string, FrameTheme>());
  if (selected.value) available.set(selected.value.id, selected.value);
  const bindings = new Map<HTMLElement, { update(): void; detach(): void }>();
  const identity = {};
  let disposed = false;
  function assertActive() { if (disposed) throw new Error('Frame theme has been disposed'); }
  function apply() { for (const binding of bindings.values()) binding.update(); }
  function attach(element: HTMLElement) {
    assertActive();
    if (owners.has(element)) throw new Error('Theme target is already attached');
    owners.set(element, identity);
    const scopeAttribute = 'data-frame-theme-scope';
    const previousScope = element.getAttribute(scopeAttribute);
    element.setAttribute(scopeAttribute, '');
    const previous = new Map<string, [string, string]>(), written = new Map<string, string>();
    function restore() {
      for (const [key, value] of written) {
        // A subsequent host write is host-owned and must survive cleanup.
        if (element.style.getPropertyValue(key) === value && element.style.getPropertyPriority(key) === '') {
          const [old, priority] = previous.get(key)!;
          if (old) element.style.setProperty(key, old, priority); else element.style.removeProperty(key);
        }
      }
      previous.clear(); written.clear();
    }
    function write(key: string, value: string) {
      if (!previous.has(key)) previous.set(key, [element.style.getPropertyValue(key), element.style.getPropertyPriority(key)]);
      element.style.setProperty(key, value);
      // CSSOM normalizes some values. Record the actual value for ownership checks.
      written.set(key, element.style.getPropertyValue(key));
    }
    function update() {
      restore();
      const theme = selected.value;
      if (theme) {
        for (const name of themeTokenNames) {
          const value = theme.tokens[name] ?? themeTokens[name].value;
          if (value !== '') write(name, value);
        }
        write('color-scheme', theme.appearance);
      }
      for (const [key, value] of Object.entries(typography)) write(key, value);
    }
    function detach() {
      if (bindings.get(element)?.detach !== detach) return;
      restore(); bindings.delete(element); owners.delete(element);
      if (element.getAttribute(scopeAttribute) === '') {
        if (previousScope === null) element.removeAttribute(scopeAttribute);
        else element.setAttribute(scopeAttribute, previousScope);
      }
    }
    bindings.set(element, { update, detach }); update();
    return detach;
  }
  return {
    current: computed(() => selected.value),
    available: computed(() => [...available.values()]),
    register(theme) {
      assertActive(); const definition = defineTheme(theme);
      if (available.has(definition.id)) throw new Error(`Theme already registered: ${definition.id}`);
      available.set(definition.id, definition);
      return () => { if (available.get(definition.id) === definition) available.delete(definition.id); };
    },
    set(theme) { assertActive(); const next = defineTheme(theme); selected.value = next; apply(); },
    reset() { if (disposed) return; selected.value = null; apply(); },
    attach,
    dispose() { if (disposed) return; disposed = true; available.clear(); for (const binding of [...bindings.values()]) binding.detach(); selected.value = null; },
  };
}
