import {defineConfig} from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        terminal: 'src/terminal.ts',
        agents: 'src/agents.ts',
      },
      formats: ['es'],
      fileName: (_format, name) => name + '.js',
    },
    rolldownOptions: {
      external: (id) =>
        id === '@frame/core' ||
        id.startsWith('@frame/core/') ||
        id.startsWith('@tauri-apps/'),
    },
  },
});
