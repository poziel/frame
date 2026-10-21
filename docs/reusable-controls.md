# Reusable controls

## Icon buttons

```vue
<FrameIconButton label="Open settings" icon="settings-gear" :size="28"
  :icon-ratio="0.6" tooltip-placement="right" @click="openSettings" />
```

Import FrameIconButton from frame. icon accepts a Codicon/Iconify name or Vue component; a default slot can supply custom content. size sets the square background/hit area; iconRatio sets its icon-to-button ratio; iconSize can override that ratio. hoverHighlight defaults to true. tooltip defaults to the accessible label, accepts custom text, or false to disable. tooltipPlacement accepts top, bottom, left, or right and falls back to available viewport space. shortcut adds a tooltip shortcut hint. disabled and ordinary button attributes (including aria-expanded) are forwarded. Click emits the MouseEvent. focus() and element are exposed through the component ref.

## Resizable panes

```vue
<ResizablePane v-model="navigationWidth" axis="x" :min="140" :max="400"
  :min-second="180" label="Resize navigation">
  <template #first><Navigation /></template>
  <template #second><Content /></template>
</ResizablePane>
```

Import ResizablePane from frame. It fills its parent, which must have a bounded size. axis=x places children side by side; axis=y stacks them. modelValue is the first pane size in pixels; without v-model the pane keeps its size internally. min/max constrain the first pane, minSecond reserves room for the second. Small containers clamp both panes to fit. A temporary container shrink does not overwrite the preferred size. defaultSize controls the initial size and double-click/Home reset. The shared ResizeHandle supplies pointer capture, keyboard arrow resizing, and Escape cancellation. No grip dots are displayed in this component.

## Loading

Use FrameLoader for an LDRS animation, or FrameLoading to cover a region while its content stays mounted. See [Loaders and loading regions](loading.md) for API details, async examples, and accessibility behavior.
