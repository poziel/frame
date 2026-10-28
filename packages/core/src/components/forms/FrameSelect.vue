<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectSeparator,
} from 'reka-ui';
import {isSelectOption} from './shared/select';
import type {SelectItem as ChoiceItem} from './shared/selectItem';
import {useOverlayBoundary} from '../overlays/overlays';
import {encodeChoiceValue, decodeChoiceValue} from './shared/controls';
import FrameIcon from '../data-display/FrameIcon.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import './styles/controls.scss';

defineOptions({inheritAttrs: false});
import FrameControlTooltip from '../overlays/FrameControlTooltip.vue';
import {useControlTooltip, type ControlTooltipProps} from './shared/tooltip';

const props = withDefaults(
  defineProps<
    ControlTooltipProps & {
      /** Controlled selected option value. */
      modelValue: string;
      /** Name of the hidden input included in native form submission. */
      name?: string;
      /** Identifier of the native form associated with the submitted input. */
      form?: string;
      /** Requires a value when the associated form is validated. */
      required?: boolean;
      /** Ordered selectable options and separators rendered by this control. */
      options: readonly ChoiceItem[];
      /** Accessible name of the select trigger. */
      label?: string;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
      /** Option value marked with a visible default badge; does not change selection. */
      defaultValue?: string;
    }
  >(),
  {tooltip: undefined, label: 'Select an option'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{
  /** Requests the new application-owned value after interaction. */
  'update:modelValue': [value: string];
}>();
const viewport = ref<InstanceType<typeof SelectViewport>>();
const popup = computed<HTMLElement | undefined>(
  () => viewport.value?.$el?.parentElement ?? undefined
);
const trigger = ref<InstanceType<typeof SelectTrigger>>(),
  open = ref(false),
  description = ref<string>();
const {target, bounds} = useOverlayBoundary(() => trigger.value?.$el);
const selected = computed(() =>
  props.options.find(
    (option) => isSelectOption(option) && option.value === props.modelValue
  )
);
const descriptions = computed(() =>
  props.options
    .filter(isSelectOption)
    .map((option) => option.description)
    .filter((value): value is string => !!value)
);
const boundary = computed(() =>
  typeof document === 'undefined'
    ? undefined
    : typeof target.value === 'string'
      ? undefined
      : target.value
);
watch(bounds, () => {
  open.value = false;
});
watch(open, (value) => {
  if (value)
    description.value =
      selected.value && isSelectOption(selected.value)
        ? selected.value.description
        : undefined;
});

defineSlots<{
  /** Custom tooltip content for the select trigger. */
  tooltip?(): unknown;
}>();
</script>
<template>
  <FrameControlTooltip
    :tooltip="tooltipText"
    :tooltip-placement="tooltipPlacement"
    ><template #default="{describedby}"
      ><span class="frame-select-anchor"
        ><SelectRoot
          name=""
          :required="required"
          v-model:open="open"
          :model-value="encodeChoiceValue(modelValue)"
          :disabled="disabled"
          @update:model-value="
            emit('update:modelValue', decodeChoiceValue(String($event)))
          "
          ><SelectTrigger
            ref="trigger"
            v-bind="controlAttrs"
            :aria-describedby="describedBy(describedby)"
            class="frame-select frame-input-surface frame-input-focus-visible"
            :aria-label="label"
            ><span>{{
              selected && isSelectOption(selected) ? selected.label : 'Select…'
            }}</span
            ><FrameIcon name="chevron-down" :size="16" /></SelectTrigger
          ><SelectPortal :to="target"
            ><SelectContent
              as-child
              position="popper"
              class="frame-select-popup frame-reka-select-popup frame-select-content frame-overlay-surface frame-overlay-interactive"
              :collision-boundary="boundary"
              :collision-padding="8"
              :style="{
                maxWidth: `${Math.max(0, bounds.width - 16)}px`,
                maxHeight: `min(${Math.max(0, bounds.height - 16)}px, var(--reka-select-content-available-height))`,
              }"
              ><div
                ><SelectViewport ref="viewport" class="frame-select-options"
                  ><template
                    v-for="(option, index) in options"
                    :key="
                      isSelectOption(option)
                        ? option.value
                        : (option.id ?? index)
                    "
                    ><SelectSeparator
                      v-if="!isSelectOption(option)"
                      class="frame-select-separator"
                    /><SelectItem
                      v-else
                      class="frame-reka-select-item"
                      :value="encodeChoiceValue(option.value)"
                      :disabled="option.disabled"
                      :text-value="option.label"
                      @focus="description = option.description"
                      @pointermove="description = option.description"
                      ><SelectItemText>{{ option.label }}</SelectItemText
                      ><small v-if="option.detail">{{ option.detail }}</small
                      ><small
                        v-if="option.value === defaultValue"
                        class="select-default"
                        >default</small
                      ></SelectItem
                    ></template
                  ></SelectViewport
                ><div
                  v-if="descriptions.length"
                  class="frame-select-description"
                  ><span
                    v-for="text in descriptions"
                    :key="text"
                    class="frame-select-description-measure"
                    aria-hidden="true"
                    >{{ text }}</span
                  ><span>{{ description }}</span></div
                ></div
              ></SelectContent
            ><OverlayScrollbars
              v-if="open && popup"
              :root="popup" /></SelectPortal></SelectRoot
        ><input
          v-if="name"
          type="hidden"
          :name="name"
          :form="form"
          :value="modelValue"
          :disabled="disabled" /><input
          v-if="required"
          class="frame-control-validation"
          type="text"
          aria-hidden="true"
          tabindex="-1"
          :value="modelValue"
          :disabled="disabled"
          :form="form"
          required
          @invalid.prevent="trigger?.$el?.focus()" /></span></template
    ><template v-if="$slots.tooltip" #tooltip><slot name="tooltip" /></template
  ></FrameControlTooltip>
</template>

<style lang="scss" scoped>
.frame-select-anchor {
  display: inline-flex;
  min-width: 0;
  width: 100%;
}
.frame-select-anchor > .frame-select {
  width: 100%;
}
</style>

<style lang="scss">
/* FrameSelect shares menu surface defaults and quick-action selection, with local overrides. */
.frame-select-popup.frame-reka-select-popup.frame-select-content {
  width: var(--reka-select-trigger-width);
  min-width: var(--reka-select-trigger-width);
  /* Surface behind the select option list. @token --frame-select-popup-background */
  --_frame-default-select-popup-background-100: var(--frame-menu-background);
  /* Surface behind floating menu containers, following the shared overlay background. @token --frame-menu-background @context */
  background: var(
    --frame-select-popup-background,
    var(--_frame-default-select-popup-background-100)
  ); /* Border around the select popup. @token --frame-select-popup-border */
  --_frame-default-select-popup-border-101: 1px solid var(--frame-menu-border);
  /* Border color around floating menus, independently overridable from control borders. @token --frame-menu-border @context */
  border: var(
    --frame-select-popup-border,
    var(--_frame-default-select-popup-border-101)
  ); /* Fallback for: Corner radius of the select popup. @token --frame-menu-border-radius */
  --_frame-default-menu-border-radius-8fac327441: var(--frame-radius-large);
  /* Corner radius of the select popup. @token --frame-select-popup-border-radius */
  --_frame-default-select-popup-border-radius-102: var(
    --frame-menu-border-radius,
    var(--_frame-default-menu-border-radius-8fac327441)
  );
  /* Large shared corner radius used by panel and menu containers. @token --frame-radius-large @context */
  border-radius: var(
    --frame-select-popup-border-radius,
    var(--_frame-default-select-popup-border-radius-102)
  ); /* Fallback for: Elevation shadow of the select popup. @token --frame-menu-box-shadow */
  --_frame-default-menu-box-shadow-9bbfe7b8d5: 0 6px 22px #0005;
  /* Elevation shadow of the select popup. @token --frame-select-popup-box-shadow */
  --_frame-default-select-popup-box-shadow-103: var(
    --frame-menu-box-shadow,
    var(--_frame-default-menu-box-shadow-9bbfe7b8d5)
  );
  box-shadow: var(
    --frame-select-popup-box-shadow,
    var(--_frame-default-select-popup-box-shadow-103)
  ); /* Backdrop treatment behind the select popup. @token --frame-select-popup-backdrop-filter */
  --_frame-default-select-popup-backdrop-filter-104: blur(18px) saturate(110%);
  backdrop-filter: var(
    --frame-select-popup-backdrop-filter,
    var(--_frame-default-select-popup-backdrop-filter-104)
  );
}

.frame-select-content .frame-select-options {
  /* Space between children for .frame-select-content .frame-select-options. @token --frame-spacing-small */
  --_frame-default-spacing-small-3e5e0f3c4b: 4px;
  /* Fallback for: Inset around the list of select options. @token --frame-menu-padding */
  --_frame-default-menu-padding-abdc7e3fde: var(
    --frame-spacing-small,
    var(--_frame-default-spacing-small-3e5e0f3c4b)
  );
  /* Inset around the list of select options. @token --frame-select-options-padding */
  --_frame-default-select-options-padding-105: var(
    --frame-menu-padding,
    var(--_frame-default-menu-padding-abdc7e3fde)
  );
  padding: var(
    --frame-select-options-padding,
    var(--_frame-default-select-options-padding-105)
  );
  box-sizing: border-box;
}

.frame-select-content .frame-select-options .frame-reka-select-item {
  /* Fallback for: Internal spacing of each select option row. @token --frame-menu-row-button-padding */
  --_frame-default-menu-row-button-padding-19043f90c7: 3px 6px;
  /* Internal spacing of each select option row. @token --frame-select-item-padding */
  --_frame-default-select-item-padding-106: var(
    --frame-menu-row-button-padding,
    var(--_frame-default-menu-row-button-padding-19043f90c7)
  );
  padding: var(
    --frame-select-item-padding,
    var(--_frame-default-select-item-padding-106)
  ); /* Fallback for: Minimum height of a select option row. @token --frame-menu-row-button-min-height */
  --_frame-default-menu-row-button-min-height-6ac256a59a: 25px;
  /* Minimum height of a select option row. @token --frame-select-item-min-height */
  --_frame-default-select-item-min-height-107: var(
    --frame-menu-row-button-min-height,
    var(--_frame-default-menu-row-button-min-height-6ac256a59a)
  );
  min-height: var(
    --frame-select-item-min-height,
    var(--_frame-default-select-item-min-height-107)
  );
  border: 1px solid transparent;
  /* Fallback for: Corner radius of a select option row. @token --frame-menu-row-button-border-radius */
  --_frame-default-menu-row-button-border-radius-37f3ed5642: var(
    --frame-radius-medium
  );
  /* Corner radius of a select option row. @token --frame-select-item-radius */
  --_frame-default-select-item-radius-108: var(
    --frame-menu-row-button-border-radius,
    var(--_frame-default-menu-row-button-border-radius-37f3ed5642)
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-select-item-radius,
    var(--_frame-default-select-item-radius-108)
  ); /* Fallback for: Text size in a select option row. @token --frame-menu-row-button-font-size */
  --_frame-default-menu-row-button-font-size-b48ad4dfcb: 12px;
  /* Text size in a select option row. @token --frame-select-item-font-size */
  --_frame-default-select-item-font-size-109: var(
    --frame-menu-row-button-font-size,
    var(--_frame-default-menu-row-button-font-size-b48ad4dfcb)
  );
  font-size: var(
    --frame-select-item-font-size,
    var(--_frame-default-select-item-font-size-109)
  );
}

.frame-select-content
  .frame-select-options
  .frame-reka-select-item[data-highlighted]:not([data-disabled]) {
  /* Fallback for: Surface of an enabled highlighted select option. @token --frame-quick-selection */
  --_frame-default-quick-selection-dec6ef6beb: var(--frame-accent);
  /* Surface of an enabled highlighted select option. @token --frame-select-item-highlight-background */
  --_frame-default-select-item-highlight-background-110: var(
    --frame-quick-selection,
    var(--_frame-default-quick-selection-dec6ef6beb)
  );
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(
    --frame-select-item-highlight-background,
    var(--_frame-default-select-item-highlight-background-110)
  ); /* Foreground of an enabled highlighted select option. @token --frame-select-item-highlight-color */
  --_frame-default-select-item-highlight-color-111: var(
    --frame-accent-foreground
  );
  /* Readable text and icon foreground on accent-filled surfaces. @token --frame-accent-foreground @context */
  color: var(
    --frame-select-item-highlight-color,
    var(--_frame-default-select-item-highlight-color-111)
  );
  outline: none;
}

.frame-select-content .frame-reka-select-item[data-highlighted] small {
  color: inherit;
}

.frame-select-content .frame-select-description {
  display: grid;
  /* Border color around floating menus, independently overridable from control borders. @token --frame-menu-border @context */
  border-color: var(--frame-menu-border);
}

.frame-select-content .frame-select-description > span {
  grid-area: 1 / 1;
  overflow-wrap: anywhere;
}

.frame-select-description-measure {
  visibility: hidden;
  pointer-events: none;
}

@media (prefers-reduced-transparency: reduce) {
  .frame-select-popup.frame-reka-select-popup.frame-select-content {
    backdrop-filter: none;
    /* Opaque select popup surface when reduced transparency is requested. @token --frame-select-popup-solid-background */
    --_frame-default-select-popup-solid-background-112: var(--frame-surface);
    /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
    background: var(
      --frame-select-popup-solid-background,
      var(--_frame-default-select-popup-solid-background-112)
    );
  }
}
</style>

<style lang="scss">
button.frame-select {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  /* Space between children for button.frame-select. @token --frame-button-frame-select-gap */
  --_frame-default-button-frame-select-gap-f4f91b7d94: 8px;
  gap: var(
    --frame-button-frame-select-gap,
    var(--_frame-default-button-frame-select-gap-f4f91b7d94)
  ); /* Width for button.frame-select. @token --frame-button-frame-select-width */
  --_frame-default-button-frame-select-width-f4a301a93d: min(100%, 340px);
  width: var(
    --frame-button-frame-select-width,
    var(--_frame-default-button-frame-select-width-f4a301a93d)
  ); /* Minimum height for button.frame-select. @token --frame-button-frame-select-min-height */
  --_frame-default-button-frame-select-min-height-3b993d3ea1: 28px;
  min-height: var(
    --frame-button-frame-select-min-height,
    var(--_frame-default-button-frame-select-min-height-3b993d3ea1)
  ); /* Internal spacing for button.frame-select. @token --frame-button-frame-select-padding */
  --_frame-default-button-frame-select-padding-c142c02374: 5px 8px;
  padding: var(
    --frame-button-frame-select-padding,
    var(--_frame-default-button-frame-select-padding-c142c02374)
  ); /* Foreground for button.frame-select. @token --frame-button-frame-select-color */
  --_frame-default-button-frame-select-color-d758c44049: var(
    --frame-control-text
  );
  /* Foreground for text and icons on resting control surfaces. @token --frame-control-text @context */
  color: var(
    --frame-button-frame-select-color,
    var(--_frame-default-button-frame-select-color-d758c44049)
  ); /* Border for button.frame-select. @token --frame-button-frame-select-border */
  --_frame-default-button-frame-select-border-7f80b6fa87: 1px solid
    var(--frame-control-border);
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: var(
    --frame-button-frame-select-border,
    var(--_frame-default-button-frame-select-border-7f80b6fa87)
  ); /* Corner radius for button.frame-select. @token --frame-button-frame-select-border-radius */
  --_frame-default-button-frame-select-border-radius-91ee6986c8: var(
    --frame-input-radius
  );
  /* Shared corner radius for text fields, text areas, selects, and composed input surfaces. @token --frame-input-radius @context */
  border-radius: var(
    --frame-button-frame-select-border-radius,
    var(--_frame-default-button-frame-select-border-radius-91ee6986c8)
  ); /* Background for button.frame-select. @token --frame-button-frame-select-background */
  --_frame-default-button-frame-select-background-aaf5e5d9d9: var(
    --frame-control-background
  );
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-button-frame-select-background,
    var(--_frame-default-button-frame-select-background-aaf5e5d9d9)
  );
  text-align: left;
  font: inherit;
}
.frame-select > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.frame-select:disabled {
  /* Opacity for .frame-select:disabled. @token --frame-select-disabled-opacity */
  --_frame-default-select-disabled-opacity-2aaf2bd361: 0.45;
  opacity: var(
    --frame-select-disabled-opacity,
    var(--_frame-default-select-disabled-opacity-2aaf2bd361)
  );
}
.frame-select-options .select-default {
  margin-left: auto;
}
.frame-select-description {
  /* Border for .frame-select-description. @token --frame-select-border-color */
  --_frame-default-select-border-color-e7308eff8a: #454545;
  /* Top border for .frame-select-description. @token --frame-select-description-border-top */
  --_frame-default-select-description-border-top-de8a52d62e: 1px solid
    var(
      --frame-select-border-color,
      var(--_frame-default-select-border-color-e7308eff8a)
    );
  border-top: var(
    --frame-select-description-border-top,
    var(--_frame-default-select-description-border-top-de8a52d62e)
  ); /* Outer spacing for .frame-select-description. @token --frame-select-description-margin */
  --_frame-default-select-description-margin-51a4f5f47f: 0;
  margin: var(
    --frame-select-description-margin,
    var(--_frame-default-select-description-margin-51a4f5f47f)
  ); /* Internal spacing for .frame-select-description. @token --frame-select-description-padding */
  --_frame-default-select-description-padding-76a6b7a947: 7px 8px;
  padding: var(
    --frame-select-description-padding,
    var(--_frame-default-select-description-padding-76a6b7a947)
  ); /* Text line height for .frame-select-description. @token --frame-select-description-line-height */
  --_frame-default-select-description-line-height-a5a7789ead: 1.5;
  line-height: var(
    --frame-select-description-line-height,
    var(--_frame-default-select-description-line-height-a5a7789ead)
  );
  flex: 0 0 auto;
}
</style>
