# Scrub field

`FrameScrubField` is a reusable numeric tool control that does not require a Frame instance. It combines a Reka number-field root and standard increment/decrement primitives with Frame text and icon controls.

```vue
<FrameScrubField v-model="size" label="Size" suffix=" px" :min="1" :max="256" :step="1" />
```

The default view contains a label, value, bounded fill, and right-side step arrows. Drag horizontally (at least four pixels) to scrub. When both bounds are defined, dragging maps the pointer directly across the visible bar: the leading edge is the minimum and the trailing edge is the maximum, rounded to `step`. Explicit `pixelsPerStep` opts into fixed-distance relative scrubbing; unbounded fields default to six pixels per step. Direct-entry text is centered like the display label. Wheel up/down and arrows use the same step. Keyboard arrows step, Page Up/Down step ten times, Home/End select defined bounds, and Enter/Space opens direct text entry. A click without a drag also edits. Enter and blur commit; Escape cancels. Blank/invalid entries preserve the prior value. Values remain bounded.

Props: `modelValue`, `label`, `min?`, `max?`, `step?`, `suffix?`, `disabled?`, `pixelsPerStep?`, and `id?`. `update:modelValue` emits finite numeric changes live. Multiple instances retain independent state, and disabled controls do not scrub, edit or intercept the wheel. Typed input is parsed through FrameTextField; Reka maintains number state and stepper behavior via a non-interactive backing input.

The field uses the shared number-input surface and supports `--frame-scrub-field-width`, `--frame-scrub-field-height`, and `--frame-scrub-field-fill`. The documentation's Scrub Field page has live size/opacity examples.
