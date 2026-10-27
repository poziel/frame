# FrameKeycap

Render a shortcut as individual keyboard keys separated by plus signs. It works
without a Frame instance and is used by the shortcut list and capture dialog.

```vue
<FrameKeycap shortcut="Ctrl+Shift+S" />
```

`shortcut` is an optional string. An omitted or empty value renders nothing.
Literal plus keys are supported, for example `Ctrl++`. The accessible name is
the complete shortcut; decorative individual keys are hidden from screen readers.

Theme tokens: `--frame-keycap-background`, `--frame-keycap-border`,
`--frame-keycap-color`, `--frame-keycap-radius`, `--frame-keycap-padding`,
`--frame-keycap-gap`, `--frame-keycap-font-size`, and `--frame-keycap-shadow`.
