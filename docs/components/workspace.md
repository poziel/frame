# Workspace Panes

Independent workspace surfaces that split in four directions.

## Features

### Basic usage

Split the focused pane, supply custom content with setWorkspacePane, or return to a single empty workspace with resetWorkspace. Closing a pane retains the remaining content.

<!-- frame:example id="workspace.basic" -->

```vue
frame.splitWorkspace('right');
frame.setWorkspacePane(frame.workspace.activePane.value, { label: 'Preview', component: Preview });
frame.resetWorkspace();
```

### Composition and configuration

Compose this API with application-owned content. Use the actions in this example to inspect the behavior.

<!-- frame:example id="workspace.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { WorkspacePanes, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<WorkspacePanes >
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</WorkspacePanes>
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="workspace" -->

### WorkspacePanes

Source: `packages/core/src/components/framework/WorkspacePanes.vue`

#### Properties

No declared entries.

#### Events

No declared entries.

#### Slots

| Name      | Parameters                                | Return type  | Description                                                                                      |
| --------- | ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `default` | `{ pane: WorkspacePane; }`                | `VNodeChild` | Initial pane content, preserved across layout changes while that pane survives.                  |
| `pane`    | `{ pane: WorkspacePane; }`                | `VNodeChild` | Host content for additional plain panes; Frame registers and releases its presentation lifetime. |
| `tab`     | `{ tab: WorkspaceTab; active: boolean; }` | `VNodeChild` | Label content for a document tab, including whether it is active.                                |
| `empty`   | `{ pane: WorkspacePane; }`                | `VNodeChild` | Empty presentation for a tabbed pane.                                                            |
| `actions` | `{ pane: WorkspacePane; }`                | `VNodeChild` | Additional actions within a pane's document tab strip.                                           |

#### Exposed API

No declared entries.

### frame.setWorkspacePane

Source: `packages/core/src/framework/workspace/workspaceTypes.ts`

#### Properties

| Name        | Type                      | Default  | Description                                                 |
| ----------- | ------------------------- | -------- | ----------------------------------------------------------- |
| `label`     | `string`                  | Required | Human-readable name displayed by the owning surface.        |
| `component` | `Component`               | Omitted  | Host-supplied Vue component rendered for this contribution. |
| `props`     | `Record<string, unknown>` | Omitted  | Properties forwarded to the host-supplied component.        |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name                     | Parameters                                  | Return type | Description                                                                         |
| ------------------------ | ------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `frame.setWorkspacePane` | `id: string, content: WorkspacePaneContent` | `void`      | Shares the existing workspace.setPane operation or state with the public shell API. |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="workspace" -->

| CSS variable                                                                                       | Theme path                                                                                       | Default expression                           | Purpose                                                                                                        | Context                                         |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `--frame-panel-radius`                                                                             | `frame.panel.radius`                                                                             | `6px`                                        | Corner radius for .workspace-panes .workspace-pane. Used when --frame-workspace-pane-radius is unset.          | `.workspace-panes .workspace-pane`              |
| `--frame-workspace-pane-radius`                                                                    | `frame.workspace.pane.radius`                                                                    | `var(     --frame-panel-radius,     6px   )` | Corner radius for .workspace-panes .workspace-pane.                                                            | `.workspace-panes .workspace-pane`              |
| `--frame-panel-radius`                                                                             | `frame.panel.radius`                                                                             | `6px`                                        | Corner radius for .workspace-panes .workspace-pane.multiple. Used when --frame-workspace-pane-radius is unset. | `.workspace-panes .workspace-pane.multiple`     |
| `--frame-workspace-pane-radius`                                                                    | `frame.workspace.pane.radius`                                                                    | `var(     --frame-panel-radius,     6px   )` | Corner radius for .workspace-panes .workspace-pane.multiple.                                                   | `.workspace-panes .workspace-pane.multiple`     |
| `--frame-WorkspaceCanvas-exposes-a-slot-future-tools-occupy-this-surface-workspace-min-height`     | `frame.WorkspaceCanvas.exposes.a.slot.future.tools.occupy.this.surface.workspace.min.height`     | `0`                                          | Minimum height for .workspace.                                                                                 | `.workspace`                                    |
| `--frame-WorkspaceCanvas-exposes-a-slot-future-tools-occupy-this-surface-workspace-min-width`      | `frame.WorkspaceCanvas.exposes.a.slot.future.tools.occupy.this.surface.workspace.min.width`      | `0`                                          | Minimum width for .workspace.                                                                                  | `.workspace`                                    |
| `--frame-WorkspaceCanvas-exposes-a-slot-future-tools-occupy-this-surface-workspace-outline-offset` | `frame.WorkspaceCanvas.exposes.a.slot.future.tools.occupy.this.surface.workspace.outline.offset` | `-3px`                                       | Outline offset for .workspace.                                                                                 | `.workspace`                                    |
| `--frame-canvas-centering-centered-workspace-width`                                                | `frame.canvas.centering.centered.workspace.width`                                                | `100%`                                       | Width for .canvas-centering.centered > .workspace.                                                             | `.canvas-centering.centered > .workspace`       |
| `--frame-line`                                                                                     | `frame.line`                                                                                     | `#2b2b2b`                                    | Neutral divider color for content boundaries, tracks, and structural separators.                               | `.canvas-centering.centered > .workspace`       |
| `--frame-workspace-pane-host-min-width`                                                            | `frame.workspace.pane.host.min.width`                                                            | `0`                                          | Minimum width for .workspace-pane-host, .workspace-pane-content.                                               | `.workspace-pane-host, .workspace-pane-content` |
| `--frame-workspace-pane-host-min-height`                                                           | `frame.workspace.pane.host.min.height`                                                           | `0`                                          | Minimum height for .workspace-pane-host, .workspace-pane-content.                                              | `.workspace-pane-host, .workspace-pane-content` |
| `--frame-workspace-pane-content-workspace-min-height`                                              | `frame.workspace.pane.content.workspace.min.height`                                              | `100%`                                       | Minimum height for .workspace-pane-content > .workspace.                                                       | `.workspace-pane-content > .workspace`          |
| `--frame-workspace-pane-content-pane-placeholder-min-height`                                       | `frame.workspace.pane.content.pane.placeholder.min.height`                                       | `0`                                          | Minimum height for .workspace-pane-content > .pane-placeholder.                                                | `.workspace-pane-content > .pane-placeholder`   |
| `--frame-workspace-pane-content-pane-placeholder-padding`                                          | `frame.workspace.pane.content.pane.placeholder.padding`                                          | `0`                                          | Internal spacing for .workspace-pane-content > .pane-placeholder.                                              | `.workspace-pane-content > .pane-placeholder`   |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
