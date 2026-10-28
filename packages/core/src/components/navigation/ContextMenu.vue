<script setup lang="ts">
import FrameContextMenu from './FrameContextMenu.vue';
import type {FrameMenuItem} from './generalMenu';

defineProps<{
  /** Menu entries normalized and rendered by this menu presentation. */
  items: readonly FrameMenuItem[];
  /** Accessible name for this component and its built-in control or region. */
  label?: string;
  /** Horizontal alignment of item content within menu rows. */
  itemAlignment?: 'left' | 'center' | 'right';
}>();
const emit = defineEmits<{
  /** Emitted with the selected item and originating event when available. */
  select: [item: FrameMenuItem];
}>();
defineSlots<{
  /** Application content receiving the context-menu trigger interactions. */ default?(): unknown;
}>();
</script>
<template>
  <FrameContextMenu
    :items="items"
    :label="label"
    :item-alignment="itemAlignment"
    @select="emit('select', $event)"
    ><template #trigger
      ><div class="context-menu-target" tabindex="0"><slot /></div></template
  ></FrameContextMenu>
</template>
