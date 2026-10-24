import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { host: '127.0.0.1', port: 1437, strictPort: true, fs: { allow: [fileURLToPath(new URL('../../../', import.meta.url))] } },
  build: { outDir: '../../../.tmp/theme-formats', emptyOutDir: true },
});
