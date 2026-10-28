<script setup lang="ts">
import FrameTextField from './FrameTextField.vue';
import {computed, ref} from 'vue';
import {
  AutocompleteRoot,
  AutocompleteAnchor,
  AutocompleteInput,
  AutocompleteContent,
  AutocompletePortal,
  AutocompleteItem,
  AutocompleteEmpty,
  useForwardPropsEmits,
} from 'reka-ui';
import type {AutocompleteRootProps, AutocompleteRootEmits} from 'reka-ui';
import {useOverlayBoundary} from '../overlays/overlays';
import './styles/advanced.scss';

const props = defineProps<
  AutocompleteRootProps & {
    /** Text suggestions filtered against the current input value. */
    options: readonly string[];
    /** Accessible name of the autocomplete input. */
    label: string;
    /** Hint displayed while the editable value is empty. */
    placeholder?: string;
  }
>();
const emit = defineEmits<AutocompleteRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const anchor = ref<HTMLElement>();
const {target, bounds} = useOverlayBoundary(() => anchor.value);
const filtered = computed(() =>
  props.options.filter((value) =>
    value
      .toLocaleLowerCase()
      .includes((props.modelValue ?? '').toLocaleLowerCase())
  )
);
const limits = computed(() => ({
  maxHeight: String(Math.min(260, bounds.value.height - 16)) + 'px',
  maxWidth: String(Math.max(0, bounds.value.width - 16)) + 'px',
}));
const collisionBoundary = computed(() =>
  typeof target.value === 'string' ? undefined : target.value
);
</script>
<template>
  <AutocompleteRoot v-bind="forwarded" class="frame-autocomplete"
    ><AutocompleteAnchor as-child
      ><div ref="anchor"
        ><AutocompleteInput as-child
          ><FrameTextField
            :aria-label="label"
            :placeholder="placeholder"
            class="frame-autocomplete-input frame-input-surface frame-input-focus-within" /></AutocompleteInput></div></AutocompleteAnchor
    ><AutocompletePortal :to="target"
      ><AutocompleteContent
        position="popper"
        :collision-boundary="collisionBoundary"
        :collision-padding="8"
        :style="limits"
        :side-offset="4"
        class="frame-advanced-popup frame-overlay-surface"
        ><AutocompleteItem
          v-for="option in filtered"
          :key="option"
          :value="option"
          class="frame-advanced-option"
          >{{ option }}</AutocompleteItem
        ><AutocompleteEmpty class="frame-field-description"
          >No matching suggestions</AutocompleteEmpty
        ></AutocompleteContent
      ></AutocompletePortal
    ></AutocompleteRoot
  >
</template>

<style lang="scss">
.frame-autocomplete-input {
  width: min(100%, 340px);
}

.frame-advanced-option {
  padding: 6px 10px;
  cursor: default;
  outline: none;
  /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
}

.frame-advanced-option[data-highlighted] {
  /* Neutral hover and highlight fill for ordinary menu rows. @token --frame-menu-hover @context */
  background: var(--frame-menu-hover);
}
</style>
