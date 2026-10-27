# Reorder a list

`FrameReorderList` is an independent vertical list interaction component. It accepts ordered stable string IDs through `modelValue`, selected IDs through `selected`, and `disabled` / `label`. It uses pointer events (including in Windows webviews with native file drops enabled), starts dragging after 4 pixels, and renders an accent-colored insertion bar. Escape, pointer cancellation, window blur, disabling, or unmounting cancel the drag. Scrollable list edges auto-scroll. It owns drag state only; the host owns data and persistence.

The default slot receives `id`, `selected`, and `select(event)`. Render a focusable row and call `select` on row clicks. Ctrl/Command toggles selection; Shift selects a range. Dragging a selected row moves the selected IDs together in their original order. Drop indicators show insertion boundaries. Alt+Up/Down moves the focused row or selected block without a mouse. Drag state is scoped to one mounted list and cannot reorder another list. Inputs are excluded from dragging and keyboard reordering.

`update:selected` reports selection. `activate(id)` reports the clicked/dragged row. `update:modelValue` reports the complete proposed order; `reorder({ids, order})` reports moved IDs and that order. Persist through one host transaction, then update the IDs. Rejected host edits leave the list order unchanged. `disabled` prevents changes and cancels active drag feedback. The `empty` slot covers an empty list.

```vue
<FrameReorderList :model-value="ids" v-model:selected="selected" label="Layers" @reorder="persistOrder">
  <template #default="{id,selected,select}">
    <button :aria-pressed="selected" @click="select">{{ names[id] }}</button>
  </template>
</FrameReorderList>
```

The drop indicator inherits `--frame-accent`; override `--frame-reorder-indicator` on a list to customize it. Selection appearance is provided by the host row.

## Drag preview

The optional `drag-preview` slot receives `{ id, ids, count }`: the first dragged stable ID, all dragged IDs in list order, and their count. Render a compact thumbnail/name or a group summary. The preview follows the pointer, is bounded to the owning shell (or viewport for a standalone list), and is teleported outside scrolling content. It is non-interactive and hidden from accessibility APIs. Without the slot, it shows the ID for a single item or a count for multiple items. Drop, Escape, cancellation, blur, disabling, and unmount remove the preview.

```vue
<template #drag-preview="{id, count}">
  <strong>{{ names[id] }}</strong>
  <span v-if="count > 1">and {{ count - 1 }} more</span>
</template>
```

Override `--frame-reorder-preview-background`, `--frame-reorder-preview-border`, and `--frame-reorder-preview-shadow` on the preview's theme scope for its surface.

## Shared preview surface

`FrameDragPreview` is the same pointer-following surface used by the list. Custom grids can render it with `x`, `y` (viewport coordinates), an optional `anchor` element to resolve the owning shell, `active` (default true), and `offset` (default 14 pixels). Its default slot supplies the preview. It owns placement only: the host owns dragging, cancellation and removal. Use `--frame-drag-preview-background`, `--frame-drag-preview-border`, and `--frame-drag-preview-shadow` to theme it; the existing reorder preview tokens remain fallbacks.
