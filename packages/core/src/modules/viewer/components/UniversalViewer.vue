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
  /* Z index for .frame-viewer-backdrop; viewer z index. @token --frame-viewer-z-index */
  --_frame-default-viewer-z-index-52ead56467: 1000;
  z-index: var(
    --frame-viewer-z-index,
    var(--_frame-default-viewer-z-index-52ead56467)
  );
  /* Background for .frame-viewer-backdrop; viewer backdrop. @token --frame-viewer-backdrop */
  --_frame-default-viewer-backdrop-98098ecc4d: rgb(0 0 0 / 80%);
  background: var(
    --frame-viewer-backdrop,
    var(--_frame-default-viewer-backdrop-98098ecc4d)
  );
  /* Backdrop filter for .frame-viewer-backdrop; viewer blur. @token --frame-viewer-blur */
  --_frame-default-viewer-blur-528cece281: 10px;
  backdrop-filter: blur(
    var(--frame-viewer-blur, var(--_frame-default-viewer-blur-528cece281))
  );
}

.frame-viewer-dialog {
  position: fixed;
  inset: 0;
  /* Z index for .frame-viewer-dialog; viewer z index. @token --frame-viewer-z-index */
  --_frame-default-viewer-z-index-52ead56467: 1000;
  z-index: var(
    --frame-viewer-z-index,
    var(--_frame-default-viewer-z-index-52ead56467)
  );
  display: flex;
  flex-direction: column;
  /* Padding for .frame-viewer-dialog; content padding. @token --frame-content-padding */
  --_frame-default-content-padding-130: 12px;
  padding: var(
    --frame-content-padding,
    var(--_frame-default-content-padding-130)
  );
  /* Color for .frame-viewer-dialog; text. @token --frame-text @context */
  color: var(--frame-text);
  /*   _frame default font body 84e892f96e for .frame-viewer-dialog; font size body. @token --frame-font-size-body */
  --_frame-default-font-size-body-5e0c1e1e0a: 12px;
  /* Font for .frame-viewer-dialog; font body. @token --frame-font-body */
  --_frame-default-font-body-84e892f96e: sans-serif;
  font: var(
      --frame-font-size-body,
      var(--_frame-default-font-size-body-5e0c1e1e0a)
    )
    var(--frame-font-body, var(--_frame-default-font-body-84e892f96e));
}

.frame-viewer-header {
  flex: none;
  justify-content: space-between;
  /* Margin bottom for .frame-viewer-header; gap. @token --frame-gap */
  --_frame-default-gap-3e2a1ab688: 6px;
  margin-bottom: var(--frame-gap, var(--_frame-default-gap-3e2a1ab688));
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
