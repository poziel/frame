<script setup lang="ts">
import { ref } from "vue";
const note = ref('Keep the workspace focused.'); const status = ref('In progress');
</script>
<template><div class="demo-inspector"><p class="demo-eyebrow">SELECTED WORKSPACE</p><h2>Launch workspace</h2><label>Status<select v-model="status"><option>In progress</option><option>Ready for review</option><option>Complete</option></select></label><label>Notes<textarea v-model="note" rows="5"/></label><p class="demo-muted">Move this view to another region. Your notes stay with it.</p></div></template>
