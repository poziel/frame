<script setup lang="ts">
import {computed} from 'vue';
import {
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  useForwardPropsEmits,
} from 'reka-ui';
import type {NavigationMenuRootProps, NavigationMenuRootEmits} from 'reka-ui';
import type {FrameNavigationItem} from './navigationMenuTypes';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../shared/general-b.css';

const props = defineProps<
  NavigationMenuRootProps & {items?: FrameNavigationItem[]; label?: string}
>();
const emit = defineEmits<NavigationMenuRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
</script>
<template>
  <NavigationMenuRoot
    v-bind="forwarded"
    class="frame-navigation-menu"
    :aria-label="label"
    ><slot
      ><NavigationMenuList class="frame-navigation-list"
        ><NavigationMenuItem
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          class="frame-navigation-item"
          ><template v-if="item.children?.length"
            ><NavigationMenuTrigger
              :disabled="item.disabled"
              class="frame-navigation-trigger"
              >{{ item.label
              }}<FrameIcon name="chevron-down" /></NavigationMenuTrigger
            ><NavigationMenuContent class="frame-navigation-content"
              ><slot name="content" :item="item"
                ><NavigationMenuLink
                  v-for="child in item.children"
                  :key="child.value"
                  :href="child.disabled ? undefined : child.href"
                  :aria-disabled="child.disabled || undefined"
                  :tabindex="child.disabled ? -1 : undefined"
                  class="frame-navigation-link"
                  @click="child.disabled && $event.preventDefault()"
                  >{{ child.label }}</NavigationMenuLink
                ></slot
              ></NavigationMenuContent
            ></template
          ><NavigationMenuLink
            v-else
            :href="item.disabled ? undefined : item.href"
            :aria-disabled="item.disabled || undefined"
            :tabindex="item.disabled ? -1 : undefined"
            class="frame-navigation-link"
            @click="item.disabled && $event.preventDefault()"
            >{{ item.label }}</NavigationMenuLink
          ></NavigationMenuItem
        ></NavigationMenuList
      ></slot
    ></NavigationMenuRoot
  >
</template>
