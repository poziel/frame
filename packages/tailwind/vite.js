import tailwind from '@tailwindcss/vite';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const stylesheet = realpathSync(fileURLToPath(new URL('./style.css', import.meta.url))).replaceAll('\\', '/');

export default function frameTailwind(options) {
  let root;
  return [{
    name: 'frame-tailwind-sources',
    enforce: 'pre',
    configResolved(config) {
      root = config.root.replaceAll('\\', '/');
    },
    transform(code, id) {
      const path = id.split('?')[0];
      let resolved;
      try { resolved = realpathSync(path).replaceAll('\\', '/'); } catch { return; }
      if (resolved !== stylesheet) return;
      return { code: `${code}\n@source ${JSON.stringify(root)};\n`, map: null };
    },
  }, ...tailwind(options)];
}
