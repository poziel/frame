import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import frameTailwind from "@frame/tailwind/vite";
import { fileURLToPath } from "node:url";
import { chatDemoServer } from "./chatDemoServer.ts";


export default defineConfig({
  plugins: [vue(), frameTailwind(), chatDemoServer()],
  publicDir: "../../assets",
  resolve: {
    alias: [
      { find: /^@frame\/core$/,  replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      ...['editor', 'chat', 'viewer', 'terminal', 'notifications'].map(name => ({ find: `@frame/core/modules/${name}`, replacement: fileURLToPath(new URL(`../core/src/modules/${name}/index.ts`, import.meta.url)) })),
      // Exact match keeps the package's JSON subpath exports available.
      { find: /^@frame\/themes$/, replacement: fileURLToPath(new URL('../themes/src/index.ts', import.meta.url)) },
    ],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
