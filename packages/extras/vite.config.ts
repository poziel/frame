import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    outDir: "dist",
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "extras", cssFileName: "extras" },
    rolldownOptions: { external: ["vue", "@frame/core", /^monaco-editor(?:\/|$)/] },
  },
});
