<script setup lang="ts">
import {computed} from 'vue';
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  useForwardPropsEmits,
} from 'reka-ui';
import type {TabsRootProps, TabsRootEmits} from 'reka-ui';
import type {FrameTabItem} from './tabsTypes';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../shared/general-b.css';

const props = defineProps<
  TabsRootProps & {
    /** Items rendered by the built-in composition; a default slot replaces that composition. */
    items?: FrameTabItem[];
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
  }
>();
const emit = defineEmits<TabsRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
defineSlots<{
  /** Replaces the built-in tab triggers and panels. */ default?(
    props: {
    modelValue: string | number | undefined;
  }
  ): unknown;
  /** Replaces a configured tab's trigger text and icon. */ trigger?(
    props: {
    item: FrameTabItem;
  }
  ): unknown;
  /** Replaces a configured tab's fallback panel text. */ content?(
    props: {
    item: FrameTabItem;
  }
  ): unknown;
}>();
</script>
<template>
  <TabsRoot v-bind="forwarded" class="frame-tabs" v-slot="state"
    ><slot v-bind="state"
      ><TabsList class="frame-tabs-list" :aria-label="label"
        ><TabsTrigger
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :disabled="item.disabled"
          class="frame-tabs-trigger"
          ><slot name="trigger" :item="item"
            ><FrameIcon v-if="item.icon" :name="item.icon" />{{
              item.label
            }}</slot
          ></TabsTrigger
        ></TabsList
      ><TabsContent
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        class="frame-tabs-content"
        ><slot name="content" :item="item">{{
          item.content
        }}</slot></TabsContent
      ></slot
    ></TabsRoot
  >
</template>
