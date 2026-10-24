# Components

Frame components are imported from `@frame/core`. Load `@frame/core/style.css` once in your application. These form controls work without `createFrame()` or `FrameShell`.

Start with the smallest control that fits your data:

For glyphs and compact actions, see [icon controls](icon-controls.md), including rotation, flips, and icon-only hover emphasis.

| Component | Use it for |
| --- | --- |
| [FrameFileUpload / FrameFileDropZone](forms/file-upload.md) | Choosing files, visible drop targets, and invisible workspace drop overlays |
| [FrameLabel](forms/label.md) | A visible label associated with a control |
| [FrameTextInput](forms/text-input.md) | One line of text, passwords, email, or a native numeric input |
| [FrameTextArea](forms/text-area.md) | Multiple lines of plain text |
| [FrameCheckbox](forms/checkbox.md) | An independent boolean choice, such as accepting terms |
| [FrameSwitch](forms/switch.md) | A boolean setting presented as an on/off switch |
| [FrameSelect](forms/select.md) | One string value chosen from a fixed list |
| [FrameNumberField](forms/number-field.md) | Numeric quantities with parsing and step buttons |
| [FrameRadioGroup](forms/radio-group.md) | One visible choice from a string-valued list |
| [FrameCheckboxGroup](forms/checkbox-group.md) | Multiple string choices with group keyboard navigation |
| [FramePinInput](forms/pin-input.md) | A short code entered across individual cells |
| [FrameTagsInput](forms/tags-input.md) | Adding and removing committed string tags |
| [FrameAutocomplete](forms/autocomplete.md) | Free text with suggestions |
| [FrameCombobox](forms/combobox.md) | Searching a fixed list for one string choice |
| [FrameEditable](forms/editable.md) | Inline text editing with commit and cancellation |
| [FrameField](forms/field.md) | Labels, descriptions, and validation around a control |
| [FrameForm](forms/form.md) | Registered field validation and application submission |
| [FrameListbox](forms/listbox.md) | An always-visible single or multiple selection list |
| [FrameRating](forms/rating.md) | Numeric ratings with fractional steps |
| [FrameSlider](forms/slider.md) | A numeric value adjusted on a horizontal track |
| [FrameTagGroup](forms/tag-group.md) | Displaying, selecting, and removing existing tags |
| [FrameToggle](forms/toggle.md) | A button with a boolean pressed state |
| [FrameToggleGroup](forms/toggle-group.md) | Single or multiple pressed-state choices |

Each page documents Frame's wrapper: its actual props, events, slots, and behavior. It does not imply that every underlying Reka option is part of Frame's public API. Values belong to the host; controls emit updates and do not save data or call a backend.

Every component page follows three sections: Features, APIs, and Styling. Features contains anatomy and examples; APIs documents the individual parts and Frame additions; Styling maps selectors and override variables. The [Reka coverage review](../reference/reka-coverage.md) records the upstream comparison behind these references.

The examples are ordinary Vue single-file components. Follow-up examples on a page reuse that page's setup unless stated otherwise. Markdown is the source documentation; live website examples can be added separately later.

These pages cover the current Forms category and the standalone text, checkbox, select, and slider controls. Colors and dates/times are separate catalog categories and still need their own guides. See [theme variables](../styling/theme-variables.md) for shared tokens and [getting started](../guides/getting-started.md) for the application shell.
