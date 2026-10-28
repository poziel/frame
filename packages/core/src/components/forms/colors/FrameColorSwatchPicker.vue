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
import '../shared/advanced.css';

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
        class="frame-swatch-item"
        ><ColorSwatchPickerItemSwatch
          class="frame-color-swatch"
        /><ColorSwatchPickerItemIndicator class="frame-swatch-indicator"
          >✓</ColorSwatchPickerItemIndicator
        ></ColorSwatchPickerItem
      ></ColorSwatchPickerRoot
    ></span
  >
</template>
