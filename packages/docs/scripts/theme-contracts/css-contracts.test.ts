import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {extractCssContracts} from './css-contracts';

describe('CSS declaration contracts', () => {
  test('reads documented private defaults and their public names', () => {
    const result = extractCssContracts(
      `
      .control {
        /** Space between the icon and label. @token --frame-control-gap */
        --_frame-default-control-gap: calc(var(--frame-gap) * 2);
        gap: var(--frame-control-gap, var(--_frame-default-control-gap));
      }
    `,
      'control.css',
      ['control']
    );
    expect(
      result.tokens.filter(({name}) => name === '--frame-control-gap')
    ).toEqual([
      {
        name: '--frame-control-gap',
        value: 'calc(var(--frame-gap) * 2)',
        description: 'Space between the icon and label.',
        selector: '.control',
        source: 'control.css',
      },
    ]);
  });

  test('walks nested at-rules and retains selector context', () => {
    const result = extractCssContracts(
      `@media (hover: hover) {
      .control:hover {
        /* Hover surface. */
        --frame-control-hover: color-mix(in srgb, red 20%, blue);
      }
    }`,
      'control.css',
      ['control']
    );
    expect(result.tokens[0]?.selector).toBe(
      '@media (hover: hover) { .control:hover }'
    );
    expect(result.tokens[0]?.value).toBe('color-mix(in srgb, red 20%, blue)');
  });

  test('does not invent descriptions for undocumented fallbacks', () => {
    const result = extractCssContracts(
      '.control { color: var(--frame-color, rgb(1, 2, 3)); }',
      'control.css',
      ['control']
    );
    expect(result.tokens[0]?.description).toBe('');
    expect(result.tokens[0]?.value).toBe('rgb(1, 2, 3)');
  });

  test('ignores negated class membership and custom-property internals', () => {
    const result = extractCssContracts(
      '.other:not(.control) { color: var(--frame-hidden, red); } .control { --private: var(--frame-internal); }',
      'control.css',
      ['control']
    );
    expect(
      result.tokens.filter(({name}) => name === '--frame-control-gap')
    ).toEqual([]);
  });
});

test('preserves distinct defaults for the same token in orientation contexts', () => {
  const result = extractCssContracts(
    `
    .control[data-orientation="horizontal"] {
      /* Space around horizontal triggers. @token --frame-control-padding */
      --_frame-default-horizontal-padding: 12px 0;
      padding: var(--frame-control-padding, var(--_frame-default-horizontal-padding));
    }
    .control[data-orientation="vertical"] {
      /* Space around vertical triggers. @token --frame-control-padding */
      --_frame-default-vertical-padding: 8px 12px;
      padding: var(--frame-control-padding, var(--_frame-default-vertical-padding));
    }
    .control[data-orientation="horizontal"] {
      margin: var(--frame-control-padding, 0);
    }
  `,
    'control.css',
    ['control']
  );
  expect(result.tokens).toHaveLength(2);
  expect(result.tokens.map(({value}) => value)).toEqual(['12px 0', '8px 12px']);
  expect(result.tokens.map(({selector}) => selector)).toEqual([
    '.control[data-orientation="horizontal"]',
    '.control[data-orientation="vertical"]',
  ]);
  expect(
    result.tokens.every(
      ({name, value}) =>
        name === '--frame-control-padding' && !value.includes('--_frame-')
    )
  ).toBe(true);
});

test('keeps conditional defaults separate even when their selectors match', () => {
  const result = extractCssContracts(
    `
    .control { padding: var(--frame-control-padding, 4px); }
    @media (max-width: 500px) { .control { padding: var(--frame-control-padding, 2px); } }
  `,
    'control.css',
    ['control']
  );
  expect(result.tokens.map(({value}) => value)).toEqual(['4px', '2px']);
});

test('real tabs retain horizontal and vertical baseline and indicator contracts', () => {
  const source = new URL(
    '../../../core/src/components/shared/general-b.css',
    import.meta.url
  );
  const result = extractCssContracts(
    readFileSync(source, 'utf8'),
    'general-b.css',
    ['frame-tabs', 'frame-tabs-list', 'frame-tabs-trigger']
  );
  for (const name of [
    '--frame-tabs-list-border',
    '--frame-tabs-indicator-width',
    '--frame-tabs-indicator-color',
  ]) {
    const rows = result.tokens.filter((token) => token.name === name);
    expect(rows).toHaveLength(2);
    expect(rows.some(({selector}) => selector.includes('vertical'))).toBe(true);
    expect(
      rows.every(
        ({value, description}) =>
          !value.includes('--_frame-default-') && description.length > 0
      )
    ).toBe(true);
  }
});

test('nested documented defaults expose public fallback expressions without private aliases', () => {
  const result = extractCssContracts(
    `
    .control {
      /* Resting surface fallback. @token --frame-shared-surface */
      --_frame-default-shared: #242424;
      /* Resting control surface. @token --frame-control-background */
      --_frame-default-background: var(--frame-shared-surface, var(--_frame-default-shared));
      background: var(--frame-control-background, var(--_frame-default-background));
    }
  `,
    'control.css',
    ['control']
  );
  expect(
    result.tokens.find(({name}) => name === '--frame-control-background')?.value
  ).toBe('var(--frame-shared-surface, #242424)');
  expect(
    result.tokens.find(({name}) => name === '--frame-shared-surface')?.value
  ).toBe('#242424');
  expect(
    result.tokens.every(({value}) => !value.includes('--_frame-default-'))
  ).toBe(true);
});

test('keeps contextual public references inside private defaults in the inventory', () => {
  const result = extractCssContracts(
    `
    .control {
      /* Background of the control. @token --frame-control-background */
      --_frame-default-background: var(--frame-context-background);
      background: var(--frame-control-background, var(--_frame-default-background));
    }
  `,
    'control.css',
    ['control']
  );
  expect(
    result.tokens.find(({name}) => name === '--frame-context-background')
  ).toEqual({
    name: '--frame-context-background',
    value: '',
    description: '',
    selector: '.control',
    source: 'control.css',
  });
});
