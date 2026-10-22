import {createApp,defineComponent,h,ref} from 'vue';
import PanelActions from '../../../packages/core/src/components/PanelActions.vue';
import '../../../packages/core/src/style.css';
const Icon=defineComponent({render:()=>h('svg',{viewBox:'0 0 16 16','aria-hidden':true},[h('path',{d:'M2 2h12v12H2z',fill:'currentColor'})])});
const budget=ref(360),runs=ref(0),unavailable=ref(0);
const actions=[{id:'save',label:'Save',icon:Icon,run(){runs.value++;}},{id:'preview',label:'Preview project',run(){runs.value+=10;}},{id:'blocked',label:'Unavailable',disabled:true,run(){unavailable.value++;}}];
createApp({setup:()=>()=>h('div',[
 h('input',{id:'budget',type:'number',value:budget.value,onInput:(e:Event)=>budget.value=Number((e.target as HTMLInputElement).value)}),h('output',{id:'runs'},String(runs.value)),h('output',{id:'unavailable'},String(unavailable.value)),
 h('header',{id:'explicit',class:'panel-header',style:'width:500px;border:1px solid gray'},[h('span',{style:'flex:1'},'View title'),h(PanelActions,{actions,maxWidth:budget.value})]),
 h('header',{id:'automatic',class:'panel-header',style:'width:100px;border:1px solid gray'},[h('span',{style:'flex:1'},'View'),h(PanelActions,{actions})]),
])}).mount('#app');
