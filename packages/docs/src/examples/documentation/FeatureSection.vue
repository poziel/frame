<script setup lang="ts">
import {computed,ref} from 'vue';
import {FrameCodeBlock} from '@frame/core';
import ComponentPreview from '../ComponentPreview.vue';
import DemoSurface from './DemoSurface.vue';
import {createDemoState} from './demoState';
import type {ComponentDocumentation,FeatureExample} from './types';
const props=defineProps<{documentation:ComponentDocumentation;feature:FeatureExample}>();
const state=computed(()=>createDemoState(props.documentation.components[0]!,props.feature.values??{}));
const activated=ref(props.documentation.id!=='terminal');

</script>
<template><section class="documentation-feature" :aria-labelledby="documentation.id+'-'+feature.id"><h2 :id="documentation.id+'-'+feature.id">{{ feature.title }}</h2><p>{{ feature.description }}</p><div class="documentation-example"><div class="showcase-preview"><ComponentPreview v-if="!feature.values" :id="documentation.id" :variant="feature.variant"/><template v-else-if="!activated"><p>Activate this example explicitly to allow a terminal session.</p><button type="button" class="frame-button secondary" @click="activated=true">Activate terminal example</button></template><DemoSurface v-else :contract="documentation.components[0]!" :values="state.props" :slot-values="{default:'Example content',first:'First pane',second:'Second pane'}" @update="state.set"/></div><FrameCodeBlock :code="feature.code" language="vue" :line-numbers="true" :label="feature.title+' example'"/></div></section></template>
