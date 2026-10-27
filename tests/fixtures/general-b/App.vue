<script setup lang="ts">
import {ref} from 'vue';
import FrameTabs from '../../../packages/core/src/components/navigation/FrameTabs.vue';
import FrameStepper from '../../../packages/core/src/components/navigation/FrameStepper.vue';
import FrameToolbar from '../../../packages/core/src/components/actions/FrameToolbar.vue';
import FrameTree from '../../../packages/core/src/components/data-display/FrameTree.vue';
import FrameSplitter from '../../../packages/core/src/components/layout/FrameSplitter.vue';
import FrameNavigationMenu from '../../../packages/core/src/components/navigation/FrameNavigationMenu.vue';
import FrameMenubar from '../../../packages/core/src/components/navigation/FrameMenubar.vue';
import '../../../packages/core/src/themes/generated/default.css';
const tab=ref('one'),step=ref(1),action=ref(''),selected=ref(),expanded=ref<string[]>([]),layout=ref<number[]>([]),menu=ref('');
const tree=ref([{id:'source',label:'Source',children:[{id:'index',label:'index.ts'},{id:'app',label:'app.ts'}]},{id:'readme',label:'README.md'}]);
</script>
<template><main style="padding:30px;max-width:800px">
<FrameTabs v-model="tab" label="Editor tabs" :items="[{value:'one',label:'One',content:'First content'},{value:'disabled',label:'Disabled',disabled:true},{value:'two',label:'Two',content:'Second content'}]"/><output id="tab">{{tab}}</output><button @click="tab='one'">Reset tab externally</button>
<FrameStepper v-model="step" label="Setup" :linear="false" :items="[{step:1,label:'Details'},{step:2,label:'Review'},{step:3,label:'Publish',disabled:true}]"/><output id="step">{{step}}</output>
<FrameToolbar label="Actions" :items="[{id:'save',label:'Save',icon:'save'},{id:'locked',label:'Locked',disabled:true},{id:'close',label:'Close'}]" @action="action=$event.id"/><output id="action">{{action}}</output>
<FrameTree v-model="selected" v-model:expanded="expanded" label="Project files" :items="tree"/><output id="selected">{{selected?.id}}</output><output id="expanded">{{expanded.join(',')}}</output><button @click="tree=[tree[1]!,tree[0]! ]">Reorder tree</button>
<FrameSplitter label="Workspace split" direction="horizontal" :panels="[{id:'explorer',label:'Explorer',defaultSize:35,minSize:20},{id:'editor',label:'Editor',defaultSize:65,minSize:20}]" @layout="layout=$event"/><output id="layout">{{layout.join(',')}}</output>
<FrameNavigationMenu label="Site" :disable-hover-trigger="true" :items="[{value:'guides',label:'Guides',children:[{value:'start',label:'Getting started',href:'#start'}]},{value:'about',label:'About',href:'#about'}]"/>
<FrameMenubar v-model="menu" label="Document menus" :items="[{value:'file',label:'File',items:[{id:'new',label:'New file',shortcut:'Ctrl+N'},{id:'unavailable',label:'Unavailable',disabled:true}]}]" @action="action=$event.id"/>
</main></template>
