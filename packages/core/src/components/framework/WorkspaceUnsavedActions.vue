<script setup lang="ts">
import FrameButton from '../actions/FrameButton.vue';

defineProps<{
  /** Resolves the pending close request; false preserves the documents. */
  respond: (discard: boolean) => void;
}>();
</script>

<template>
  <FrameButton label="Cancel" data-modal-autofocus @click="respond(false)" />
  <FrameButton
    label="Close without saving"
    variant="primary"
    @click="respond(true)"
  />
</template>
