<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { TagGroupRoot, useForwardPropsEmits, TagGroupItem, TagGroupItemText, TagGroupItemDelete } from 'reka-ui';
import type { TagGroupRootProps, TagGroupRootEmits } from 'reka-ui';
import '../forms/advanced.css';
const props=defineProps<TagGroupRootProps & { items: readonly { value: string; label: string; disabled?: boolean }[] }>();
const emit=defineEmits<TagGroupRootEmits>();
const forwarded=useForwardPropsEmits(props,emit);
const instance=getCurrentInstance();
// Reka enables removal only when a host actually owns the list mutation.
function allowsRemoval(){return !!instance?.vnode.props?.onRemove;}
function rootBindings(){const result={...forwarded.value};if(!allowsRemoval())delete result.onRemove;return result;}
</script>
<template><TagGroupRoot v-bind="rootBindings()" class="frame-tag-group"><TagGroupItem v-for="item in items" :key="String(item.value)" :value="item.value" :disabled="item.disabled" class="frame-tag"><TagGroupItemText>{{item.label}}</TagGroupItemText><TagGroupItemDelete v-if="allowsRemoval()" :aria-label="`Remove ${item.label}`" class="frame-tag-delete">×</TagGroupItemDelete></TagGroupItem></TagGroupRoot></template>
