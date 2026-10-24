import { defineConfig } from 'vite';
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist',
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'themes' },
    rolldownOptions: { external: ['@frame/core'] },
  },
});
