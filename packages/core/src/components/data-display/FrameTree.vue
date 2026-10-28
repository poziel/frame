<script setup lang="ts">
import {computed} from 'vue';
import {TreeRoot, TreeItem, useForwardPropsEmits} from 'reka-ui';
import type {TreeRootProps, TreeRootEmits} from 'reka-ui';
import type {FrameTreeItem} from './treeTypes';
import FrameIcon from './FrameIcon.vue';
import '../navigation/styles/navigation.scss';

const props = defineProps<
  Omit<TreeRootProps<FrameTreeItem, FrameTreeItem, boolean>, 'getKey'> & {
    /** Stable identity of one tree item; defaults to its id. */
    getKey?: (item: FrameTreeItem) => string;
    /** Accessible name of the tree. */
    label?: string;
  }
>();
const emit = defineEmits<{
  /** Requests the selected tree item or items after selection changes. */
  'update:modelValue': TreeRootEmits<
    FrameTreeItem,
    boolean
  >['update:modelValue'];
  /** Requests the keys of expanded tree items after an expansion change. */
  'update:expanded': TreeRootEmits<FrameTreeItem, boolean>['update:expanded'];
}>();
const root = computed(() => {
  const {label, ...rest} = props;
  return {...rest, getKey: props.getKey ?? ((item: FrameTreeItem) => item.id)};
});
const forwarded = useForwardPropsEmits(root, emit);

/** Scope forwarded unchanged from the typed tree root. */
type TreeRootSlot = Parameters<
  NonNullable<
    NonNullable<
      Parameters<typeof TreeRoot<FrameTreeItem, FrameTreeItem, boolean>>[1]
    >['slots']['default']
  >
>[0];

/** State and operations forwarded unchanged from the typed tree item. */
type TreeItemSlot = Parameters<
  NonNullable<
    NonNullable<
      Parameters<typeof TreeItem<FrameTreeItem>>[1]
    >['slots']['default']
  >
>[0];

defineSlots<{
  /** Replaces the built-in flattened tree composition, with current selection and expansion state. */
  default?(props: TreeRootSlot): unknown;
  /** Replaces one row body while preserving its tree-item selection and expansion handlers. */
  item?(props: TreeItemSlot & {item: FrameTreeItem}): unknown;
}>();
</script>
<template>
  <TreeRoot
    v-bind="forwarded"
    :get-key="root.getKey"
    class="frame-tree frame-navigation-text"
    :aria-label="label"
    v-slot="state"
    ><slot v-bind="state"
      ><TreeItem
        v-for="item in state.flattenItems"
        :key="item._id"
        v-bind="item.bind"
        :disabled="item.value.disabled"
        class="frame-tree-item frame-navigation-focus"
        :style="{paddingInlineStart: `${(item.level - 1) * 18 + 8}px`}"
        v-slot="itemState"
        ><slot name="item" :item="item.value" v-bind="itemState"
          ><FrameIcon
            v-if="item.hasChildren"
            :name="itemState.isExpanded ? 'chevron-down' : 'chevron-right'"
          /><span v-else class="frame-tree-indent" /><FrameIcon
            v-if="item.value.icon"
            :name="item.value.icon"
          /><span>{{ item.value.label }}</span></slot
        ></TreeItem
      ></slot
    ></TreeRoot
  >
</template>

<style lang="scss">
.frame-tree {
  padding: 4px;
  margin: 0;
  list-style: none;
}
.frame-tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 4px 8px;
  /* Corner radius for .frame-tree-item. @token --frame-control-radius */
  --_frame-default-control-radius-99f2371f33: var(--frame-radius-medium);
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-control-radius,
    var(--_frame-default-control-radius-99f2371f33)
  );
  cursor: default;
}
.frame-tree-indent {
  width: 16px;
  flex-shrink: 0;
}
</style>
