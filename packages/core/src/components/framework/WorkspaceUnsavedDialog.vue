<script setup lang="ts">
import {onBeforeUnmount} from 'vue';

const props = defineProps<{
  titles: readonly string[];
  respond: (discard: boolean) => void;
}>();
onBeforeUnmount(() => props.respond(false));
</script>
<template>
  <div class="workspace-unsaved-dialog"
    ><p>{{
      titles.length === 1
        ? '“' + titles[0] + '” has unsaved changes.'
        : 'These documents have unsaved changes: ' + titles.join(', ') + '.'
    }}</p
    ><p>Your changes will be lost if you close without saving.</p></div
  >
</template>

<style lang="scss">
.workspace-unsaved-dialog {
  padding: 16px;
  color: var(--frame-text);
}

.workspace-unsaved-dialog p {
  margin: 0 0 12px;
}
</style>
