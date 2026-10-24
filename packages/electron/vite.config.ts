import { defineConfig } from 'vite';
export default defineConfig({ publicDir: false, build: { lib: { entry: { index: 'src/index.ts', main: 'src/main.ts', preload: 'src/preload.ts' }, formats: ['es'], fileName: (_format, name) => name + '.js' }, rolldownOptions: { external: id => !id.startsWith('.') && !id.startsWith('/') } } });
