# Optional control tooltips

FrameButton, FrameTextField, FrameTextArea, FrameNumberField, FrameSelect, FrameCheckbox, FrameSwitch, FrameEditable, FrameField and FrameIcon share `tooltip?: string | false`, `tooltipPlacement` (top, bottom, left, right; default bottom), and a `tooltip` slot for richer descriptive content. FrameIconButton retains its automatic label tooltip and accepts the same rich slot.

```vue
<FrameButton tooltip="Save the document">Save</FrameButton>
<FrameTextField v-model="name">
  <template #tooltip><strong>Document name</strong><p>Shown in the title bar.</p></template>
</FrameTextField>
```

No description or slot means no tooltip. `:tooltip="false"` disables it, including the slot. A legacy `title` attribute on these controls is migrated to a Frame tooltip and removed from the native element. Existing aria-describedby IDs are preserved. Descriptive tooltips do not intercept pointer interaction and must not contain interactive controls. They supplement accessible labels.

For another component, compose `FrameControlTooltip` with its `tooltip` prop and optional `tooltip` slot. Its default scoped slot provides `describedby`; apply that to the real control's aria-describedby. The child must have a single element root. With no tooltip it renders only that child. Place it outside another Reka popup root (such as SelectRoot) so popup positioning contexts stay independent.

`FrameTooltip` also accepts `as-child` to avoid its default trigger wrapper and a `content` slot for custom content. Its default slot continues to expose `describedby`. Existing text/shortcut/placement APIs remain available.
