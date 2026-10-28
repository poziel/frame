<script setup lang="ts">
import {getCurrentInstance} from 'vue';
import {
  TagGroupRoot,
  useForwardPropsEmits,
  TagGroupItem,
  TagGroupItemText,
  TagGroupItemDelete,
} from 'reka-ui';
import type {TagGroupRootProps, TagGroupRootEmits} from 'reka-ui';
import './styles/advanced.scss';

const props = defineProps<
  TagGroupRootProps & {
    /** Tag values, visible labels, and disabled states; removal is offered only when a remove listener is supplied. */
    items: readonly {
      value: string;
      /** Visible text for this tag. */
      label: string;
      /** Prevents user interaction with the control. */
      disabled?: boolean;
    }[];
  }
>();
const emit = defineEmits<TagGroupRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
const instance = getCurrentInstance();
// Reka enables removal only when a host actually owns the list mutation.
function allowsRemoval() {
  return !!instance?.vnode.props?.onRemove;
}
function rootBindings() {
  const result = {...forwarded.value};
  if (!allowsRemoval()) delete result.onRemove;
  return result;
}
</script>
<template>
  <TagGroupRoot v-bind="rootBindings()" class="frame-tag-group"
    ><TagGroupItem
      v-for="item in items"
      :key="String(item.value)"
      :value="item.value"
      :disabled="item.disabled"
      class="frame-tag frame-advanced-focus"
      ><TagGroupItemText>{{ item.label }}</TagGroupItemText
      ><TagGroupItemDelete
        v-if="allowsRemoval()"
        :aria-label="`Remove ${item.label}`"
        class="frame-tag-delete frame-advanced-focus"
        >×</TagGroupItemDelete
      ></TagGroupItem
    ></TagGroupRoot
  >
</template>

<style lang="scss">
.frame-tag-group {
  display: flex;
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
  flex-wrap: wrap;
}

.frame-tag {
  display: inline-flex;
  align-items: center;
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
  padding: 3px 7px;
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(
    --frame-control-radius
  ); /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(
    --frame-text
  ); /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
  background: var(--frame-surface);
}

.frame-tag[data-state='checked'] {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border-color: var(--frame-accent);
}

.frame-tag-delete {
  border: 0;
  background: transparent;
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
  cursor: pointer;
  padding: 0 2px;
}
</style>
