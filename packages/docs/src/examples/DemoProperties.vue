<script setup lang="ts">
import { FrameSelect, useFrame } from "@frame/core";
import DemoAdvancedProperties from "./DemoAdvancedProperties.vue";
const frame = useFrame();
import { ref } from "vue";
const name = ref("Launch workspace"); const density = ref("Comfortable"); const autosave = ref(true); const description = ref("A focused place for release planning and review.");
</script>
<template><div class="demo-properties"><nav aria-label="Property categories"><strong>General</strong><span>Appearance</span><span>Workflow</span></nav><form @submit.prevent><h1>Workspace properties</h1><p>Host-owned settings inside Frame’s movable modal.</p><label>Workspace name<input v-model="name" data-modal-autofocus/></label><label>Description<textarea v-model="description" rows="4"/></label><label>Reading density<FrameSelect v-model="density" label="Reading density" :options="['Comfortable', 'Compact'].map(value => ({ value, label: value }))"/></label><label class="demo-check"><input v-model="autosave" type="checkbox"/>Save drafts automatically</label><button class="sample-button" type="button" @click="frame.openModal({ id: 'demo.advanced', title: 'Advanced properties', component: DemoAdvancedProperties, width: 600, height: 320 })">Advanced properties…</button><p class="demo-muted">Move the header, resize an edge, or maximize the modal. Your edits stay in place.</p></form></div></template>
