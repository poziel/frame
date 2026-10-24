# File upload and drop zone

## Features

Import `FrameFileUpload` and `FrameFileDropZone` from `@frame/core`, and load `@frame/core/style.css`. Both work independently of FrameShell. They select browser `File` objects; the host uploads, imports, or opens them.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileUpload, FrameFileDropZone } from '@frame/core';
const files = ref<File[]>([]);
function openFiles(files: File[]) { /* host opens files in document tabs */ }
</script>
<template>
  <FrameFileUpload v-model="files" multiple accept="image/*,.pixloom" :max-size="10485760" :max-files="5" />
  <FrameFileDropZone multiple accept="image/*" message="Drop images here" @accepted="openFiles" />
  <FrameFileDropZone appearance="overlay" multiple @accepted="openFiles">
    <YourCanvas />
    <template #overlay>Drop files to open new tabs</template>
  </FrameFileDropZone>
</template>
```

The default slot stays mounted while dragging. Overlay mode has no resting decoration or click-to-browse behavior on wrapped content. Size the wrapper to cover the intended target; use `height: 100%` when its parent supplies a height. File drags alone activate the overlay. Text drags and normal canvas input remain available. Zone mode includes an explicit keyboard-accessible browse button. For overlay mode, provide a separate accessible picker or use the exposed `open()` through a user gesture.

## APIs

Shared props: `accept?: string` (comma-separated extensions, MIME types or MIME wildcards), `multiple?: boolean` (false), `maxSize?: number` (bytes per file), `maxFiles?: number` (accepted files per operation), `disabled?: boolean`. Limits should be nonnegative finite numbers; omission means unlimited except single-file mode. The chooser uses accept as a hint and both paths validate after receiving files. Metadata validation is not content inspection.

Both emit `accepted(File[])` for nonempty accepted results and `rejected(FileRejection[])` for failures. A mixed selection emits both. Rejections have `file`, `code: 'type' | 'size' | 'count'`, and `message`. Valid files retain input order; rejected files do not consume the count allowance. Filesystem metadata is not always available during hover, so final validation happens on drop.

**FrameFileUpload:** `v-model` is `File[]`; optional uncontrolled use is supported. Each successful selection replaces the list. Fully rejected selections and chooser cancellation preserve it. `label` defaults to Choose file; `showFiles` defaults true. Methods: `open()`, `clear()`, `focus()` (default trigger). Removal and clear emit model updates, not accepted events. Selecting the same file again emits accepted again.

Slots: `trigger({open, disabled, files})`, `files({files, remove(index), clear})`, `errors({errors})`. A custom trigger must provide its own accessible button and respect disabled. Files slot replaces the built-in removable list.

**FrameFileDropZone:** `appearance: 'zone' | 'overlay'` defaults zone; `message` defaults Drop files here; `browseLabel` defaults Choose file. Methods: `open()`, `reset()`. Emits `update:dragging(boolean)`. No retained file model. Slots: default and `presentation` receive `{dragging, open, disabled}`; `overlay` receives `{dragging}`; `errors` receives `{errors}`. Presentation is visible in zone mode; overlay is visible only while dragging and does not receive pointer input. Errors persist until the next selection. Nested enabled zones let the inner zone handle the drop.

These controls do not register a Reka field or populate native FormData. Submit their model through your host form handler. Native Tauri/Electron drag interception may need host configuration; native paths and OS drag adapters are outside this browser File API.

## Styling

Selectors: `.frame-file-upload`, `.frame-file-list`, `.frame-file-drop-zone`, `.frame-file-presentation`, `.frame-file-overlay`, `.frame-file-errors`. The zone exposes `data-dragging` and `data-disabled`. Colors, borders, radii and spacing use shared `--frame-*` tokens. Supply slots for custom messages and file rendering. No global event listeners or portal are installed.
