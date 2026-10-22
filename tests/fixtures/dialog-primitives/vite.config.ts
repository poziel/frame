import {defineConfig} from '../../../packages/core/node_modules/vite/dist/node/index.js';
import vue from '../../../packages/core/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[vue()],resolve:{alias:{'@frame/core':fileURLToPath(new URL('../../../packages/core/src/frame/index.ts',import.meta.url))}},build:{outDir:'../../../.tmp/dialog-primitives',emptyOutDir:true}});
