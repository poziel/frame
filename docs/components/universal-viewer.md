# Universal File Viewer

Preview local images, SVG, PDF, video, code, and plain text inline or fullscreen.

## Features

### Try the file viewer

Choose a local file or a built-in sample, then open it fullscreen. Escape closes the dialog and restores focus. SVG offers an XML source toggle. Files stay in your browser. Office documents are unsupported; media decoding depends on the browser. PDF pages are visual previews without text selection or search.

<!-- frame:example id="universal-viewer.basic" -->

```vue
import { ref } from 'vue';
import { UniversalViewer, UniversalViewerContent, type ViewerFile } from '@frame/core/modules/viewer';


const open = ref(false);
const file = ref<ViewerFile>(); // Set to { source: selectedFile } from a file input.
// <UniversalViewerContent v-if="file" :file="file" style="height: 400px" />
// <UniversalViewer v-model:open="open" :file="file" />
```

## APIs

<!-- frame:generated api="universal-viewer" -->

### UniversalViewer

Source: `packages/core/src/modules/viewer/components/UniversalViewer.vue`

#### Properties

| Name     | Type                                 | Default  | Description                                                    |
| -------- | ------------------------------------ | -------- | -------------------------------------------------------------- |
| `open`   | `boolean`                            | Required | Controlled fullscreen dialog visibility.                       |
| `file`   | `ViewerFile \| undefined`            | Omitted  | Portable document; omission displays the existing empty state. |
| `target` | `string \| HTMLElement \| undefined` | Omitted  | Portal destination; defaults to body.                          |

#### Events

| Name          | Parameters       | Return type | Description                                                         |
| ------------- | ---------------- | ----------- | ------------------------------------------------------------------- |
| `update:open` | `open: boolean`  | `void`      | Close-button and Escape requests forwarded to the controlling host. |
| `error`       | `error: unknown` | `void`      | Active content or renderer failure.                                 |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

### UniversalViewerContent

Source: `packages/core/src/modules/viewer/components/UniversalViewerContent.vue`

#### Properties

| Name       | Type                  | Default  | Description                                              |
| ---------- | --------------------- | -------- | -------------------------------------------------------- |
| `file`     | `ViewerFile`          | Required | Portable source and optional display/type metadata.      |
| `maxBytes` | `number \| undefined` | Omitted  | Applies to fetched and supplied files. Default: 100 MiB. |

#### Events

| Name    | Parameters       | Return type | Description                                                     |
| ------- | ---------------- | ----------- | --------------------------------------------------------------- |
| `error` | `error: unknown` | `void`      | Active load or renderer failure, preserving its original cause. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="universal-viewer" -->

| CSS variable                    | Theme path                    | Default expression | Purpose                                                                                  | Context                                                                    |
| ------------------------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `--frame-viewer-z-index`        | `frame.viewer.z.index`        | `1000`             | Value of z-index for .frame-viewer-backdrop.                                             | `.frame-viewer-backdrop`                                                   |
| `--frame-viewer-backdrop`       | `frame.viewer.backdrop`       | `rgb(0 0 0 / 80%)` | Background for .frame-viewer-backdrop.                                                   | `.frame-viewer-backdrop`                                                   |
| `--frame-viewer-blur`           | `frame.viewer.blur`           | `10px`             | Backdrop treatment for .frame-viewer-backdrop.                                           | `.frame-viewer-backdrop`                                                   |
| `--frame-viewer-z-index`        | `frame.viewer.z.index`        | `1000`             | Value of z-index for .frame-viewer-dialog.                                               | `.frame-viewer-dialog`                                                     |
| `--frame-content-padding`       | `frame.content.padding`       | `12px`             | Internal spacing for .frame-viewer-dialog.                                               | `.frame-viewer-dialog`                                                     |
| `--frame-font-size-body`        | `frame.font.size.body`        | `12px`             | Value of font for .frame-viewer-dialog.                                                  | `.frame-viewer-dialog`                                                     |
| `--frame-font-body`             | `frame.font.body`             | `sans-serif`       | Value of font for .frame-viewer-dialog.                                                  | `.frame-viewer-dialog`                                                     |
| `--frame-text`                  | `frame.text`                  | `#cccccc`          | Primary foreground for readable text and icons across shell and application content.     | `.frame-viewer-dialog`                                                     |
| `--frame-gap`                   | `frame.gap`                   | `6px`              | Space between children for .frame-viewer-header, .frame-viewer-toolbar.                  | `.frame-viewer-header, .frame-viewer-toolbar`                              |
| `--frame-gap`                   | `frame.gap`                   | `6px`              | Bottom outer spacing for .frame-viewer-header.                                           | `.frame-viewer-header`                                                     |
| `--frame-surface`               | `frame.surface`               | `#181818`          | Background for .frame-viewer-button.                                                     | `.frame-viewer-button`                                                     |
| `--frame-line`                  | `frame.line`                  | `#333`             | Border for .frame-viewer-button.                                                         | `.frame-viewer-button`                                                     |
| `--frame-control-radius`        | `frame.control.radius`        | `3px`              | Corner radius for .frame-viewer-button.                                                  | `.frame-viewer-button`                                                     |
| `--frame-control-padding-y`     | `frame.control.padding.y`     | `5px`              | Internal spacing for .frame-viewer-button.                                               | `.frame-viewer-button`                                                     |
| `--frame-control-padding-x`     | `frame.control.padding.x`     | `10px`             | Internal spacing for .frame-viewer-button.                                               | `.frame-viewer-button`                                                     |
| `--frame-text`                  | `frame.text`                  | `#cccccc`          | Primary foreground for readable text and icons across shell and application content.     | `.frame-viewer-button`                                                     |
| `--frame-accent`                | `frame.accent`                | `#0078d4`          | Shared interaction color for keyboard focus, active actions, and accent-filled controls. | `.frame-viewer-button:focus-visible, .frame-viewer-content :focus-visible` |
| `--frame-chat-image-max-height` | `frame.chat.image.max.height` | `320px`            | Maximum height for .frame-chat-artifact-dialog .frame-viewer-image.                      | `.frame-chat-artifact-dialog .frame-viewer-image`                          |
| `--frame-gap`                   | `frame.gap`                   | `6px`              | Space between children for .frame-viewer-content.                                        | `.frame-viewer-content`                                                    |
| `--frame-text`                  | `frame.text`                  | `#cccccc`          | Primary foreground for readable text and icons across shell and application content.     | `.frame-viewer-content`                                                    |
| `--frame-content-padding`       | `frame.content.padding`       | `12px`             | Internal spacing for .frame-viewer-text.                                                 | `.frame-viewer-text`                                                       |
| `--frame-font-mono`             | `frame.font.mono`             | `monospace`        | Font family for .frame-viewer-text.                                                      | `.frame-viewer-text`                                                       |
| `--frame-canvas`                | `frame.canvas`                | `#101112`          | Background for .frame-viewer-text.                                                       | `.frame-viewer-text`                                                       |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
