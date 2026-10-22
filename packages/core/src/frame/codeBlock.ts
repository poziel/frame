import type { CodeBlockTheme } from "./codeThemes";

export interface FrameCodeBlockProps {
  code: string;
  /** A Shiki language name or alias. Unknown languages are displayed as plain text. */
  language?: string;
  theme?: CodeBlockTheme;
  lineNumbers?: boolean;
  highlightOnHover?: boolean;
  /** Displayed line numbers, including the startLine offset. */
  highlightedLines?: readonly number[];
  startLine?: number;
  wrap?: boolean;
  copyable?: boolean;
  label?: string;
}

export function codeStartLine(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(value))) : 1;
}

export function plainCodeLines(code: string): { content: string; color?: string; fontStyle?: number }[][] {
  return code.split(/\r\n|\n|\r/).map(content => [{ content }]);
}
