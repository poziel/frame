<script setup lang="ts">
import { computed } from 'vue';
import { TreeRoot, TreeItem, useForwardPropsEmits } from 'reka-ui';
import type { TreeRootProps, TreeRootEmits } from 'reka-ui';
import type { FrameTreeItem } from '../general-types';
import FrameIcon from './FrameIcon.vue';
import '../general-b.css';
const props=defineProps<Omit<TreeRootProps<FrameTreeItem, FrameTreeItem, boolean>, 'getKey'> & { getKey?: (item:FrameTreeItem)=>string; label?:string }>();
const emit=defineEmits<TreeRootEmits<FrameTreeItem,boolean>>();
const root=computed(()=>{const {label,...rest}=props;return {...rest,getKey:props.getKey ?? ((item:FrameTreeItem)=>item.id)};});
const forwarded=useForwardPropsEmits(root,emit);
</script>
<template><TreeRoot v-bind="forwarded" :get-key="root.getKey" class="frame-tree" :aria-label="label" v-slot="state"><slot v-bind="state"><TreeItem v-for="item in state.flattenItems" :key="item._id" v-bind="item.bind" :disabled="item.value.disabled" class="frame-tree-item" :style="{paddingInlineStart:`${(item.level-1)*18+8}px`}" v-slot="itemState"><slot name="item" :item="item.value" v-bind="itemState"><FrameIcon v-if="item.hasChildren" :name="itemState.isExpanded?'chevron-down':'chevron-right'"/><span v-else class="frame-tree-indent"/><FrameIcon v-if="item.value.icon" :name="item.value.icon"/><span>{{item.value.label}}</span></slot></TreeItem></slot></TreeRoot></template>
