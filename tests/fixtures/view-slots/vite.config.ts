import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../..', import.meta.url));
export default defineConfig({ root, plugins: [vue()], resolve: { dedupe: ['vue'] }, optimizeDeps: { entries: ['tests/fixtures/view-slots/index.html'], include: ['vue', 'reka-ui'] } });
