import {createApp,h} from 'vue';
import {createFrame,FrameShell} from '@frame/core';
import AccentPalette from '../../../packages/docs/src/examples/AccentPalette.vue';
import '../../../packages/core/src/style.css';
const frame=createFrame();
frame.registerView({id:'palette',label:'Accent palette',component:AccentPalette},'primary');
frame.openSidePanel('palette');frame.layout.primaryWidth=320;
createApp({render:()=>h(FrameShell,{frame,style:'height:800px'})}).mount('#app');
