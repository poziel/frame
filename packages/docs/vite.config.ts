import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import frameTailwind from "@frame/tailwind/vite";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { chatDemoServer } from "./chatDemoServer.ts";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [vue(), frameTailwind(), chatDemoServer()],
  publicDir: "../../assets",
  resolve: {
    alias: {
      "@frame/core": fileURLToPath(new URL("../core/src/frame/index.ts", import.meta.url)),
      "@frame/extras": fileURLToPath(new URL("../extras/src/index.ts", import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
