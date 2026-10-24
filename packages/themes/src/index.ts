import { parseTheme } from '@frame/core';
import definition from './presets/vscode-light-2026.json';
import highContrastBlack from './presets/vscode-high-contrast-black.json';
import highContrastWhite from './presets/vscode-high-contrast-white.json';

/** VS Code Light 2026 shell palette adapted to Frame. Importing applies no styles. */
export const vscodeLight2026 = parseTheme(JSON.stringify(definition));
/** Resolved VS Code high-contrast palettes; imports never activate a theme. */
export const vscodeHighContrastBlack = parseTheme(JSON.stringify(highContrastBlack));
export const vscodeHighContrastWhite = parseTheme(JSON.stringify(highContrastWhite));
