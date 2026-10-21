import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    outDir: "dist",
    lib: { entry: "src/frame/index.ts", formats: ["es"], fileName: "frame", cssFileName: "frame" },
    rolldownOptions: { external: id => id === "vue" || id.startsWith("@tauri-apps/") },
  },
});
