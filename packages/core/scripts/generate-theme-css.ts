import { renderThemeCSS } from '../src/themes/tokens';
import { writeFileSync } from 'node:fs';
writeFileSync(new URL('../src/themes/default.css', import.meta.url), renderThemeCSS());
