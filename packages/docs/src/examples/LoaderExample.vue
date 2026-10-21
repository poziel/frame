<script setup lang="ts">
import { computed, ref } from "vue";
import { FrameLoader, FrameButton, FrameTextInput, frameLoaderVariants, type FrameLoaderVariant } from "@frame/core";

const selected = ref<FrameLoaderVariant>("ring"), search = ref<string | number>("");
const copied = ref(false);
const visible = computed(() => frameLoaderVariants.filter(name => name.includes(String(search.value).toLowerCase().trim().replace(/ /g, "-"))));
const snippet = computed(() => `<FrameLoader variant="${selected.value}" :size="40" label="Loading…" />`);
function choose(variant: FrameLoaderVariant) { selected.value = variant; copied.value = false; }
async function copy() { await navigator.clipboard.writeText(`import { FrameLoader } from '@frame/core';\n\n${snippet.value}`); copied.value = true; }
</script>
<template>
  <p>All 44 LDRS styles are available as standalone loaders. Choose a style to see its usage.</p>
  <div class="loader-selection"><FrameLoader :variant="selected" :size="48" :label="selected"/><code>{{ snippet }}</code><FrameButton variant="secondary" @click="copy">{{ copied ? 'Copied' : 'Copy usage' }}</FrameButton></div>
  <FrameTextInput v-model="search" type="search" aria-label="Filter loader styles" placeholder="Filter 44 loader styles…" />
  <div class="loader-gallery">
    <button v-for="variant in visible" :key="variant" class="loader-card" :aria-pressed="selected === variant" :aria-label="`Use ${variant}`" @click="choose(variant)"><FrameLoader :variant="variant" :size="36" decorative/><code>{{ variant }}</code></button>
  </div>
  <p v-if="!visible.length">No matching loader styles.</p>
</template>
<style scoped>
.loader-selection { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px; border: 1px solid var(--frame-line); }
.loader-selection code { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.loader-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(132px, 100%), 1fr)); gap: 8px; }
button.loader-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; min-height: 116px; padding: 16px 8px; border: 1px solid var(--frame-line); background: var(--frame-surface); }
button.loader-card:hover, button.loader-card[aria-pressed="true"] { border-color: var(--frame-accent); }
.loader-card code { font-size: 11px; }
</style>
