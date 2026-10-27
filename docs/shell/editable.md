# Editable text

`FrameEditable` uses Reka's editable primitives and `FrameTextField` for the input.

- `submitMode="both"` (default): Enter, Tab, Shift+Tab, clicking outside, and removal of the editor (for example a view change) submit the draft. Escape discards it.
- `submitMode="enter"`: Enter submits; leaving the field discards the draft. Escape also discards it.
- `activationMode="focus"` (default), `"dblclick"`, or `"none"` controls how the preview activates.
- `startWithEditMode` starts editing when mounted, useful for context-menu rename actions.
- `selectOnFocus` selects the input text when editing starts (default false).

`update:modelValue` and `submit(value)` fire for committed text. `cancel` reports cancellation; `update:state` reports `edit`, `submit`, or `cancel`. Editing keystrokes do not update the model. These modes do not persist changes themselves: the application owns validation and saving. Blank-name validation remains the host's responsibility. Enter and Escape are contained within the input so they do not submit an enclosing form or close an enclosing dialog. IME composition Enter is left to the input.

```vue
<FrameEditable v-model="name" label="Project name" activation-mode="dblclick" submit-mode="both" />
<FrameEditable v-model="name" label="Project name" activation-mode="dblclick" submit-mode="enter" />
```
