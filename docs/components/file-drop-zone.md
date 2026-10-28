# File Drop Zone

Receive file drops in a visible zone or an invisible wrapper around application content.

## Features

### Visible drop zone

Drop files or browse in the visible zone. Switch to overlay mode to keep application content usable until files are dragged over it. The accepted event supplies browser File objects.

<!-- frame:example id="file-drop-zone.basic" -->

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileDropZone } from '@frame/core';
import '@frame/core/style.css';
const names = ref<string[]>([]);
function receive(files: File[]) { names.value = files.map(file => file.name); }
</script>
<template>
  <FrameFileDropZone multiple @accepted="receive" />
  <FrameFileDropZone appearance="overlay" multiple @accepted="receive">
    <textarea aria-label="Workspace content" placeholder="Your editor stays usable here" />
    <template #overlay>Drop files to open them</template>
  </FrameFileDropZone>
  <p role="status">{{ names.join(', ') }}</p>
</template>
```

### Invisible workspace drop target

Edit the workspace normally, then drag files over it to reveal an overlay. Dropping or leaving keeps your edits.

<!-- frame:example id="file-drop-zone.overlay" -->

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameFileDropZone } from '@frame/core';
import '@frame/core/style.css';
const names = ref<string[]>([]);
function receive(files: File[]) { names.value = files.map(file => file.name); }
</script>
<template>
  <FrameFileDropZone multiple @accepted="receive" />
  <FrameFileDropZone appearance="overlay" multiple @accepted="receive">
    <textarea aria-label="Workspace content" placeholder="Your editor stays usable here" />
    <template #overlay>Drop files to open them</template>
  </FrameFileDropZone>
  <p role="status">{{ names.join(', ') }}</p>
</template>
```

## APIs

<!-- frame:generated api="file-drop-zone" -->

### FrameFileDropZone

Source: `packages/core/src/components/forms/FrameFileDropZone.vue`

#### Properties

| Name          | Type                               | Default           | Description                                                                                               |
| ------------- | ---------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `accept`      | `string \| undefined`              | Omitted           | Comma-separated file extensions, MIME types, or MIME type wildcards accepted by the picker and validator. |
| `multiple`    | `boolean \| undefined`             | false             | Allows accepting several files in one selection; otherwise at most one file is accepted.                  |
| `maxSize`     | `number \| undefined`              | Omitted           | Maximum bytes per file.                                                                                   |
| `maxFiles`    | `number \| undefined`              | Omitted           | Maximum accepted files per selection.                                                                     |
| `disabled`    | `boolean \| undefined`             | false             | Disables file browsing and dropping, and clears the dragging state.                                       |
| `appearance`  | `"zone" \| "overlay" \| undefined` | "zone"            | Renders the ordinary drop-zone presentation or a dragging overlay.                                        |
| `message`     | `string \| undefined`              | "Drop files here" | Fallback instruction text in the presentation and dragging overlay.                                       |
| `browseLabel` | `string \| undefined`              | "Choose file"     | Label of the fallback file picker button.                                                                 |

#### Events

| Name              | Parameters               | Return type | Description                                                                |
| ----------------- | ------------------------ | ----------- | -------------------------------------------------------------------------- |
| `accepted`        | `files: File[]`          | `void`      | Files accepted by the configured type, size, and count rules.              |
| `rejected`        | `files: FileRejection[]` | `void`      | Files rejected by validation, with the corresponding reason for each file. |
| `update:dragging` | `dragging: boolean`      | `void`      | Whether a file drag is currently over the drop zone.                       |

#### Slots

| Name           | Parameters                                                    | Return type  | Description                                                               |
| -------------- | ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `default`      | `{ dragging: boolean; open: () => void; disabled: boolean; }` | `VNodeChild` | Application content receiving the drag state and native picker operation. |
| `presentation` | `{ dragging: boolean; open: () => void; disabled: boolean; }` | `VNodeChild` | Replaces the zone instruction and browse button in zone appearance.       |
| `overlay`      | `{ dragging: boolean; }`                                      | `VNodeChild` | Replaces the instruction displayed while files are dragged over the zone. |
| `errors`       | `{ errors: FileRejection[]; }`                                | `VNodeChild` | Replaces validation error messages for the latest selection.              |

#### Exposed API

| Name    | Parameters | Return type | Description                                            |
| ------- | ---------- | ----------- | ------------------------------------------------------ |
| `open`  | `None`     | `void`      | Opens the native file picker when mounted and enabled. |
| `reset` | `None`     | `void`      | Clears drag nesting and the dragging state.            |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="file-drop-zone" -->

| CSS variable                 | Theme path                 | Default expression                        | Purpose                                                                                    | Context                    |
| ---------------------------- | -------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| `--frame-danger`             | `frame.danger`             | No declared default; supplied by context. | Error and destructive-action color used for validation messages and invalid field borders. | `.frame-file-errors`       |
| `--frame-text`               | `frame.text`               | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.       | `.frame-file-drop-zone`    |
| `--frame-gap`                | `frame.gap`                | `6px`                                     | Space between children for .frame-file-presentation.                                       | `.frame-file-presentation` |
| `--frame-content-padding`    | `frame.content.padding`    | `12px`                                    | Inset inside the file drop-zone presentation.                                              | `.frame-file-presentation` |
| `--frame-control-radius`     | `frame.control.radius`     | `4px`                                     | Corner radius of the file drop-zone presentation and drag overlay.                         | `.frame-file-presentation` |
| `--frame-control-border`     | `frame.control.border`     | No declared default; supplied by context. | Resting border color of form controls, independently overridable from menu borders.        | `.frame-file-presentation` |
| `--frame-control-radius`     | `frame.control.radius`     | `4px`                                     | Corner radius of the file drop-zone presentation and drag overlay.                         | `.frame-file-overlay`      |
| `--frame-accent`             | `frame.accent`             | No declared default; supplied by context. | Shared interaction color for keyboard focus, active actions, and accent-filled controls.   | `.frame-file-overlay`      |
| `--frame-overlay-background` | `frame.overlay.background` | No declared default; supplied by context. | Shared translucent fill for floating surfaces over the application canvas.                 | `.frame-file-overlay`      |
| `--frame-text`               | `frame.text`               | No declared default; supplied by context. | Primary foreground for readable text and icons across shell and application content.       | `.frame-file-overlay`      |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
