import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),plugins:[vue()],resolve:{alias:{'@frame/core':fileURLToPath(new URL('../../../packages/core/src/index.ts',import.meta.url))}},server:{host:'127.0.0.1',port:1478,strictPort:true,fs:{allow:[fileURLToPath(new URL('../../../',import.meta.url))]}}});

