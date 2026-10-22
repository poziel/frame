import { defineConfig } from '../../../packages/core/node_modules/vite/dist/node/index.js';
import vue from '../../../packages/core/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import { fileURLToPath } from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[vue()],resolve:{alias:{vue:fileURLToPath(new URL("../../../node_modules/vue/dist/vue.esm-bundler.js",import.meta.url))}},build:{outDir:'../../../.tmp/forms-dates',emptyOutDir:true}});

