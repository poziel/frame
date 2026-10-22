import vue from "../../../packages/core/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "node:url";
export default {root:fileURLToPath(new URL('.',import.meta.url)),plugins:[vue()],server:{port:1452,strictPort:true,fs:{allow:[fileURLToPath(new URL('../../..',import.meta.url))]}},build:{outDir:'../../../.tmp/general-b',emptyOutDir:true}};
