import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import frameTailwind from "@frame/tailwind/vite";
// This workspace fixture reuses the integration's Tailwind installation.
// An existing Tailwind application resolves its own direct dependency instead.
const tailwindRequire = createRequire(fileURLToPath(new URL('../../../packages/tailwind/vite.js', import.meta.url)));
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [frameTailwind()],
  resolve: { alias: { tailwindcss: dirname(tailwindRequire.resolve('tailwindcss/theme.css')) } },
  build: { outDir: "../../../.tmp/tailwind-consumer", emptyOutDir: true,
    rolldownOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), additive: fileURLToPath(new URL('./additive.html', import.meta.url)), light2026: fileURLToPath(new URL('./light-2026.html', import.meta.url)) } },
  },
});
