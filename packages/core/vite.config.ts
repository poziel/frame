import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue(), {
    name: 'frame-library-styles',
    renderChunk(code, chunk) {
      if (chunk.isEntry) return { code: `import './frame.css';\n${code}`, map: null };
    },
  }],
  publicDir: false,
  build: {
    outDir: "dist",
    lib: { entry: "src/frame/index.ts", formats: ["es"], fileName: "frame", cssFileName: "frame" },
    rolldownOptions: { external: id => id === "vue" },
  },
});
