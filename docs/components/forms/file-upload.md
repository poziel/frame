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

### Choose and validate files

Choose files, remove them, or adjust file type, size and count limits. Files stay in your browser; the host decides how to process them.

<!-- frame:example id="file-upload.basic" -->

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileUpload } from '@frame/core';
import '@frame/core/style.css';
const files = ref<File[]>([]);
</script>
<template>
  <FrameFileUpload v-model="files" multiple accept="image/*,.txt" :max-size="10485760" :max-files="3" />
</template>
```

## APIs

<!-- frame:generated api="file-upload" -->

### FrameFileUpload

Source: `packages/core/src/components/forms/FrameFileUpload.vue`

#### Properties

| Name         | Type                   | Default       | Description                                                                                               |
| ------------ | ---------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| `accept`     | `string \| undefined`  | Omitted       | Comma-separated file extensions, MIME types, or MIME type wildcards accepted by the picker and validator. |
| `multiple`   | `boolean \| undefined` | false         | Allows accepting several files in one selection; otherwise at most one file is accepted.                  |
| `maxSize`    | `number \| undefined`  | Omitted       | Maximum bytes per file.                                                                                   |
| `maxFiles`   | `number \| undefined`  | Omitted       | Maximum accepted files per selection.                                                                     |
| `modelValue` | `File[] \| undefined`  | Omitted       | Selected files; when omitted the component maintains a local selection.                                   |
| `disabled`   | `boolean \| undefined` | false         | Disables browsing, clearing, and removal.                                                                 |
| `label`      | `string \| undefined`  | "Choose file" | Text of the fallback file picker button.                                                                  |
| `showFiles`  | `boolean \| undefined` | true          | Displays the fallback selected-file list; a files slot can replace it.                                    |

#### Events

| Name                | Parameters               | Return type | Description                                                                |
| ------------------- | ------------------------ | ----------- | -------------------------------------------------------------------------- |
| `update:modelValue` | `files: File[]`          | `void`      | Requests the new application-owned value after interaction.                |
| `accepted`          | `files: File[]`          | `void`      | Files accepted by the configured type, size, and count rules.              |
| `rejected`          | `files: FileRejection[]` | `void`      | Files rejected by validation, with the corresponding reason for each file. |

#### Slots

| Name      | Parameters                                                               | Return type  | Description                                                              |
| --------- | ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------ |
| `trigger` | `{ open: () => void; disabled: boolean; files: File[]; }`                | `VNodeChild` | Replaces the browse button; invoke open to request the native picker.    |
| `files`   | `{ files: File[]; remove: (index: number) => void; clear: () => void; }` | `VNodeChild` | Replaces the selected-file list and receives enabled removal operations. |
| `errors`  | `{ errors: FileRejection[]; }`                                           | `VNodeChild` | Replaces validation error messages for the latest selection.             |

#### Exposed API

| Name    | Parameters | Return type         | Description                                                                       |
| ------- | ---------- | ------------------- | --------------------------------------------------------------------------------- |
| `open`  | `None`     | `void`              | Opens the native file picker when mounted and enabled.                            |
| `clear` | `None`     | `void`              | Clears the selection and validation errors when enabled.                          |
| `focus` | `None`     | `void \| undefined` | Focuses the fallback picker button when mounted; custom triggers own their focus. |

<!-- /frame:generated -->

### Composition and upstream reference

Shared props: `accept?: string` (comma-separated extensions, MIME types or MIME wildcards), `multiple?: boolean` (false), `maxSize?: number` (bytes per file), `maxFiles?: number` (accepted files per operation), `disabled?: boolean`. Limits should be nonnegative finite numbers; omission means unlimited except single-file mode. The chooser uses accept as a hint and both paths validate after receiving files. Metadata validation is not content inspection.

Both emit `accepted(File[])` for nonempty accepted results and `rejected(FileRejection[])` for failures. A mixed selection emits both. Rejections have `file`, `code: 'type' | 'size' | 'count'`, and `message`. Valid files retain input order; rejected files do not consume the count allowance. Filesystem metadata is not always available during hover, so final validation happens on drop.

**FrameFileUpload:** `v-model` is `File[]`; optional uncontrolled use is supported. Each successful selection replaces the list. Fully rejected selections and chooser cancellation preserve it. `label` defaults to Choose file; `showFiles` defaults true. Methods: `open()`, `clear()`, `focus()` (default trigger). Removal and clear emit model updates, not accepted events. Selecting the same file again emits accepted again.

Slots: `trigger({open, disabled, files})`, `files({files, remove(index), clear})`, `errors({errors})`. A custom trigger must provide its own accessible button and respect disabled. Files slot replaces the built-in removable list.

**FrameFileDropZone:** `appearance: 'zone' | 'overlay'` defaults zone; `message` defaults Drop files here; `browseLabel` defaults Choose file. Methods: `open()`, `reset()`. Emits `update:dragging(boolean)`. No retained file model. Slots: default and `presentation` receive `{dragging, open, disabled}`; `overlay` receives `{dragging}`; `errors` receives `{errors}`. Presentation is visible in zone mode; overlay is visible only while dragging and does not receive pointer input. Errors persist until the next selection. Nested enabled zones let the inner zone handle the drop.

These controls do not register a Reka field or populate native FormData. Submit their model through your host form handler. Native Tauri/Electron drag interception may need host configuration; native paths and OS drag adapters are outside this browser File API.

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="file-upload" -->

| CSS variable     | Theme path     | Default expression                        | Purpose                                                                                    | Context               |
| ---------------- | -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `--frame-danger` | `frame.danger` | No declared default; supplied by context. | Error and destructive-action color used for validation messages and invalid field borders. | `.frame-file-errors`  |
| `--frame-text`   | `frame.text`   | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.       | `.frame-file-upload`  |
| `--frame-gap`    | `frame.gap`    | `6px`                                     | Space between children for .frame-file-list.                                               | `.frame-file-list`    |
| `--frame-gap`    | `frame.gap`    | `6px`                                     | Space between children for .frame-file-list li.                                            | `.frame-file-list li` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->

### Additional styling guidance

Selectors: `.frame-file-upload`, `.frame-file-list`, `.frame-file-drop-zone`, `.frame-file-presentation`, `.frame-file-overlay`, `.frame-file-errors`. The zone exposes `data-dragging` and `data-disabled`. Colors, borders, radii and spacing use shared `--frame-*` tokens. Supply slots for custom messages and file rendering. No global event listeners or portal are installed.
