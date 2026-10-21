# Component catalog and activity actions

The demo opens Components as its first sidebar view. Home is the first activity item, followed by Components and the existing sample views. Home is an action without selection state: it calls resetWorkspace(), returning to a single empty canvas while leaving the sidebar available.

Every catalog page uses the exported ComponentShowcase component with live preview, behavior notes, API table, copyable code, and action/value feedback. Catalog definitions and content stay in packages/docs/src/examples; they are not included in the reusable library build. **Loader** previews all 44 LDRS styles with filtering and copyable usage; **Loading region** demonstrates scoped blocking, configurable text placement, optional animation/text, mounted content, and asynchronous completion. See [Loading](loading.md).

## Activity actions

```ts
const removeHome = frame.registerActivityAction({
  id: "home", label: "Home", icon: HomeIcon,
  run: frame.resetWorkspace,
});
```

Actions appear before sidebar views. They execute run() without opening or selecting a view and are not draggable views. disabled prevents clicks. Supply optional active: true/false or active: () => someReactiveValue to opt into selected styling. Each registration returns an idempotent disposer. Actions are isolated per Frame instance and cleared by frame.dispose().

registerView() remains the API for items that open sidebar/panel content. resetWorkspace() clears all workspace content and splits, restoring one empty pane; sidebar contributions and their state remain available.

## Buttons and form controls

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FrameButton, FrameTextInput, FrameCheckbox, FrameSelect } from "@frame/core";
const name = ref("");
const enabled = ref(false);
const mode = ref("manual");
const options = [{ value: "manual", label: "Manual", description: "Save on demand." },
  { value: "auto", label: "Automatic", description: "Save while you work." }];
</script>
<template>
  <FrameButton variant="ghost">Quiet action</FrameButton>
  <FrameButton variant="secondary">Secondary action</FrameButton>
  <FrameButton variant="primary" icon="check">Primary action</FrameButton>
  <label for="name">Name</label><FrameTextInput id="name" v-model="name" />
  <FrameCheckbox v-model="enabled" label="Autosave" />
  <FrameSelect v-model="mode" label="Save mode" :options="options" default-value="manual" />
</template>
```

Import @frame/core/style.css once. FrameButton is the shared foundation used by FrameIconButton. All controls support disabled state. FrameTextInput forwards normal HTML input attributes and accepts text, number, password, search, or email type. Numeric inputs emit numbers; empty input emits an empty string for host validation. FrameCheckbox uses a native checkbox with a neutral themed mark and clickable label. FrameSelect uses an app-rendered listbox, with disabled choices, details, descriptions, a default marker, keyboard navigation/typeahead, and viewport-aware placement. Changing the highlighted option does not commit until selected; Escape cancels.

SettingControl uses these same primitives for its corresponding types. It composes FrameTextArea, FrameSlider, and FrameColorPicker for textarea, range, and color controls. These controls are also exported for direct use.

## Shared example page

```vue
<ComponentShowcase title="My component" description="What it does" usage="How to use it"
  :code="sourceExample" :properties="[{name:'value',description:'Current value'}]">
  <MyComponent v-model="value" />
  <template #feedback>Current value: {{ value }}</template>
</ComponentShowcase>
```

The default slot holds live content, feedback supplies value/action output, and controls can add page controls to the preview heading. Code is displayed as plain text, never executed or inserted as HTML.

## Example variants and reference pages

Selects have tabs for described options, options without descriptions, grouped options with separators, and disabled choices. Tabs support arrow keys, Home, and End. Descriptions are optional; separators cannot be selected and keyboard navigation skips them.

```ts
import type { SelectItem } from "@frame/core";
const options: SelectItem[] = [
  { value: "manual", label: "Manual" },
  { type: "separator", id: "save-modes" },
  { value: "auto", label: "Automatic", description: "Save while working." },
];
```

Component pages link to in-app reference pages for `SelectItem`, `FrameMenuItem`, and `SettingDefinition`. References also support direct URLs such as `#/types/FrameMenuItem` in the documentation app. See [Package boundaries](package-boundaries.md) for the core and documentation workspace packages.

The Icons page lists the bundled icons with search, previews, and Vue snippets. Clicking a tile copies its snippet. Icônes online opens the external icon browser inside the workspace, with an external link as a fallback.

## API activity section

The documentation app registers an API activity entry with the bundled references icon. Its searchable, scrollable sidebar lists every documented contract, grouped into runtime classes, object contracts, and value types, with the exporting package shown beside each entry. The class group includes SelectItem, SelectOption, and SelectSeparator.

Component type links open the same API pages and select the API sidebar. Reference pages explain behavior, constructor usage where relevant, code examples, and property types. Nested links retain a Back action that restores the previous page and sidebar. Direct class selections are root API pages and do not show an unrelated Back action.

API URLs use `#/api/Name`; existing `#/types/Name` links remain supported. Catalog entries derive from the shared typeDocs registry, so adding a documented reference exposes it in the sidebar automatically. Core and Extras do not register the catalog or import documentation code.
