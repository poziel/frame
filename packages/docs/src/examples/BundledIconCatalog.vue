<script setup lang="ts">
import { computed, ref } from "vue";
import { icons } from "@iconify-json/codicon";
import FrameIcon from "../../../core/src/components/FrameIcon.vue";
import FrameIconButton from "../../../core/src/components/FrameIconButton.vue";
import FrameTextInput from "../../../core/src/components/FrameTextInput.vue";
const query = ref<string | number>(""), message = ref("");
const names = Object.keys(icons.icons).sort();
const filtered = computed(() => names.filter(name => name.includes(String(query.value).trim().toLowerCase())));
async function copy(name: string, code: boolean) {
  try {
    await navigator.clipboard.writeText(code ? `<FrameIcon name="codicon:${name}" :size="20" />` : name);
    message.value = `Copied ${name} ${code ? 'component code' : 'name'}.`;
  } catch { message.value = "Copy failed. Allow clipboard access and try again."; }
}
</script>
<template><div class="bundled-icon-catalog"><FrameTextInput v-model="query" type="search" aria-label="Search bundled icons" placeholder="Search bundled Codicons…"/><p>{{ filtered.length }} of {{ names.length }} bundled icons. Click an icon to copy its component code.</p><p role="status">{{ message }}</p><div class="icon-catalog-grid"><div v-for="name in filtered" :key="name" class="icon-catalog-item"><button type="button" class="icon-catalog-preview" :aria-label="`Copy ${name} icon code`" @click="copy(name, true)"><FrameIcon :name="`codicon:${name}`" :size="28"/></button><div class="icon-catalog-name"><code>{{ name }}</code><FrameIconButton icon="copy" :label="`Copy ${name} name`" @click="copy(name, false)"/></div></div></div><p v-if="!filtered.length">No matching icons.</p></div></template>
