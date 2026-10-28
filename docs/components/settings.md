# Settings

A ready-to-use settings modal with nested categories and standard controls.

## Features

### Basic usage

Register application-owned sections. Frame handles navigation and presentation; onChange and optional getValue connect the controls to your preference store.

<!-- frame:example id="settings.basic" -->

```vue
frame.registerSettingsSection({ id: 'general', title: 'General', settings: [{ id: 'autosave', label: 'Autosave', type: 'checkbox', default: true }] });
frame.openSettings();
```

### Composition and configuration

Compose this API with application-owned content. Use the actions in this example to inspect the behavior.

<!-- frame:example id="settings.configured" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameSettings, FrameShell } from '@frame/core';
import { createFrame } from '@frame/core';
const frame = createFrame();
onBeforeUnmount(() => { frame.dispose(); });
</script>
<template>
<FrameShell :frame="frame">
<FrameSettings >
  <template #default><span v-text="&quot;Example content&quot;" /></template>
</FrameSettings>
</FrameShell>
</template>
```

## APIs

<!-- frame:generated api="settings" -->

### FrameSettings

Source: `packages/core/src/components/framework/FrameSettings.vue`

#### Properties

No declared entries.

#### Events

No declared entries.

#### Slots

| Name      | Parameters                                          | Return type  | Description                                                                                   |
| --------- | --------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `default` | `{ section: SettingsSection; settings: Settings; }` | `VNodeChild` | Replaces a section's generated settings controls while retaining its owning Frame controller. |

#### Exposed API

No declared entries.

### frame.registerSettingsSection

Source: `packages/core/src/framework/settings/settings.ts`

#### Properties

| Name          | Type                           | Default  | Description                                                    |
| ------------- | ------------------------------ | -------- | -------------------------------------------------------------- |
| `id`          | `string`                       | Required | Stable identity used to address this contribution.             |
| `title`       | `string`                       | Required | Heading displayed by the owning presentation.                  |
| `description` | `string`                       | Omitted  | Explanatory text displayed alongside the entry.                |
| `settings`    | `readonly SettingDefinition[]` | Omitted  | Field definitions registered within this section.              |
| `children`    | `readonly SettingsSection[]`   | Omitted  | Nested definitions rendered and registered beneath this entry. |
| `component`   | `Component`                    | Omitted  | Host-supplied Vue component rendered for this contribution.    |
| `props`       | `Record<string, unknown>`      | Omitted  | Properties forwarded to the host-supplied component.           |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name                            | Parameters                                                 | Return type  | Description                                                                         |
| ------------------------------- | ---------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| `frame.registerSettingsSection` | `section: SettingsSection, parentId?: string \| undefined` | `() => void` | Shares the existing settings.register operation or state with the public shell API. |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="settings" -->

| CSS variable                                                | Theme path                                                | Default expression                        | Purpose                                                                             | Context                                                                   |
| ----------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `--frame-setting-description-font-size`                     | `frame.setting.description.font.size`                     | `12px`                                    | Text size for .setting-description.                                                 | `.setting-description`                                                    |
| `--frame-setting-description-color`                         | `frame.setting.description.color`                         | `#a5adb1`                                 | Foreground for .setting-description.                                                | `.setting-description`                                                    |
| `--frame-setting-description-line-height`                   | `frame.setting.description.line.height`                   | `1.6`                                     | Text line height for .setting-description.                                          | `.setting-description`                                                    |
| `--frame-setting-description-margin`                        | `frame.setting.description.margin`                        | `0 0 8px`                                 | Outer spacing for .setting-description.                                             | `.setting-description`                                                    |
| `--frame-settings-description-line-height`                  | `frame.settings.description.line.height`                  | `1.5`                                     | Text line height for .settings-field-row :deep(.setting-description).               | `.settings-field-row :deep(.setting-description)`                         |
| `--frame-settings-settings-tree-margin`                     | `frame.settings.settings.tree.margin`                     | `0`                                       | Outer spacing for .frame-settings .settings-tree.                                   | `.frame-settings .settings-tree`                                          |
| `--frame-settings-settings-tree-padding`                    | `frame.settings.settings.tree.padding`                    | `0`                                       | Internal spacing for .frame-settings .settings-tree.                                | `.frame-settings .settings-tree`                                          |
| `--frame-settings-settings-tree-settings-tree-padding-left` | `frame.settings.settings.tree.settings.tree.padding.left` | `16px`                                    | Left internal spacing for .frame-settings .settings-tree .settings-tree.            | `.frame-settings .settings-tree .settings-tree`                           |
| `--frame-modal-settings-content-p-margin-top`               | `frame.modal.settings.content.p.margin.top`               | `0`                                       | Top outer spacing for .frame-modal .settings-content p.                             | `.frame-modal .settings-content p`                                        |
| `--frame-settings-group-title-gap`                          | `frame.settings.group.title.gap`                          | `6px`                                     | Value of margin-block for .settings-content > h2.                                   | `.settings-content > h2`                                                  |
| `--frame-settings-group-description-gap`                    | `frame.settings.group.description.gap`                    | `12px`                                    | Outer spacing for .settings-content > .setting-description.                         | `.settings-content > .setting-description`                                |
| `--frame-settings-description-line-height`                  | `frame.settings.description.line.height`                  | `1.5`                                     | Text line height for .settings-content > .setting-description.                      | `.settings-content > .setting-description`                                |
| `--frame-settings-height`                                   | `frame.settings.height`                                   | `100%`                                    | Height for .frame-settings.                                                         | `.frame-settings`                                                         |
| `--frame-settings-min-height`                               | `frame.settings.min.height`                               | `0`                                       | Minimum height for .frame-settings.                                                 | `.frame-settings`                                                         |
| `--frame-settings-settings-navigation-padding`              | `frame.settings.settings.navigation.padding`              | `18px 8px`                                | Internal spacing for .frame-settings .settings-navigation.                          | `.frame-settings .settings-navigation`                                    |
| `--frame-line`                                              | `frame.line`                                              | No declared default; supplied by context. | Neutral divider color for content boundaries, tracks, and structural separators.    | `.frame-settings .settings-navigation`                                    |
| `--frame-settings-settings-content-padding`                 | `frame.settings.settings.content.padding`                 | `24px 30px`                               | Internal spacing for .frame-settings .settings-content.                             | `.frame-settings .settings-content`                                       |
| `--frame-settings-settings-content-min-width`               | `frame.settings.settings.content.min.width`               | `0`                                       | Minimum width for .frame-settings .settings-content.                                | `.frame-settings .settings-content`                                       |
| `--frame-settings-content-h2-font-size`                     | `frame.settings.content.h2.font.size`                     | `24px`                                    | Text size for .settings-content h2.                                                 | `.settings-content h2`                                                    |
| `--frame-settings-content-h2-font-weight`                   | `frame.settings.content.h2.font.weight`                   | `600`                                     | Text weight for .settings-content h2.                                               | `.settings-content h2`                                                    |
| `--frame-settings-content-h2-margin`                        | `frame.settings.content.h2.margin`                        | `0 0 24px`                                | Outer spacing for .settings-content h2.                                             | `.settings-content h2`                                                    |
| `--frame-settings-settings-content-padding-2`               | `frame.settings.settings.content.padding.2`               | `18px 14px`                               | Internal spacing for .frame-settings .settings-content.                             | `@media (max-width: 600px) { .frame-settings .settings-content }`         |
| `--frame-settings-settings-navigation-height`               | `frame.settings.settings.navigation.height`               | `100%`                                    | Height for .frame-settings .settings-navigation, .frame-settings .settings-content. | `.frame-settings .settings-navigation, .frame-settings .settings-content` |
| `--frame-settings-settings-navigation-padding-2`            | `frame.settings.settings.navigation.padding.2`            | `18px 14px`                               | Internal spacing for .frame-settings .settings-navigation.                          | `.frame-settings .settings-navigation`                                    |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
