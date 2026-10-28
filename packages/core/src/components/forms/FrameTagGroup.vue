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
    items: readonly {value: string; label: string; disabled?: boolean}[];
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
  gap: var(--frame-gap);
  flex-wrap: wrap;
}

.frame-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--frame-gap);
  padding: 3px 7px;
  border: 1px solid var(--frame-line);
  border-radius: var(--frame-control-radius);
  color: var(--frame-text);
  background: var(--frame-surface);
}

.frame-tag[data-state='checked'] {
  border-color: var(--frame-accent);
}

.frame-tag-delete {
  border: 0;
  background: transparent;
  color: var(--frame-muted);
  cursor: pointer;
  padding: 0 2px;
}
</style>
