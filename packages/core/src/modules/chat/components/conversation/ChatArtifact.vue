<script setup lang="ts">
import '../../styles/index.scss';
import {computed, onBeforeUnmount, ref, watch} from 'vue';
import {
  FrameButton,
  FrameDialog,
  FrameIcon,
  FrameIconButton,
} from '../../../../index';
import type {ChatArtifactPart} from '../../types/chatTypes';
import ViewerContent from '../../../viewer/components/UniversalViewerContent.vue';

const props = defineProps<{part: ChatArtifactPart}>();
const open = ref(false),
  imageFailed = ref(false);
const downloading = ref(false),
  downloadError = ref('');
let downloadController: AbortController | undefined;
const downloadUrls = new Map<string, ReturnType<typeof setTimeout>>();
function cancelDownload() {
  downloadController?.abort();
  downloadController = undefined;
  downloading.value = false;
  for (const [url, timer] of downloadUrls) {
    clearTimeout(timer);
    URL.revokeObjectURL(url);
  }
  downloadUrls.clear();
}
onBeforeUnmount(cancelDownload);
const url = computed(() => {
  if (/^(https?:\/\/|blob:)/i.test(props.part.url)) return props.part.url;
  if (
    props.part.kind === 'image' &&
    /^data:image\/(png|jpeg|gif|webp|avif);base64,/i.test(props.part.url)
  )
    return props.part.url;
  return undefined;
});
const file = computed(() => ({
  source: url.value!,
  name: props.part.name,
  mimeType: props.part.mimeType,
}));
const kind = computed(() =>
  props.part.kind === 'image'
    ? 'Image'
    : props.part.mimeType?.startsWith('text/')
      ? 'Text document'
      : props.part.mimeType === 'application/pdf'
        ? 'PDF document'
        : 'File'
);
const description = computed(() => {
  const extension = props.part.name.includes('.')
    ? props.part.name.split('.').pop()?.toUpperCase()
    : undefined;
  const size = props.part.size;
  return [
    extension
      ? `${extension} ${props.part.kind === 'image' ? 'image' : kind.value === 'Text document' || kind.value === 'PDF document' ? 'document' : 'file'}`
      : kind.value,
    size === undefined
      ? undefined
      : size < 1024
        ? `${size} B`
        : size < 1024 * 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${(size / (1024 * 1024)).toFixed(1)} MB`,
  ]
    .filter(Boolean)
    .join(' · ');
});
watch(url, () => {
  cancelDownload();
  downloadError.value = '';
  imageFailed.value = false;
  open.value = false;
});
async function download() {
  if (!url.value || downloading.value) return;
  const source = url.value,
    name = props.part.name;
  const controller = new AbortController();
  downloadController = controller;
  downloading.value = true;
  downloadError.value = '';
  try {
    let target = source;
    if (/^https?:/i.test(source)) {
      const response = await fetch(source, {signal: controller.signal});
      if (!response.ok)
        throw new Error(`Unable to download file (${response.status}).`);
      const limit = 100 * 1024 * 1024;
      if (Number(response.headers.get('content-length')) > limit)
        throw new Error('File exceeds the 100 MB download limit.');
      let data: Blob;
      if (!response.body) data = await response.blob();
      else {
        const reader = response.body.getReader(),
          chunks: Uint8Array<ArrayBuffer>[] = [];
        let size = 0;
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > limit) {
              await reader.cancel();
              throw new Error('File exceeds the 100 MB download limit.');
            }
            chunks.push(chunk.value);
          }
        } finally {
          reader.releaseLock();
        }
        data = new Blob(chunks, {
          type: response.headers.get('content-type') ?? '',
        });
      }
      if (data.size > limit)
        throw new Error('File exceeds the 100 MB download limit.');
      if (controller.signal.aborted) return;
      target = URL.createObjectURL(data);
      const owned = target;
      downloadUrls.set(
        owned,
        setTimeout(() => {
          URL.revokeObjectURL(owned);
          downloadUrls.delete(owned);
        }, 1000)
      );
    }
    if (controller.signal.aborted) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = name;
    link.rel = 'noopener noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  } catch (error) {
    if (!controller.signal.aborted)
      downloadError.value =
        error instanceof Error
          ? error.message
          : 'Unable to download this file.';
  } finally {
    if (downloadController === controller) {
      downloadController = undefined;
      downloading.value = false;
    }
  }
}
</script>
<template>
  <div class="frame-chat-artifact" :aria-label="`File: ${part.name}`">
    <div class="frame-chat-artifact-thumbnail">
      <img
        v-if="part.kind === 'image' && url && !imageFailed"
        :src="url"
        :alt="part.text || part.name"
        loading="lazy"
        @error="imageFailed = true"
      />
      <FrameIcon
        v-else
        :name="part.kind === 'image' ? 'file-media' : 'file-text'"
        :size="22"
      />
    </div>
    <div class="frame-chat-artifact-info">
      <strong :title="part.name">{{ part.name }}</strong
      ><span>{{ url ? description : 'File unavailable' }}</span
      ><small v-if="part.text">{{ part.text }}</small>
      <small v-if="downloadError" role="alert">{{ downloadError }}</small>
    </div>
    <div class="frame-chat-artifact-actions">
      <FrameDialog
        v-model:open="open"
        :title="part.name"
        :description="description"
        class="frame-chat-artifact-dialog"
      >
        <template #trigger
          ><FrameButton
            variant="secondary"
            :aria-label="`Open ${part.name}`"
            :disabled="!url"
            >Open</FrameButton
          ></template
        >
        <ViewerContent v-if="open && url" :file="file" />
      </FrameDialog>
      <FrameIconButton
        icon="desktop-download"
        :label="`${downloading ? 'Downloading' : 'Download'} ${part.name}`"
        :disabled="!url || downloading"
        @click="download"
      />
    </div>
  </div>
</template>

<style lang="scss">
.frame-chat-artifact {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0 0 8px;
  padding: 10px;
  border: 1px solid var(--frame-border, #ffffff24);
  border-radius: var(--frame-chat-artifact-radius, 15px);
  background: var(--frame-surface, #181818);
}

.frame-chat-artifact-thumbnail {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--frame-text, #ccc) 5%, transparent);
  color: var(--frame-muted, #999);
  overflow: hidden;
}

.frame-chat-artifact-thumbnail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.frame-chat-artifact-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.frame-chat-artifact-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
}

.frame-chat-artifact-info > span,
.frame-chat-artifact-info small {
  color: var(--frame-muted, #999);
  font-size: var(--frame-chat-event-meta-size, 11px);
  overflow-wrap: anywhere;
}

.frame-chat-artifact-info > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frame-chat-artifact-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.frame-chat-artifact-actions .frame-button {
  font-size: 11px;
}

.frame-chat-artifact-dialog {
  width: min(880px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 48px);
  display: flex;
  flex-direction: column;
  overflow: auto;
  overscroll-behavior: contain;
}

.frame-chat-artifact-dialog .frame-viewer-content {
  min-height: 160px;
  max-height: 65dvh;
  overflow: auto;
  overscroll-behavior: contain;
}

.frame-chat-artifact-dialog .frame-viewer-image {
  max-height: var(--frame-chat-image-max-height, 320px);
}
</style>
