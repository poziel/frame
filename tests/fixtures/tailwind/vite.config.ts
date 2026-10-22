import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import frameTailwind from "@frame/tailwind/vite";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [frameTailwind()],
  build: { outDir: "../../../.tmp/tailwind-consumer", emptyOutDir: true },
});
