<script setup lang="ts">
import '../styles/index.css';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'reka-ui';
import UniversalViewerContent from './UniversalViewerContent.vue';
import {viewerFileName, type ViewerFile} from '../services/viewer';

defineProps<{
  /** Controlled fullscreen dialog visibility. */
  open: boolean;
  /** Portable document; omission displays the existing empty state. */
  file?: ViewerFile;
  /** Portal destination; defaults to body. */
  target?: string | HTMLElement;
}>();
const emit = defineEmits<{
  /** Close-button and Escape requests forwarded to the controlling host. */
  'update:open': [open: boolean];
  /** Active content or renderer failure. */
  error: [error: unknown];
}>();
</script>
<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="target">
      <DialogOverlay class="frame-viewer-backdrop" />
      <DialogContent
        class="frame-viewer-dialog"
        :aria-describedby="undefined"
        @interact-outside.prevent
      >
        <header class="frame-viewer-header">
          <DialogTitle class="frame-viewer-title">{{
            file ? viewerFileName(file) : 'Document viewer'
          }}</DialogTitle>
          <DialogClose
            class="frame-viewer-button frame-viewer-close"
            aria-label="Close document viewer"
            >×</DialogClose
          >
        </header>
        <UniversalViewerContent
          v-if="file"
          :file="file"
          @error="emit('error', $event)"
        />
        <p v-else role="status">No document selected.</p>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
