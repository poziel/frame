<script setup lang="ts">
import FrameContextMenu from './FrameContextMenu.vue';
import type {FrameMenuItem} from '../types';
defineProps<{items:readonly FrameMenuItem[];label?:string;itemAlignment?:'left'|'center'|'right'}>();
const emit=defineEmits<{select:[item:FrameMenuItem]}>();
</script>
<template><FrameContextMenu :items="items" :label="label" :item-alignment="itemAlignment" @select="emit('select',$event)"><template #trigger><div class="context-menu-target" tabindex="0"><slot/></div></template></FrameContextMenu></template>
