import { createApp, defineComponent, h } from 'vue';
import { createFrame, FrameShell } from '../../../packages/core/src/index';
const frame = createFrame();
const content = defineComponent(() => () => h('div', Array.from({length:80}, (
  _,
  i
) => h('p', 'Frame '+i))));
const top = defineComponent(() => () => h('input', {'aria-label':'Top draft'}));
const bottom = defineComponent(() => () => h('button', 'Fixed bottom'));
frame.registerView({id:'slots',label:'Slots',component:content,top:{component:top,padded:false},bottom:{component:bottom}}, 'primary');
frame.openSidePanel('slots');
Object.assign(window,{fixtureFrame:frame});
createApp({render:()=>h(FrameShell,{frame})}).mount('#app');

