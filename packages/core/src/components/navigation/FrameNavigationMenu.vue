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
import './styles/navigation.scss';

const props = defineProps<
  NavigationMenuRootProps & {
    /** Items rendered by the built-in composition; a default slot replaces that composition. */
    items?: FrameNavigationItem[];
    /** Accessible name for this component and its built-in control or region. */
    label?: string;
  }
>();
const emit = defineEmits<NavigationMenuRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
defineSlots<{
  /** Replaces the built-in navigation list. */ default?(): unknown;
  /** Replaces one submenu's generated child links. */ content?(
    props: {
    item: FrameNavigationItem;
  }
  ): unknown;
}>();
</script>
<template>
  <NavigationMenuRoot
    v-bind="forwarded"
    class="frame-navigation-menu frame-navigation-text"
    :aria-label="label"
    ><slot
      ><NavigationMenuList
        class="frame-navigation-list frame-navigation-list-layout"
        ><NavigationMenuItem
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          class="frame-navigation-item"
          ><template v-if="item.children?.length"
            ><NavigationMenuTrigger
              :disabled="item.disabled"
              class="frame-navigation-trigger frame-navigation-control frame-navigation-focus"
              >{{ item.label
              }}<FrameIcon name="chevron-down" /></NavigationMenuTrigger
            ><NavigationMenuContent
              class="frame-navigation-content frame-navigation-surface frame-overlay-surface"
              ><slot name="content" :item="item"
                ><NavigationMenuLink
                  v-for="child in item.children"
                  :key="child.value"
                  :href="child.disabled ? undefined : child.href"
                  :aria-disabled="child.disabled || undefined"
                  :tabindex="child.disabled ? -1 : undefined"
                  class="frame-navigation-link frame-navigation-control frame-navigation-focus"
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
            class="frame-navigation-link frame-navigation-control frame-navigation-focus"
            @click="item.disabled && $event.preventDefault()"
            >{{ item.label }}</NavigationMenuLink
          ></NavigationMenuItem
        ></NavigationMenuList
      ></slot
    ></NavigationMenuRoot
  >
</template>

<style lang="scss">
.frame-navigation-item {
  position: relative;
}

.frame-navigation-content {
  position: absolute;
  top: 100%;
  left: 0;
}

.frame-navigation-content > .frame-navigation-link {
  display: flex;
  justify-content: flex-start;
}

.frame-navigation-list[data-orientation='vertical'] {
  flex-direction: column;
  align-items: stretch;
}
</style>
