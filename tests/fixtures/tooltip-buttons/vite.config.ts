import vue from "../../../packages/core/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "node:url";
export default {
 root:fileURLToPath(new URL(".",import.meta.url)),plugins:[vue()],
 resolve:{alias:{"@frame/core":fileURLToPath(new URL("../../../packages/core/src/index.ts",import.meta.url))}},
 server:{port:1449,strictPort:true,fs:{allow:[fileURLToPath(new URL("../../..",import.meta.url))]}},
};
