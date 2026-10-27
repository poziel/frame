<script setup lang="ts">
import type {PanelDefinition} from '../../framework/views/shellViewContainer';
defineProps<{ view: PanelDefinition }>();
</script>
<template><div class="frame-view-layout">
<div v-if="view.top" class="frame-view-top" :class="{ 'frame-view-padded': view.top.padded !== false }"><component :is="view.top.component" v-bind="view.top.props"/></div>
<div class="frame-view-middle" :class="{ 'frame-view-padded': view.padded !== false && view.children === undefined, 'frame-view-group': view.children !== undefined }"><slot/></div>
<div v-if="view.bottom" class="frame-view-bottom" :class="{ 'frame-view-padded': view.bottom.padded !== false }"><component :is="view.bottom.component" v-bind="view.bottom.props"/></div>
</div></template>
