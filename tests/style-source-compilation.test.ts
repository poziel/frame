import {expect, test} from 'bun:test';
import {compileStyleSource} from '../packages/core/scripts/compile-style-source';

test('Vue style subrequests compile embedded SCSS and reject stale block indexes', () => {
  const source = 'packages/core/src/components/framework/WorkspaceCanvas.vue';
  const css = compileStyleSource(`${source}?vue&type=style&index=0&lang.scss`);
  expect(css).toBe(compileStyleSource(source));
  expect(css).toMatch(/var\(\s*--frame-empty-workspace-width\s*,/);
  expect(css).toMatch(/--_frame-default-empty-workspace-width[\w-]*:\s*100%;/);
  expect(css).not.toContain('<script');
  expect(() =>
    compileStyleSource(`${source}?vue&type=style&index=99&lang.scss`)
  ).toThrow('Missing Vue style block');
});
