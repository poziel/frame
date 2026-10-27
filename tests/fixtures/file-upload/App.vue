<script setup lang="ts">
import { ref } from 'vue';
import FrameFileUpload from '../../../packages/core/src/components/forms/FrameFileUpload.vue';
import FrameFileDropZone from '../../../packages/core/src/components/forms/FrameFileDropZone.vue';
const files = ref<File[]>([]), count = ref(0), disabled = ref(false), accepted = ref('');
const uploader = ref<InstanceType<typeof FrameFileUpload>>();
</script>
<template>
  <FrameFileUpload ref="uploader" v-model="files" accept=".png" :max-size="4" @accepted="count++" />
  <button id="api-open" @click="uploader?.open()">API open</button><button id="clear" @click="uploader?.clear()">Clear</button>
  <button id="disable" @click="disabled = !disabled">Disable</button>
  <output id="count">{{ count }}</output><output id="accepted">{{ accepted }}</output>
  <FrameFileDropZone id="overlay" appearance="overlay" :disabled="disabled" accept=".png" @accepted="accepted = $event.map(f => f.name).join(',')"><input id="canvas" value="retained" /><template #overlay>Import image</template></FrameFileDropZone>
  <FrameFileDropZone id="visible" multiple :max-files="2" @accepted="accepted = $event.map(f => f.name).join(',')" />
  <FrameFileDropZone id="outer" @accepted="accepted = 'outer'"><FrameFileDropZone id="inner" @accepted="accepted = 'inner'" /></FrameFileDropZone>
</template>
