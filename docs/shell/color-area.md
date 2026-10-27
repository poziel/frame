# Composed color pickers

`FrameHsvRectangle`, `FrameHsvWheel`, and `FrameVhsCircle` are independent controls composed from the color area, wheel, and slider primitives. They default to 280px wide, are capped by their container, and accept `size` as a pixel number or CSS width. The slider thickness and selector scale with the picker.

`FrameColorArea` retains its existing `colorSpace`, `xChannel`, and `yChannel` planar API. Set `variant="rectangle"`, `"wheel"`, or `"circle"` for a composed HSV picker. Rectangle includes a vertical hue slider; wheel provides a hue ring with a saturation/value square; circle maps hue to angle and saturation to radius with a vertical value slider. All share the same model and preserve alpha.

```vue
<FrameHsvRectangle v-model="color" :size="240" />
<FrameHsvWheel v-model="color" :size="280" />
<FrameVhsCircle v-model="color" size="100%" />
```

`update:modelValue` emits a hex string; `update:color` emits a `FrameColor` object. Retain that object when preserving hue at black or gray matters. `changeEnd` signals completion, and `disabled` blocks editing. The area scales to its container while keeping circular controls and thumbs round. Rectangle and wheel center retain Reka pointer and keyboard behavior; the ring supports arrows, Shift for ten-degree steps, Home and End. Circle Left/Right adjust hue and Up/Down saturation.

The circle is named [VHS Circle to match Pixelorama](https://www.oramainteractive.com/blog/pixelorama-1.0-is-out/): it edits hue/saturation in the disc and value in the adjacent slider. The existing `FrameColorArea` variant API remains available for compatibility.
