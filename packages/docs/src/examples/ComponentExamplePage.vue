<script setup lang="ts">
import { showWorkspaceContent } from './workspaceContent';
import { computed,nextTick,provide,ref,watch } from 'vue';
import {useFrame} from '@frame/core';
import IconLibraryPage from './IconLibraryPage.vue';
import {componentExamples} from './componentCatalog';
import {componentDocumentation} from './documentation/registry';
import type {DocumentationTab} from './documentation/types';
import {documentationTabKey} from './documentation/context';
import ComponentTabs from './documentation/ComponentTabs.vue';
import FeatureSection from './documentation/FeatureSection.vue';
import FeatureOverview from './documentation/FeatureOverview.vue';
import ApiTables from './documentation/ApiTables.vue';
import ThemeReference from './documentation/ThemeReference.vue';
import InteractiveDemo from './documentation/InteractiveDemo.vue';
import UniversalViewerExample from './UniversalViewerExample.vue';
import FileUploadExample from './FileUploadExample.vue';
const props=defineProps<{componentId:string;initialTab?:DocumentationTab}>();
const frame=useFrame();const page=ref<HTMLElement>();const tab=ref<DocumentationTab>(props.initialTab??'features');
provide(documentationTabKey,()=>tab.value);
const example=computed(()=>componentExamples.find(item=>item.id===props.componentId)!);
const documentation=computed(()=>componentDocumentation[props.componentId]!);
watch(()=>props.componentId,async()=>{tab.value=props.initialTab??'features';await nextTick();page.value?.closest('.workspace-pane-content')?.scrollTo({top:0});});
function selectTab(value:DocumentationTab){tab.value=value;}
function openIcons(online:boolean){showWorkspaceContent(frame,{label:online?'Online icons':'Included icons',component:IconLibraryPage,props:{online}});}
defineExpose({get documentationTab(){return tab.value;}});
</script>
<template><article v-if="example&&documentation" ref="page" class="component-showcase documentation-page" :data-documentation-tab="tab"><header><p class="showcase-eyebrow">{{ example.group==='Features'?'FRAME FEATURES':'FRAME COMPONENTS' }}</p><h1>{{ example.title }}</h1><p>{{ documentation.guide?.description??example.description }}</p></header><ComponentTabs :model-value="tab" @update:model-value="selectTab"><template #features><FeatureOverview v-if="documentation.guide" :guide="documentation.guide"/><nav v-if="componentId==='icons'" class="example-type-links" aria-label="Icon libraries"><a href="#/icons/included" @click.prevent="openIcons(false)">See all included icons</a><a href="#/icons/online" @click.prevent="openIcons(true)">Load icons from the website</a></nav><FeatureSection v-for="feature in documentation.features" :key="componentId+feature.id" :documentation="documentation" :feature="feature"/></template><template #api><ApiTables :components="documentation.components"/></template><template #theming><ThemeReference :classes="documentation.classes" :tokens="documentation.tokens"/></template><template #demo><UniversalViewerExample v-if="componentId==='universal-viewer'"/><FileUploadExample v-else-if="componentId === 'file-upload' || componentId === 'file-drop-zone'" :key="componentId" :id="componentId"/><InteractiveDemo v-else :key="componentId" :documentation="documentation"/></template></ComponentTabs></article></template>
