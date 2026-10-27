import {createApp,defineComponent,h,ref} from 'vue';
import {FrameReorderList} from '@frame/core';
createApp(defineComponent({setup(){
 const first=ref(['a','b','c','d']), second=ref(['x','y']), selected=ref<string[]>([]), disabled=ref(false);
 return()=>h('main',[
  h('button',{id:'disable',onClick:()=>disabled.value=!disabled.value},'Toggle disabled'),
  h(FrameReorderList,{label:'First',modelValue:first.value,selected:selected.value,disabled:disabled.value,
   'onUpdate:selected':(ids:string[])=>selected.value=ids,'onUpdate:modelValue':(
     ids:string[]
   )=>first.value=ids},
   {'drag-preview':({ids,count}:any)=>h('strong',{'data-test-preview':''},`Moving ${count}: ${ids.join(',')}`),default:(
     {id,selected,select}:any
   )=>h('button',{style:'display:block;width:240px;height:40px','aria-pressed':selected,onClick:select},id)}),
  h(FrameReorderList,{label:'Second',modelValue:second.value,'onUpdate:modelValue':(
    ids:string[]
  )=>second.value=ids},
   {default:({id,select}:any)=>h('button',{onClick:select},id)}),
  h('output',{id:'order'},first.value.join(',')),h('output',{id:'selected'},selected.value.join(',')),
 ]);
}})).mount('#app');
