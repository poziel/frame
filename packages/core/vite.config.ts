import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { posix } from 'node:path';

const modules = ['editor', 'terminal', 'viewer', 'chat', 'notifications'];
export default defineConfig({
  plugins: [vue(), {
    name: 'frame-library-styles',
    enforce: 'post',
    generateBundle(_options, bundle) {
      // Keep CSS attached to its owning JS chunk so consumer builds only collect
      // styles from modules they import, including styles of lazy chunks.
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const css = (chunk as typeof chunk & { viteMetadata?: { importedCss: Set<string> } }).viteMetadata?.importedCss;
        if (!css?.size) continue;
        const imports = [...css].map(file => {
          const relative = posix.relative(posix.dirname(chunk.fileName), file);
          return `import '${relative.startsWith('.') ? relative : './' + relative}';`;
        });
        chunk.code = imports.join('\n') + '\n' + chunk.code;
      }
    },
  }],
  publicDir: false,
  build: {
    outDir: "dist",
    cssCodeSplit: true,
    cssMinify: true,
    lib: {
      entry: Object.fromEntries([
        ['frame', 'src/index.ts'],
        ...modules.map(name => [`modules/${name}`, `src/modules/${name}/index.ts`]),
      ]),
      formats: ["es"],
      fileName: (_format, name) => `${name}.js`,
    },
    rolldownOptions: {
      // Installed automatically with Core; the application bundler owns Monaco's
      // dynamic import and can emit it only when the editor module is included.
      external: id => id === "vue" || /^monaco-editor(?:\/|$)/.test(id),
      output: { assetFileNames: asset => asset.names.some(name => name === 'frame.css' || name === 'src.css') ? 'frame.css' : 'assets/[name]-[hash][extname]' },
    },
  },
});
