import {parseTheme} from '@frame/core';
import definition from './presets/vscode-light-2026.json';
import highContrastBlack from './presets/vscode-high-contrast-black.json';
import highContrastWhite from './presets/vscode-high-contrast-white.json';
import dusk from './presets/frame-dusk.json';
import monokaiDark from './presets/frame-monokai-dark.json';
import monokaiLight from './presets/frame-monokai-light.json';

/** Validated immutable Monokai-inspired dark preset; imports apply no styles. */
export const frameMonokaiDark = parseTheme(JSON.stringify(monokaiDark));
/** Coordinated immutable light preset; selecting it remains host-owned. */
export const frameMonokaiLight = parseTheme(JSON.stringify(monokaiLight));

/** Frame's softer blue-gray dark palette. Importing applies no styles. */
export const frameDusk = parseTheme(JSON.stringify(dusk));

/** VS Code Light 2026 shell palette adapted to Frame. Importing applies no styles. */
export const vscodeLight2026 = parseTheme(JSON.stringify(definition));
/** Resolved immutable VS Code high-contrast dark palette; never auto-activated. */
export const vscodeHighContrastBlack = parseTheme(
  JSON.stringify(highContrastBlack)
);
/** Resolved immutable VS Code high-contrast light palette; never auto-activated. */
export const vscodeHighContrastWhite = parseTheme(
  JSON.stringify(highContrastWhite)
);
