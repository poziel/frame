import type {CodeBlockTheme} from './codeThemes';

export interface FrameCodeBlockProps {

  /** Source text rendered without modification and used by the copy action. */
  code: string;

  /** A Shiki language name or alias. Unknown languages are displayed as plain text. */
  language?: string;

  /** Syntax-highlighting theme applied to the code block. */
  theme?: CodeBlockTheme;

  /** Displays a gutter with line numbers. */
  lineNumbers?: boolean;

  /** Highlights the code line under the pointer. */
  highlightOnHover?: boolean;

  /** Displayed line numbers, including the startLine offset. */
  highlightedLines?: readonly number[];

  /** Displayed first line number; invalid values are normalized to a positive integer. */
  startLine?: number;

  /** Wraps long source lines within the available width. */
  wrap?: boolean;

  /** Displays the copy-code toolbar. */
  copyable?: boolean;

  /** Accessible name of the code block and its source region. */
  label?: string;
}

export function codeStartLine(value: number): number {
  return Number.isFinite(value)
    ? Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(value)))
    : 1;
}

export function plainCodeLines(
  code: string
): {content: string; color?: string; fontStyle?: number}[][] {
  return code.split(/\r\n|\n|\r/).map((content) => [{content}]);
}
