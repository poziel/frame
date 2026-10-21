<script setup lang="ts">
import { ref } from "vue";
import { FrameSelect } from "@frame/core";
const note = ref('Keep the workspace focused.'); const status = ref('In progress');
</script>
<template><div class="demo-inspector"><p class="demo-eyebrow">SELECTED WORKSPACE</p><h2>Launch workspace</h2><label>Status<FrameSelect v-model="status" label="Status" :options="['In progress', 'Ready for review', 'Complete'].map(value => ({ value, label: value }))"/></label><label>Notes<textarea v-model="note" rows="5"/></label><p class="demo-muted">Move this view to another region. Your notes stay with it.</p></div></template>
