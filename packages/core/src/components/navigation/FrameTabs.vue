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
  /* Space between tab triggers. @token --frame-tabs-gap */
  --_frame-default-tabs-gap-148: 20px;
  gap: var(--frame-tabs-gap, var(--_frame-default-tabs-gap-148));
  /* Inset around the tab trigger list. @token --frame-tabs-list-padding */
  --_frame-default-tabs-list-padding-149: 0;
  padding: var(
    --frame-tabs-list-padding,
    var(--_frame-default-tabs-list-padding-149)
  );
  margin: 0;
  min-width: 0;
  overflow-x: auto;
  /* Baseline border along the tab trigger list. @token --frame-tabs-list-border */
  --_frame-default-tabs-list-border-150: 1px solid var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-bottom: var(
    --frame-tabs-list-border,
    var(--_frame-default-tabs-list-border-150)
  );
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
  /* Minimum height of a tab trigger. @token --frame-tabs-trigger-min-height */
  --_frame-default-tabs-trigger-min-height-151: 30px;
  min-height: var(
    --frame-tabs-trigger-min-height,
    var(--_frame-default-tabs-trigger-min-height-151)
  );
  /* Internal spacing of a horizontal tab trigger. @token --frame-tabs-trigger-padding */
  --_frame-default-tabs-trigger-padding-152: 12px 0;
  padding: var(
    --frame-tabs-trigger-padding,
    var(--_frame-default-tabs-trigger-padding-152)
  );
  border: 0;
  /* Thickness of the selected-tab underline or side indicator. @token --frame-tabs-indicator-width */
  --_frame-default-tabs-indicator-width-153: 2px;
  border-bottom: var(
      --frame-tabs-indicator-width,
      var(--_frame-default-tabs-indicator-width-153)
    )
    solid transparent;
  /* Corner radius of a tab trigger. @token --frame-tabs-trigger-border-radius */
  --_frame-default-tabs-trigger-border-radius-154: 0;
  border-radius: var(
    --frame-tabs-trigger-border-radius,
    var(--_frame-default-tabs-trigger-border-radius-154)
  );
  /* Resting surface of a tab trigger. @token --frame-tabs-trigger-background */
  --_frame-default-tabs-trigger-background-155: transparent;
  background: var(
    --frame-tabs-trigger-background,
    var(--_frame-default-tabs-trigger-background-155)
  );
  /* Resting foreground of a tab trigger. @token --frame-tabs-trigger-color */
  --_frame-default-tabs-trigger-color-156: var(--frame-text);
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-tabs-trigger-color,
    var(--_frame-default-tabs-trigger-color-156)
  );
  white-space: nowrap;
}

.frame-tabs .frame-tabs-trigger:hover:not(:disabled) {
  /* Pointer hover surface of an enabled tab trigger. @token --frame-tabs-trigger-hover-background */
  --_frame-default-tabs-trigger-hover-background-157: transparent;
  background: var(
    --frame-tabs-trigger-hover-background,
    var(--_frame-default-tabs-trigger-hover-background-157)
  );
  /* Pointer hover foreground of an enabled tab trigger. @token --frame-tabs-trigger-hover-color */
  --_frame-default-tabs-trigger-hover-color-158: var(--frame-text);
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-tabs-trigger-hover-color,
    var(--_frame-default-tabs-trigger-hover-color-158)
  );
}

.frame-tabs .frame-tabs-trigger[data-state='active'] {
  /* Surface of the selected tab trigger. @token --frame-tabs-trigger-selected-background */
  --_frame-default-tabs-trigger-selected-background-159: transparent;
  background: var(
    --frame-tabs-trigger-selected-background,
    var(--_frame-default-tabs-trigger-selected-background-159)
  );
  /* Foreground of the selected tab trigger. @token --frame-tabs-trigger-selected-color */
  --_frame-default-tabs-trigger-selected-color-160: var(--frame-text);
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-tabs-trigger-selected-color,
    var(--_frame-default-tabs-trigger-selected-color-160)
  );
  /* Color of the selected-tab underline or side indicator. @token --frame-tabs-indicator-color */
  --_frame-default-tabs-indicator-color-161: var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border-bottom-color: var(
    --frame-tabs-indicator-color,
    var(--_frame-default-tabs-indicator-color-161)
  );
}

.frame-tabs .frame-tabs-trigger:focus-visible {
  /* Keyboard focus outline around a tab trigger. @token --frame-tabs-trigger-focus-outline */
  --_frame-default-tabs-trigger-focus-outline-162: 1px solid var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  outline: var(
    --frame-tabs-trigger-focus-outline,
    var(--_frame-default-tabs-trigger-focus-outline-162)
  );
  /* Offset between the tab trigger and its keyboard focus outline. @token --frame-tabs-trigger-outline-offset */
  --_frame-default-tabs-trigger-outline-offset-163: -2px;
  outline-offset: var(
    --frame-tabs-trigger-outline-offset,
    var(--_frame-default-tabs-trigger-outline-offset-163)
  );
}

.frame-tabs > .frame-tabs-content {
  /* Internal spacing of the selected tab content. @token --frame-tabs-content-padding */
  --_frame-default-tabs-content-padding-164: 16px 0;
  padding: var(
    --frame-tabs-content-padding,
    var(--_frame-default-tabs-content-padding-164)
  );
}

.frame-tabs[data-orientation='vertical'] > .frame-tabs-list {
  border-bottom: 0;
  /* Baseline border along the tab trigger list. @token --frame-tabs-list-border */
  --_frame-default-tabs-list-border-150: 1px solid var(--frame-line);
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-inline-end: var(
    --frame-tabs-list-border,
    var(--_frame-default-tabs-list-border-150)
  );
  overflow-x: visible;
}

.frame-tabs[data-orientation='vertical'] .frame-tabs-trigger {
  border-bottom: 0;
  /* Thickness of the selected-tab underline or side indicator. @token --frame-tabs-indicator-width */
  --_frame-default-tabs-indicator-width-153: 2px;
  border-inline-end: var(
      --frame-tabs-indicator-width,
      var(--_frame-default-tabs-indicator-width-153)
    )
    solid transparent;
  /* Internal spacing of a vertical tab trigger. @token --frame-tabs-vertical-trigger-padding */
  --_frame-default-tabs-vertical-trigger-padding-167: 8px 12px;
  padding: var(
    --frame-tabs-vertical-trigger-padding,
    var(--_frame-default-tabs-vertical-trigger-padding-167)
  );
}

.frame-tabs[data-orientation='vertical']
  .frame-tabs-trigger[data-state='active'] {
  /* Color of the selected-tab underline or side indicator. @token --frame-tabs-indicator-color */
  --_frame-default-tabs-indicator-color-161: var(--frame-accent);
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border-inline-end-color: var(
    --frame-tabs-indicator-color,
    var(--_frame-default-tabs-indicator-color-161)
  );
}
</style>
