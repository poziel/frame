import {expect, test} from 'bun:test';
import {themeTokenDescriptions} from './theme-token-descriptions';
import {extractCssContracts} from './css-contracts';

test('shared descriptions come from the owning TypeScript property TSDoc', () => {
  const descriptions = themeTokenDescriptions(
    `const tokens = {
    /** Foreground used for normal readable text across shell and controls. */
    '--frame-text': token('#ccc', 'color'),
  };`,
    'catalog.ts'
  );
  const result = extractCssContracts(
    '.control { color: var(--frame-text); }',
    'control.css',
    ['control'],
    {'--frame-text': '#ccc'},
    false,
    descriptions
  );
  expect(result.tokens[0]?.description).toBe(
    'Foreground used for normal readable text across shell and controls.'
  );
  expect(result.tokens[0]?.value).toBe('#ccc');
});

test('local token purpose comments override shared descriptions', () => {
  const result = extractCssContracts(
    `.control {
    /* Foreground on the selected control label. @token --frame-text */
    color: var(--frame-text);
  }`,
    'control.css',
    ['control'],
    {'--frame-text': '#ccc'},
    false,
    {'--frame-text': 'Shared text foreground.'}
  );
  expect(result.tokens[0]?.description).toBe(
    'Foreground on the selected control label.'
  );
  expect(result.tokens[0]?.value).toBe('#ccc');
});

test('context annotations describe runtime values without declaring a default', () => {
  const result = extractCssContracts(
    `.control {
    /* Digit count measured from the visible code line range. @token --frame-code-digits @context */
    width: calc(var(--frame-code-digits) * 1ch);
  }
  @keyframes orbit {
    to {
      /* Rotation angle advanced by the composer border animation. @token --frame-chat-angle @context */
      --frame-chat-angle: 360deg;
    }
  }`,
    'control.css',
    ['control'],
    {},
    true
  );
  expect(
    result.tokens.find(({name}) => name === '--frame-code-digits')
  ).toMatchObject({
    value: '',
    description: 'Digit count measured from the visible code line range.',
  });
  expect(
    result.tokens.find(({name}) => name === '--frame-chat-angle')
  ).toMatchObject({
    value: '',
    description: 'Rotation angle advanced by the composer border animation.',
  });
});
