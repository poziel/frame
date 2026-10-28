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
import './styles/navigation.scss';

const props = defineProps<
  TabsRootProps & {items?: FrameTabItem[]; label?: string}
>();
const emit = defineEmits<TabsRootEmits>();
const root = computed(() => {
  const {items, label, ...rest} = props;
  return rest;
});
const forwarded = useForwardPropsEmits(root, emit);
</script>
<template>
  <TabsRoot
    v-bind="forwarded"
    class="frame-tabs frame-navigation-text"
    v-slot="state"
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

<style lang="scss">
.frame-tabs-content {
  padding: 16px 8px;
}

.frame-tabs[data-orientation='vertical'] {
  display: flex;
}

.frame-tabs[data-orientation='vertical'] > .frame-tabs-list {
  flex-direction: column;
  align-items: stretch;
}

/* Plain navigation tabs share the documentation's baseline/indicator treatment. */
.frame-tabs > .frame-tabs-list {
  display: flex;
  list-style: none;
  gap: var(--frame-tabs-gap, 20px);
  padding: var(--frame-tabs-list-padding, 0);
  margin: 0;
  min-width: 0;
  overflow-x: auto;
  border-bottom: var(--frame-tabs-list-border, 1px solid var(--frame-line));
  align-items: stretch;
}

.frame-tabs .frame-tabs-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
  min-height: var(--frame-tabs-trigger-min-height, 30px);
  padding: var(--frame-tabs-trigger-padding, 12px 0);
  border: 0;
  border-bottom: var(--frame-tabs-indicator-width, 2px) solid transparent;
  border-radius: var(--frame-tabs-trigger-border-radius, 0);
  background: var(--frame-tabs-trigger-background, transparent);
  color: var(--frame-tabs-trigger-color, var(--frame-text));
  white-space: nowrap;
}

.frame-tabs .frame-tabs-trigger:hover:not(:disabled) {
  background: var(--frame-tabs-trigger-hover-background, transparent);
  color: var(--frame-tabs-trigger-hover-color, var(--frame-text));
}

.frame-tabs .frame-tabs-trigger[data-state='active'] {
  background: var(--frame-tabs-trigger-selected-background, transparent);
  color: var(--frame-tabs-trigger-selected-color, var(--frame-text));
  border-bottom-color: var(--frame-tabs-indicator-color, var(--frame-accent));
}

.frame-tabs .frame-tabs-trigger:focus-visible {
  outline: var(
    --frame-tabs-trigger-focus-outline,
    1px solid var(--frame-accent)
  );
  outline-offset: var(--frame-tabs-trigger-outline-offset, -2px);
}

.frame-tabs > .frame-tabs-content {
  padding: var(--frame-tabs-content-padding, 16px 0);
}

.frame-tabs[data-orientation='vertical'] > .frame-tabs-list {
  border-bottom: 0;
  border-inline-end: var(--frame-tabs-list-border, 1px solid var(--frame-line));
  overflow-x: visible;
}

.frame-tabs[data-orientation='vertical'] .frame-tabs-trigger {
  border-bottom: 0;
  border-inline-end: var(--frame-tabs-indicator-width, 2px) solid transparent;
  padding: var(--frame-tabs-vertical-trigger-padding, 8px 12px);
}

.frame-tabs[data-orientation='vertical']
  .frame-tabs-trigger[data-state='active'] {
  border-inline-end-color: var(
    --frame-tabs-indicator-color,
    var(--frame-accent)
  );
}
</style>
