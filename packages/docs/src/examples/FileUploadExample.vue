<script setup lang="ts">
import { ref } from 'vue';
import { FrameButton, FrameCheckbox, FrameFileUpload, FrameFileDropZone, FrameTextField, FrameSelect, type FileRejection } from '@frame/core';
const props = defineProps<{ id: string; variant?: string }>();
const files = ref<File[]>([]), received = ref<string[]>([]), events = ref<string[]>([]);
const disabled = ref(false), multiple = ref(true), showFiles = ref(true);
const appearance = ref<'zone' | 'overlay'>(props.variant === 'overlay' ? 'overlay' : 'zone');
const accept = ref(''), maxSize = ref<string | number>(10485760), maxFiles = ref<string | number>(3);
const notes = ref('Edit this workspace while no files are being dragged.');
const picker = ref<InstanceType<typeof FrameFileUpload>>();
const zone = ref<InstanceType<typeof FrameFileDropZone>>();
function accepted(value: File[]) {
  received.value = value.map(file => `${file.name} (${file.size} bytes)`);
  events.value = [`Accepted ${value.length}: ${value.map(file => file.name).join(', ')}`, ...events.value].slice(0, 8);
}
function rejected(value: FileRejection[]) { events.value = [...value.map(item => `Rejected (${item.code}): ${item.file.name}`), ...events.value].slice(0, 8); }
</script>
<template>
  <div class="file-upload-example" :data-upload-example="id">
    <div class="file-upload-example-options">
      <FrameCheckbox v-model="disabled" label="Disabled" />
      <FrameCheckbox v-model="multiple" label="Allow multiple files" />
      <FrameCheckbox v-if="id === 'file-upload'" v-model="showFiles" label="Show selected files" />
      <label>Accepted file types<FrameTextField v-model="accept" placeholder="Any file, or image/*,.txt" /></label>
      <label>Maximum bytes per file<FrameTextField v-model="maxSize" type="number" min="0" /></label>
      <label>Maximum files per selection<FrameTextField v-model="maxFiles" type="number" min="0" /></label>
      <label v-if="id === 'file-drop-zone'">Appearance<FrameSelect v-model="appearance" :options="[{value:'zone',label:'Visible zone'},{value:'overlay',label:'Invisible until dragging'}]" label="Appearance" /></label>
    </div>
    <p>Files stay in this browser. Try selecting the same file twice or exceeding a limit.</p>
    <FrameFileUpload v-if="id === 'file-upload'" ref="picker" v-model="files" :disabled="disabled" :multiple="multiple" :show-files="showFiles" :accept="String(accept)" :max-size="Number(maxSize)" :max-files="Number(maxFiles)" @accepted="accepted" @rejected="rejected" />
    <FrameFileDropZone v-else ref="zone" :appearance="appearance" :disabled="disabled" :multiple="multiple" :accept="String(accept)" :max-size="Number(maxSize)" :max-files="Number(maxFiles)" message="Drop files to open them" @accepted="accepted" @rejected="rejected">
      <div v-if="appearance === 'overlay'" class="file-upload-example-workspace">
        <strong>Workspace preview</strong>
        <textarea v-model="notes" aria-label="Workspace notes" />
        <p>Drag files over this workspace to reveal the overlay. Your edits remain when you drop or leave.</p>
      </div>
      <template #overlay><strong>Drop files to open them</strong></template>
    </FrameFileDropZone>
    <div class="file-upload-example-actions">
      <FrameButton :disabled="disabled" variant="secondary" @click="id === 'file-upload' ? picker?.open() : zone?.open()">Browse through component API</FrameButton>
      <FrameButton v-if="id === 'file-upload'" :disabled="disabled" @click="picker?.clear()">Clear selection</FrameButton>
    </div>
    <div role="status" aria-live="polite"><strong>Last accepted files</strong><ul><li v-for="(name,index) in received" :key="index">{{ name }}</li></ul><p v-if="!received.length">No files accepted yet.</p></div>
    <details open><summary>Recent events</summary><ul><li v-for="(event,index) in events" :key="index">{{ event }}</li></ul></details>
  </div>
</template>
<style scoped>
.file-upload-example { display: grid; gap: var(--frame-content-padding, 12px); width: 100%; min-width: 0; }
.file-upload-example-options { display: flex; flex-wrap: wrap; gap: var(--frame-content-padding, 12px); align-items: center; }
.file-upload-example-options > label { display: grid; gap: var(--frame-gap, 6px); }
.file-upload-example-workspace { display: grid; gap: var(--frame-gap, 6px); padding: var(--frame-content-padding, 12px); background: var(--frame-canvas); border: 1px solid var(--frame-line); border-radius: var(--frame-control-radius); }
.file-upload-example-workspace textarea { min-height: 140px; resize: vertical; color: var(--frame-text); background: var(--frame-control-background); border: 1px solid var(--frame-control-border); padding: var(--frame-content-padding, 12px); font: inherit; }
.file-upload-example-actions { display: flex; flex-wrap: wrap; gap: var(--frame-gap, 6px); }
</style>
