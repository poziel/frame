# Quick input and quick panel

`FrameQuickInput` is a searched list. `FrameQuickPanel` is a titled overlay containing application-owned content. Both are Core visual components with explicit props, slots and events. Mount them while open and unmount them when the host handles `close`.

## Choose an item

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameButton, FrameQuickInput } from '@frame/core';
import '@frame/core/style.css';
const open = ref(false);
const selected = ref('');
const items = [
  { id: 'open', label: 'Open workspace', detail: 'Choose a workspace folder' },
  { id: 'save', label: 'Save files', shortcut: 'Ctrl+S' },
  { id: 'remote', label: 'Connect remote', disabled: true },
];
function accept(id: string) { selected.value = id; open.value = false; }
</script>
<template>
  <FrameButton @click="open = true">Choose command</FrameButton>
  <FrameQuickInput v-if="open" title="Choose command" :items="items"
    placeholder="Find a command…" @accept="accept" @close="open = false">
    <template #item="{ item, active }">
      <strong>{{ item.label }}</strong><small>{{ item.detail }}</small>
      <span v-if="active">Highlighted</span>
    </template>
  </FrameQuickInput>
  <p role="status">{{ selected }}</p>
</template>
```

Searching matches labels and details. Keyboard selection skips disabled entries. `accept` emits the item ID; the host decides what the selection does. `close` handles dismissal. The optional `item` slot receives `{ item, active }`. Component refs expose the search input `element` and `focus()`.

`frame.showQuickPick(items, { title, placeholder })` uses the same searched component and resolves the chosen item, or `undefined` after dismissal. Search is always available.

## Show custom content

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FrameButton, FrameQuickPanel } from '@frame/core';
import '@frame/core/style.css';
const open = ref(false);
</script>
<template>
  <FrameButton @click="open = true">Review workspace</FrameButton>
  <FrameQuickPanel v-if="open" title="Workspace summary" position="center"
    @close="open = false">
    <template #header-actions>
      <FrameButton @click="open = false">Done</FrameButton>
    </template>
    <p>All project files are saved.</p>
  </FrameQuickPanel>
</template>
```

The default slot holds custom content; `header-actions` adds actions beside the title. The panel has a built-in close button and emits `close`. It has no searched items or acceptance event.

Both components accept an optional `position: 'top' | 'center'`. Omit it to follow the provided Frame instance's `layout.quickInputPosition`. Without a provided Frame, the position defaults to `top`. Their portals follow Frame's existing overlay boundary and runtime theme variables.
