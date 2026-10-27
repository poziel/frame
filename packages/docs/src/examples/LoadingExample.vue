<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { FrameLoading, FrameButton, FrameTextField, FrameSelect, FrameCheckbox, frameLoaderVariants, type FrameLoaderVariant, type FrameLoadingTextPosition } from "@frame/core";

const active = ref(true), completed = ref(0), outside = ref(0), name = ref<string | number>("My workspace");
const variant = ref<FrameLoaderVariant>("ring");
const message = ref<string | number>("Preparing workspace…"), textPosition = ref<FrameLoadingTextPosition>("below");
const showLoader = ref(true), showText = ref(true), preview = ref(false);
const textAttribute = computed(() => String(message.value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"));
let timer: ReturnType<typeof setTimeout> | undefined;
function load() {
  clearTimeout(timer);
  active.value = true;
  timer = setTimeout(() => { completed.value++; active.value = false; }, 2000);
}
onMounted(load);
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <FrameSelect :model-value="variant" label="Loader style" :options="frameLoaderVariants.map(value => ({ value, label: value }))" @update:model-value="variant = $event as FrameLoaderVariant" />
  <label class="loading-example-field">Loading text<FrameTextField v-model="message" /></label>
  <FrameSelect :model-value="textPosition" label="Text position" :options="[{ value: 'above', label: 'Above loader' }, { value: 'below', label: 'Below loader' }, { value: 'left', label: 'Left of loader' }, { value: 'right', label: 'Right of loader' }]" @update:model-value="textPosition = $event as FrameLoadingTextPosition" />
  <div class="showcase-row"><FrameCheckbox v-model="showLoader" label="Show loader"/><FrameCheckbox v-model="showText" label="Show text"/><FrameCheckbox v-model="preview" label="Keep preview visible"/></div>
  <div class="showcase-row"><FrameButton variant="secondary" :disabled="active" @click="load">Reload region</FrameButton><FrameButton variant="secondary" @click="outside++">Outside action · {{ outside }}</FrameButton></div>
  <FrameLoading :active="active || preview" :variant="variant" :text="String(message)" :text-position="textPosition" :show-loader="showLoader" :show-text="showText" class="loading-example-region">
    <div class="loading-example-content"><label>Workspace name<FrameTextField v-model="name" /></label><p>Completed {{ completed }} load{{ completed === 1 ? '' : 's' }}. Edit the name, then reload: its value stays intact.</p><FrameButton variant="secondary" @click="load">Reload from inside</FrameButton></div>
  </FrameLoading>
  <p>The two-second task continues while this region is covered. Try the outside action during loading.</p>
  <pre class="loading-example-snippet">{{ `<FrameLoading :active="loading" variant="${variant}" text="${textAttribute}" text-position="${textPosition}" :show-loader="${showLoader}" :show-text="${showText}">\n  <WorkspaceContent />\n</FrameLoading>` }}</pre>
</template>
<style scoped>
.loading-example-region { border: 1px solid var(--frame-line); min-height: 180px; }
.loading-example-content { display: grid; gap: 16px; padding: 20px; }
.loading-example-content label { display: grid; gap: 8px; }
.loading-example-field { display: grid; gap: 8px; }
.loading-example-snippet { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 11px; }
</style>
