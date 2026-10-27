import {renderThemeCSS} from '../src/themes/tokens/tokenCatalog';
import {writeFileSync} from 'node:fs';

writeFileSync(
  new URL('../src/themes/generated/default.css', import.meta.url),
  renderThemeCSS()
);
