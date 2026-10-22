import vue from "../../../packages/core/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "node:url";
// Resolve the package-local build dependency without adding fixture runtime dependencies.
export default {
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [vue()],
  server: { port: 1433, strictPort: true, fs: { allow: [fileURLToPath(new URL("../../..", import.meta.url))] } },
  build: { outDir: "../../../.tmp/forms-controls", emptyOutDir: true },
};
