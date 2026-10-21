<script setup lang="ts">
import { ref } from "vue";
import type { WorkspacePane } from "../frame";
defineProps<{ pane: WorkspacePane }>();
const note = ref("");
</script>
<template><div class="demo-inspector"><p class="demo-eyebrow">INDEPENDENT WORKSPACE PANE</p><h2>{{ pane.label }}</h2><label>Pane notes<textarea v-model="note" rows="8" placeholder="Each pane owns its content and state…"/></label><p class="demo-muted">Right-click the pane header to split or close this pane.</p></div></template>
