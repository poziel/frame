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
      modelValue: string;
      name?: string;
      form?: string;
      required?: boolean;
      options: readonly ChoiceItem[];
      label?: string;
      disabled?: boolean;
      defaultValue?: string;
    }
  >(),
  {tooltip: undefined, label: 'Select an option'}
);
const {tooltipText, controlAttrs, describedBy} = useControlTooltip(props);
const emit = defineEmits<{'update:modelValue': [value: string]}>();
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
  background: var(
    --frame-select-popup-background,
    var(--frame-menu-background)
  );
  border: var(--frame-select-popup-border, 1px solid var(--frame-menu-border));
  border-radius: var(
    --frame-select-popup-border-radius,
    var(--frame-menu-border-radius, var(--frame-radius-large))
  );
  box-shadow: var(
    --frame-select-popup-box-shadow,
    var(--frame-menu-box-shadow, 0 6px 22px #0005)
  );
  backdrop-filter: var(
    --frame-select-popup-backdrop-filter,
    blur(18px) saturate(110%)
  );
}

.frame-select-content .frame-select-options {
  padding: var(
    --frame-select-options-padding,
    var(--frame-menu-padding, var(--frame-spacing-small, 4px))
  );
  box-sizing: border-box;
}

.frame-select-content .frame-select-options .frame-reka-select-item {
  padding: var(
    --frame-select-item-padding,
    var(--frame-menu-row-button-padding, 3px 6px)
  );
  min-height: var(
    --frame-select-item-min-height,
    var(--frame-menu-row-button-min-height, 25px)
  );
  border: 1px solid transparent;
  border-radius: var(
    --frame-select-item-radius,
    var(--frame-menu-row-button-border-radius, var(--frame-radius-medium))
  );
  font-size: var(
    --frame-select-item-font-size,
    var(--frame-menu-row-button-font-size, 12px)
  );
}

.frame-select-content
  .frame-select-options
  .frame-reka-select-item[data-highlighted]:not([data-disabled]) {
  background: var(
    --frame-select-item-highlight-background,
    var(--frame-quick-selection, var(--frame-accent))
  );
  color: var(
    --frame-select-item-highlight-color,
    var(--frame-accent-foreground)
  );
  outline: none;
}

.frame-select-content .frame-reka-select-item[data-highlighted] small {
  color: inherit;
}

.frame-select-content .frame-select-description {
  display: grid;
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
    background: var(
      --frame-select-popup-solid-background,
      var(--frame-surface)
    );
  }
}
</style>

<style lang="scss">
button.frame-select {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--frame-button-frame-select-gap, 8px);
  width: var(--frame-button-frame-select-width, min(100%, 340px));
  min-height: var(--frame-button-frame-select-min-height, 28px);
  padding: var(--frame-button-frame-select-padding, 5px 8px);
  color: var(--frame-button-frame-select-color, var(--frame-control-text));
  border: var(
    --frame-button-frame-select-border,
    1px solid var(--frame-control-border)
  );
  border-radius: var(
    --frame-button-frame-select-border-radius,
    var(--frame-input-radius)
  );
  background: var(
    --frame-button-frame-select-background,
    var(--frame-control-background)
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
  opacity: var(--frame-select-disabled-opacity, 0.45);
}
.frame-select-options .select-default {
  margin-left: auto;
}
.frame-select-description {
  border-top: var(
    --frame-select-description-border-top,
    1px solid var(--frame-select-border-color, #454545)
  );
  margin: var(--frame-select-description-margin, 0);
  padding: var(--frame-select-description-padding, 7px 8px);
  line-height: var(--frame-select-description-line-height, 1.5);
  flex: 0 0 auto;
}
</style>
