# Settings Controls

Metadata-driven controls for complete settings forms.

## Features

### Edit a numeric preference

Metadata chooses a numeric input while the host owns the preference value and persistence.

<!-- frame:example id="setting-controls.autosave-interval" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { SettingControl } from '@frame/core';
const demoSetting = {
  "id": "autosave",
  "label": "Autosave interval",
  "type": "number",
  "default": 30,
  "min": 5,
  "max": 300,
  "step": 5,
  "description": "Seconds between automatic saves."
};
const demoModelValue = ref(30);
</script>
<template>
<SettingControl :setting="demoSetting" v-model="demoModelValue" />
</template>
```

### Describe a choice preference

Select metadata includes labels, values and explanatory option descriptions.

<!-- frame:example id="setting-controls.save-policy" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { SettingControl } from '@frame/core';
const demoSetting = {
  "id": "save-mode",
  "label": "Save policy",
  "type": "select",
  "default": "manual",
  "options": [
    {
      "value": "manual",
      "label": "Manual",
      "description": "Save when requested."
    },
    {
      "value": "automatic",
      "label": "Automatic",
      "description": "Save as you work."
    }
  ]
};
const demoModelValue = ref("manual");
</script>
<template>
<SettingControl :setting="demoSetting" v-model="demoModelValue" />
</template>
```

### Store a multiline preference

The same setting contract can request a textarea for an application-owned notes preference.

<!-- frame:example id="setting-controls.notes" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { SettingControl } from '@frame/core';
const demoSetting = {
  "id": "notes",
  "label": "Workspace notes",
  "type": "textarea",
  "default": "",
  "placeholder": "Add workspace notes"
};
const demoModelValue = ref("Keep this workspace focused.");
</script>
<template>
<SettingControl :setting="demoSetting" v-model="demoModelValue" />
</template>
```

## APIs

<!-- frame:generated api="setting-controls" -->

### SettingControl

Source: `packages/core/src/components/framework/SettingControl.vue`

#### Properties

| Name         | Type                | Default  | Description                                                                                     |
| ------------ | ------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `setting`    | `SettingDefinition` | Required | Setting definition controlling the input type, options, description, and disabled state.        |
| `modelValue` | `SettingValue`      | Required | Controlled value supplied by the host; user changes request updates through the matching event. |

#### Events

| Name                | Parameters            | Return type | Description                                              |
| ------------------- | --------------------- | ----------- | -------------------------------------------------------- |
| `update:modelValue` | `value: SettingValue` | `void`      | Requests a new controlled value after input interaction. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="setting-controls" -->

| CSS variable                                       | Theme path                                       | Default expression                          | Purpose                                                                                         | Context                                                                               |
| -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `--frame-setting-field-gap`                        | `frame.setting.field.gap`                        | `8px`                                       | Space between children for .setting-field.                                                      | `.setting-field`                                                                      |
| `--frame-setting-field-margin`                     | `frame.setting.field.margin`                     | `0 0 30px`                                  | Outer spacing for .setting-field.                                                               | `.setting-field`                                                                      |
| `--frame-setting-field-max-width`                  | `frame.setting.field.max.width`                  | `760px`                                     | Maximum width for .setting-field.                                                               | `.setting-field`                                                                      |
| `--frame-setting-label-font-size`                  | `frame.setting.label.font.size`                  | `13px`                                      | Text size for .setting-label.                                                                   | `.setting-label`                                                                      |
| `--frame-setting-label-font-weight`                | `frame.setting.label.font.weight`                | `600`                                       | Text weight for .setting-label.                                                                 | `.setting-label`                                                                      |
| `--frame-setting-description-font-size`            | `frame.setting.description.font.size`            | `12px`                                      | Text size for .setting-description.                                                             | `.setting-description`                                                                |
| `--frame-setting-description-color`                | `frame.setting.description.color`                | `#a5adb1`                                   | Foreground for .setting-description.                                                            | `.setting-description`                                                                |
| `--frame-setting-description-line-height`          | `frame.setting.description.line.height`          | `1.6`                                       | Text line height for .setting-description.                                                      | `.setting-description`                                                                |
| `--frame-setting-description-margin`               | `frame.setting.description.margin`               | `0 0 8px`                                   | Outer spacing for .setting-description.                                                         | `.setting-description`                                                                |
| `--frame-setting-field-is-input-not-width`         | `frame.setting.field.is.input.not.width`         | `min(     100%,     340px   )`              | Width for .setting-field :is(input:not([type='checkbox']), select, textarea).                   | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-is-input-not-padding`       | `frame.setting.field.is.input.not.padding`       | `7px 9px`                                   | Internal spacing for .setting-field :is(input:not([type='checkbox']), select, textarea).        | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-is-input-not-border`        | `frame.setting.field.is.input.not.border`        | `1px solid     var(--frame-control-border)` | Border for .setting-field :is(input:not([type='checkbox']), select, textarea).                  | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-is-input-not-border-radius` | `frame.setting.field.is.input.not.border.radius` | `var(     --frame-input-radius   )`         | Corner radius for .setting-field :is(input:not([type='checkbox']), select, textarea).           | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-is-input-not-background`    | `frame.setting.field.is.input.not.background`    | `#1b1d1e`                                   | Background for .setting-field :is(input:not([type='checkbox']), select, textarea).              | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-is-input-not-color`         | `frame.setting.field.is.input.not.color`         | `#dedede`                                   | Foreground for .setting-field :is(input:not([type='checkbox']), select, textarea).              | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-control-border`                           | `frame.control.border`                           | `var(--frame-border-color)`                 | Resting border color of form controls, independently overridable from menu borders.             | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-input-radius`                             | `frame.input.radius`                             | `var(--frame-menu-border-radius)`           | Shared corner radius for text fields, text areas, selects, and composed input surfaces.         | `.setting-field :is(input:not([type='checkbox']), select, textarea)`                  |
| `--frame-setting-field-input-width`                | `frame.setting.field.input.width`                | `18px`                                      | Width for .setting-field input[type='checkbox'].                                                | `.setting-field input[type='checkbox']`                                               |
| `--frame-setting-field-input-height`               | `frame.setting.field.input.height`               | `18px`                                      | Height for .setting-field input[type='checkbox'].                                               | `.setting-field input[type='checkbox']`                                               |
| `--frame-accent`                                   | `frame.accent`                                   | `#0078d4`                                   | Shared interaction color for keyboard focus, active actions, and accent-filled controls.        | `.setting-field input[type='checkbox']`                                               |
| `--frame-setting-field-input-height-2`             | `frame.setting.field.input.height.2`             | `36px`                                      | Height for .setting-field input[type='color'].                                                  | `.setting-field input[type='color']`                                                  |
| `--frame-setting-field-input-width-2`              | `frame.setting.field.input.width.2`              | `70px`                                      | Width for .setting-field input[type='color'].                                                   | `.setting-field input[type='color']`                                                  |
| `--frame-setting-field-input-padding`              | `frame.setting.field.input.padding`              | `3px`                                       | Internal spacing for .setting-field input[type='color'].                                        | `.setting-field input[type='color']`                                                  |
| `--frame-setting-field-textarea-min-height`        | `frame.setting.field.textarea.min.height`        | `90px`                                      | Minimum height for .setting-field textarea.                                                     | `.setting-field textarea`                                                             |
| `--frame-setting-field-disabled-opacity`           | `frame.setting.field.disabled.opacity`           | `0.5`                                       | Opacity for .setting-field :disabled.                                                           | `.setting-field :disabled`                                                            |
| `--frame-setting-field-select-option-background`   | `frame.setting.field.select.option.background`   | `#25292c`                                   | Background for .setting-field select option.                                                    | `.setting-field select option`                                                        |
| `--frame-setting-field-select-option-color`        | `frame.setting.field.select.option.color`        | `#eee`                                      | Foreground for .setting-field select option.                                                    | `.setting-field select option`                                                        |
| `--frame-setting-field-output-font-size`           | `frame.setting.field.output.font.size`           | `12px`                                      | Text size for .setting-field output.                                                            | `.setting-field output`                                                               |
| `--frame-muted`                                    | `frame.muted`                                    | `#8e9496`                                   | Secondary foreground for descriptions, hints, and visually subordinate content.                 | `.setting-field output`                                                               |
| `--frame-modal-setting-field-is-select-border`     | `frame.modal.setting.field.is.select.border`     | `1px solid     #3c4246`                     | Border for .frame-modal .setting-field :is(select, textarea, input:not([type='checkbox'])).     | `.frame-modal   .setting-field   :is(select, textarea, input:not([type='checkbox']))` |
| `--frame-modal-setting-field-is-select-background` | `frame.modal.setting.field.is.select.background` | `#1b1d1e`                                   | Background for .frame-modal .setting-field :is(select, textarea, input:not([type='checkbox'])). | `.frame-modal   .setting-field   :is(select, textarea, input:not([type='checkbox']))` |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
