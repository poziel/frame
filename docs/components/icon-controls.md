# Icon controls

`FrameIcon` and `FrameIconButton` accept `angle` (degrees), `flipHorizontal`, and `flipVertical`. Flips apply in the icon's local axes, followed by rotation; they affect the glyph rather than the button's hit target, label, or tooltip. Button transforms also support component icons.

```vue
<FrameIcon name="play" :angle="90" flip-horizontal />
<FrameIconButton label="Reverse" icon="play" flip-horizontal />
<FrameIconButton label="Toggle visibility" icon="eye" variant="icon" />
```

`FrameIconButton` defaults to its existing ghost appearance. `variant="icon"` keeps the background transparent on hover and press, and changes the icon color from `--frame-muted` to `--frame-icon-button-icon-hover-color` on hover (by default, `--frame-text` mixed with 35% white). Disabled buttons retain their disabled behavior; keyboard focus indicators remain available. `hoverHighlight` continues to control the existing ghost variant.

