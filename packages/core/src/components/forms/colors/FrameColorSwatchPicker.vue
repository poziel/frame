<script setup lang="ts">
import {defineComponent, ref, watch} from 'vue';
import {
  ColorSwatchPickerRoot,
  useForwardPropsEmits,
  ColorSwatchPickerItem,
  ColorSwatchPickerItemSwatch,
  ColorSwatchPickerItemIndicator,
  injectListboxRootContext,
} from 'reka-ui';
import type {
  ColorSwatchPickerRootProps,
  ColorSwatchPickerRootEmits,
} from 'reka-ui';
import '../styles/advanced.scss';

defineOptions({inheritAttrs: false});
const props = defineProps<
  ColorSwatchPickerRootProps & {
    /** Ordered color strings rendered as selectable swatches. */
    colors: readonly string[];
  }
>();
const emit = defineEmits<ColorSwatchPickerRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const element = ref<HTMLElement>(),
  focused = ref(false);
function leave(event: FocusEvent) {
  focused.value =
    event.relatedTarget instanceof Node &&
    !!element.value?.contains(event.relatedTarget);
}
// Reka 2.11 Listbox highlights external model updates. Preserve focus in sibling editors.
const FocusOwnership = defineComponent({
  setup() {
    const context = injectListboxRootContext();
    watch(focused, (value) => (context.focusable.value = value), {
      immediate: true,
      flush: 'sync',
    });
    return () => null;
  },
});
</script>
<template>
  <span
    ref="element"
    style="display: contents"
    @focusin="focused = true"
    @focusout="leave"
    ><ColorSwatchPickerRoot
      v-bind="{...forwarded, ...$attrs}"
      class="frame-swatch-picker"
      :aria-disabled="disabled || undefined"
      ><FocusOwnership /><ColorSwatchPickerItem
        v-for="color in colors"
        :key="color"
        :value="color"
        :aria-label="color"
        class="frame-swatch-item frame-advanced-focus"
        ><ColorSwatchPickerItemSwatch
          class="frame-color-swatch"
        /><ColorSwatchPickerItemIndicator class="frame-swatch-indicator"
          >✓</ColorSwatchPickerItemIndicator
        ></ColorSwatchPickerItem
      ></ColorSwatchPickerRoot
    ></span
  >
</template>

<style lang="scss">
.frame-swatch-picker {
  display: flex;
  flex-wrap: wrap;
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
}

.frame-swatch-item {
  position: relative;
  display: inline-flex;
  padding: 2px;
  border: 1px solid transparent;
  /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
  cursor: pointer;
}

.frame-swatch-item[data-state='checked'] {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border-color: var(--frame-accent);
}

.frame-swatch-indicator {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  text-shadow: 0 1px 3px black;
}
</style>
