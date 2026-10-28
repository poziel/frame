# Code Editor

A standalone Monaco editor with the same Shiki grammars and themes as Code Block.

## Features

### Basic usage

Place the editor in any container with a defined height. Direct props override matching options. Monaco loads on first mount; each surface owns its model and undo history. A controller can attach to one surface at a time. Monaco themes apply globally across mounted editors. Formatting and semantic assistance depend on available language providers.

<!-- frame:example id="code-editor.basic" -->

```vue
import { CodeEditor, createCodeEditor } from '@frame/core/modules/editor';
import { CodeBlockTheme } from '@frame/core';


const editor = createCodeEditor();
// <CodeEditor v-model="code" :editor="editor" language="typescript"
//   :theme="CodeBlockTheme.DarkPlus" :read-only="false"
//   :options="{ fontSize: 14, wordWrap: 'on', tabSize: 2 }"
//   style="height: 400px" />
```

### Visual variants

Set theme explicitly to override its default. The interactive demo exposes every public property.

<!-- frame:example id="code-editor.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { CodeEditor } from '@frame/core/modules/editor';
const demoModelValue = ref("manual");
</script>
<template>
<CodeEditor v-model="demoModelValue" :label="&quot;Example control&quot;" :theme="&quot;aurora-x&quot;" />
</template>
```

## APIs

<!-- frame:generated api="code-editor" -->

### CodeEditor

Source: `packages/core/src/modules/editor/components/CodeEditor.vue`

#### Properties

| Name         | Type                                | Default | Description                                                             |
| ------------ | ----------------------------------- | ------- | ----------------------------------------------------------------------- |
| `modelValue` | `string \| undefined`               | Omitted | Controlled source text; omitted values leave the model locally owned.   |
| `editor`     | `CodeEditorController \| undefined` | Omitted | Optional caller-owned controller attached while the surface is mounted. |
| `language`   | `string \| undefined`               | Omitted | Language identifier or alias; defaults to plaintext.                    |
| `theme`      | `CodeBlockTheme \| undefined`       | Omitted | Syntax palette; defaults to Dark Plus.                                  |
| `readOnly`   | `boolean \| undefined`              | Omitted | Explicit user-editing override; host replacements remain permitted.     |
| `label`      | `string \| undefined`               | Omitted | Accessible editor name; overrides the nested ariaLabel.                 |
| `autofocus`  | `boolean \| undefined`              | false   | Focuses the editor after its initial successful mount.                  |
| `options`    | `CodeEditorOptions \| undefined`    | Omitted | Monaco construction and model options merged with surface defaults.     |

#### Events

| Name                | Parameters                                              | Return type | Description                                               |
| ------------------- | ------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `update:modelValue` | `code: string`                                          | `void`      | Controlled source text after a Monaco edit.               |
| `focus`             | `None`                                                  | `void`      | Widget focus, including its internal controls.            |
| `error`             | `cause: unknown`                                        | `void`      | Syntax preparation or controller attachment failure.      |
| `change`            | `code: string, event: editor.IModelContentChangedEvent` | `void`      | Source text and Monaco metadata for each content change.  |
| `ready`             | `editor: CodeEditorController`                          | `void`      | Mounted controller after its first successful attachment. |
| `selection`         | `event: editor.ICursorSelectionChangedEvent`            | `void`      | Cursor selections reported by the mounted editor.         |
| `blur`              | `None`                                                  | `void`      | Widget blur after focus leaves the editor.                |

#### Slots

No declared entries.

#### Exposed API

| Name         | Parameters | Return type            | Description                                              |
| ------------ | ---------- | ---------------------- | -------------------------------------------------------- |
| `controller` | `None`     | `CodeEditorController` | Current caller-supplied or fallback controller.          |
| `focus`      | `None`     | `boolean`              | Focuses whichever controller currently owns the surface. |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="code-editor" -->

| CSS variable                         | Theme path                         | Default expression | Purpose                                                            | Context                     |
| ------------------------------------ | ---------------------------------- | ------------------ | ------------------------------------------------------------------ | --------------------------- |
| `--frame-code-editor-width`          | `frame.code.editor.width`          | `100%`             | Width for .frame-code-editor; code editor width.                   | `.frame-code-editor`        |
| `--frame-code-editor-height`         | `frame.code.editor.height`         | `100%`             | Height for .frame-code-editor; code editor height.                 | `.frame-code-editor`        |
| `--frame-code-editor-min-width`      | `frame.code.editor.min.width`      | `0`                | Min width for .frame-code-editor; code editor min width.           | `.frame-code-editor`        |
| `--frame-code-editor-min-height`     | `frame.code.editor.min.height`     | `0`                | Min height for .frame-code-editor; code editor min height.         | `.frame-code-editor`        |
| `--frame-code-editor-host-width`     | `frame.code.editor.host.width`     | `100%`             | Width for .frame-code-editor-host; code editor host width.         | `.frame-code-editor-host`   |
| `--frame-code-editor-host-height`    | `frame.code.editor.host.height`    | `100%`             | Height for .frame-code-editor-host; code editor host height.       | `.frame-code-editor-host`   |
| `--frame-code-editor-status-margin`  | `frame.code.editor.status.margin`  | `0`                | Margin for .frame-code-editor-status; code editor status margin.   | `.frame-code-editor-status` |
| `--frame-code-editor-status-padding` | `frame.code.editor.status.padding` | `12px`             | Padding for .frame-code-editor-status; code editor status padding. | `.frame-code-editor-status` |
| `--frame-bg`                         | `frame.bg`                         | `#1e1e1e`          | Background for .frame-code-editor-status; bg.                      | `.frame-code-editor-status` |
| `--frame-fg`                         | `frame.fg`                         | `#d4d4d4`          | Color for .frame-code-editor-status; fg.                           | `.frame-code-editor-status` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
