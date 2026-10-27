import {defineConfig} from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: {index: 'src/index.ts'},
      formats: ['es'],
      fileName: (_format, name) => name + '.js',
    },
    rolldownOptions: {
      external: (id) => id === '@frame/core' || id.startsWith('@tauri-apps/'),
    },
  },
});
