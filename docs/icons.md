# Icons

```vue
<script setup lang="ts">
import { FrameIcon } from "@frame/core";
</script>
<template>
  <FrameIcon name="layout-sidebar-left" :size="16" />
  <FrameIcon name="codicon:layout-panel-justify" />
  <FrameIcon pack="mdi" name="home" :size="20" />
</template>
```

Microsoft Codicons (the VS Code UI icon set) are bundled locally, including every layout icon. They work without network access. Names from https://icones.js.org/ use Iconify's `pack:name` notation. Other collections load on demand from the public Iconify API; their first load needs network access. The component reserves its dimensions while loading.

For offline use, install the desired @iconify-json/<pack> package and register it before rendering:

```ts
import { addCollection } from "@frame/core";
import { icons } from "@iconify-json/mdi";
addCollection(icons);
```

Frame also exports addIcon for individual bundled/custom icons. Icons are decorative; give the surrounding button an accessible label. Each pack has its own license, shown by Icônes/Iconify. Preserve the [third-party notices](licenses/THIRD_PARTY_NOTICES.md) and [Codicons license](licenses/codicons.txt) when redistributing Frame. Iconify software's MIT license does not replace the artwork licenses.

## Documentation browser

The Components menu has one Icons page for usage and API details. Its Included icons link opens the entire searchable bundled catalog on one page. Click a preview to copy its FrameIcon component code; the copy button beside a name copies only the bare icon name. The Online icons link opens Icônes across the workspace pane, with a browser link if embedding is unavailable. Both pages return to Icons documentation.
