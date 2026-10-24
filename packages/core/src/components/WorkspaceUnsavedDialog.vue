<script setup lang="ts">
import {onBeforeUnmount} from 'vue';
import FrameButton from './FrameButton.vue';
const props=defineProps<{titles: readonly string[]; respond:(discard:boolean)=>void}>();
onBeforeUnmount(()=>props.respond(false));
</script>
<template><div class="workspace-unsaved-dialog"><p>{{titles.length === 1 ? '“'+titles[0]+'” has unsaved changes.' : 'These documents have unsaved changes: '+titles.join(', ')+'.'}}</p><p>Your changes will be lost if you close without saving.</p><div class="workspace-unsaved-actions"><FrameButton label="Cancel" data-modal-autofocus @click="respond(false)"/><FrameButton label="Close without saving" variant="primary" @click="respond(true)"/></div></div></template>
