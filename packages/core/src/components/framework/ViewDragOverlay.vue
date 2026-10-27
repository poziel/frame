<script setup lang="ts">
import {computed} from 'vue';
import {useFrame} from '../../framework/useFrame';
import BarDragOverlay from './BarDragOverlay.vue';
const frame=useFrame();
const view=computed(()=>frame.views.value.find(view=>view.id===frame.dragState.id));
</script>
<template><BarDragOverlay :active="frame.dragState.active" :x="frame.dragState.x" :y="frame.dragState.y" :label="view?.label" :icon="view?.icon" :marker="frame.dragState.drop?.marker"/></template>
