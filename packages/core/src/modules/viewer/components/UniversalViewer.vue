<script setup lang="ts">
import '../styles/index.scss';
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
        <header class="frame-viewer-header frame-viewer-control-row">
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

<style lang="scss">
.frame-viewer-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--frame-viewer-z-index, 1000);
  background: var(--frame-viewer-backdrop, rgb(0 0 0 / 80%));
  backdrop-filter: blur(var(--frame-viewer-blur, 10px));
}

.frame-viewer-dialog {
  position: fixed;
  inset: 0;
  z-index: var(--frame-viewer-z-index, 1000);
  display: flex;
  flex-direction: column;
  padding: var(--frame-content-padding, 12px);
  color: var(--frame-text);
  font: var(--frame-font-size-body, 12px) var(--frame-font-body, sans-serif);
}

.frame-viewer-header {
  flex: none;
  justify-content: space-between;
  margin-bottom: var(--frame-gap, 6px);
}

.frame-viewer-title {
  margin: 0;
  font-size: inherit;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

.frame-viewer-close {
  font-size: 24px;
  line-height: 1;
}
</style>
