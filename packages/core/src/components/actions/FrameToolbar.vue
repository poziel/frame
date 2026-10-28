<script setup lang="ts">
import {computed} from 'vue';
import {
  ToolbarRoot,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  useForwardProps,
} from 'reka-ui';
import type {ToolbarRootProps} from 'reka-ui';
import type {FrameToolbarItem} from './toolbarTypes';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../shared/general-b.css';

const props = defineProps<
  ToolbarRootProps & {
    /** Toolbar actions, links, and separators rendered when the default slot is absent. */
    items?: FrameToolbarItem[];
    /** Accessible name of the toolbar. */
    label?: string;
  }
>();
const emit = defineEmits<{
  /** The application action was activated. */
  action: [item: FrameToolbarItem];
}>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardProps(root);

defineSlots<{
  /** Replaces the built-in toolbar items composition. */
  default?(): unknown;
}>();
</script>
<template>
  <ToolbarRoot v-bind="forwarded" class="frame-toolbar" :aria-label="label"
    ><slot
      ><template v-for="item in items" :key="item.id"
        ><ToolbarSeparator
          v-if="item.separator"
          class="frame-toolbar-separator"
        /><ToolbarLink
          v-else-if="item.href && !item.disabled"
          :href="item.href"
          class="frame-toolbar-button"
          @click="emit('action', item)"
          ><FrameIcon v-if="item.icon" :name="item.icon" />{{
            item.label
          }}</ToolbarLink
        ><ToolbarButton
          v-else
          :disabled="item.disabled"
          class="frame-toolbar-button"
          @click="emit('action', item)"
          ><FrameIcon v-if="item.icon" :name="item.icon" />{{
            item.label
          }}</ToolbarButton
        ></template
      ></slot
    ></ToolbarRoot
  >
</template>
