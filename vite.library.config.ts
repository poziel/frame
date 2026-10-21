import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "packages/frame/dist",
    lib: { entry: "src/frame/index.ts", formats: ["es"], fileName: "frame", cssFileName: "frame" },
    rolldownOptions: { external: id => id === "vue" || id.startsWith("@tauri-apps/") },
  },
});
