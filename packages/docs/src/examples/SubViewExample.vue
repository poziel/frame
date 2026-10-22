<script setup lang="ts">
import { computed, ref } from 'vue';
import { FrameButton, FrameTextInput, useFrame } from '@frame/core';
const props=defineProps<{title:string;canAdd?:boolean}>();
const frame=useFrame();const note=ref(''),count=ref(0);
const added=computed(()=>frame.getViewParent('demo.scratchpad')==='demo.explorer');
function add(){frame.moveView('demo.scratchpad',frame.viewRegion('demo.explorer')??'primary',undefined,'demo.explorer');}
</script>
<template><div class="subview-example"><p>{{ title }} is a live sub-view. Use Views and more in the collection header to hide or show it.</p><label>{{ title }} note<FrameTextInput v-model="note" :aria-label="title+' note'" placeholder="Type here to test state retention"/></label><FrameButton variant="secondary" @click="count++">{{ title }} count: {{ count }}</FrameButton><FrameButton v-if="canAdd" variant="secondary" :disabled="added" @click="add">{{ added?'Scratchpad added':'Add Scratchpad sub-view' }}</FrameButton><p v-if="canAdd">Scratchpad starts as a bottom-panel view. Adding it moves that same view into this collection and its visibility menu.</p></div></template>
