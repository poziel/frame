import { reactive, shallowRef } from "vue";

/** Per-frame navigation. Transactions group related synchronous navigation calls. */
export function createNavigation<T>(options: { enabled: () => boolean; capture: () => T; restore: (location: T) => void; equal: (a: T, b: T) => boolean }) {
  const entries = shallowRef<T[]>([]);
  const index = shallowRef(-1);
  let depth = 0;
  let restoring = false;
  function clear() { entries.value = []; index.value = -1; }
  function record<R>(run: () => R): R {
    if (!options.enabled() || restoring || depth) return run();
    const before = options.capture();
    depth++;
    try { return run(); }
    finally {
      depth--;
      const after = options.capture();
      if (!options.equal(before, after)) {
        const path = entries.value.slice(0, index.value + 1);
        if (!path.length || !options.equal(path[path.length - 1]!, before)) path.push(before);
        path.push(after);
        entries.value = path;
        index.value = path.length - 1;
      }
    }
  }
  function go(delta: number) {
    const target = index.value + delta;
    if (!options.enabled() || target < 0 || target >= entries.value.length) return false;
    restoring = true;
    try { options.restore(entries.value[target]!); index.value = target; return true; }
    finally { restoring = false; }
  }
  return reactive({
    get canGoBack() { return options.enabled() && index.value > 0; },
    get canGoForward() { return options.enabled() && index.value >= 0 && index.value < entries.value.length - 1; },
    back: () => go(-1), forward: () => go(1), clear, record,
  });
}
