import {createApp,defineComponent,h,ref} from 'vue';
import {FrameEditable} from '@frame/core';
import '../../../packages/core/src/style.css';
createApp(defineComponent({setup(){const show=ref(true);Object.assign(window,{hideAuto:()=>show.value=false});const auto=ref('Auto name'),manual=ref('Manual name'),commits=ref(0),cancelled=ref(0),forms=ref(0);
return()=>h('form',{onSubmit:(e:Event)=>{e.preventDefault();forms.value++;}},[
 show.value?h(FrameEditable,{modelValue:auto.value,label:'Auto rename',activationMode:'dblclick','onUpdate:modelValue':(
   value:string
 )=>auto.value=value,onSubmit:()=>commits.value++,onCancel:()=>cancelled.value++}):null,
 h(FrameEditable,{modelValue:manual.value,label:'Manual rename',activationMode:'dblclick',submitMode:'enter','onUpdate:modelValue':(
   value:string
 )=>manual.value=value}),
 h('button',{id:'outside',type:'button'},'Outside'),h('output',{id:'auto'},auto.value),h('output',{id:'manual'},manual.value),h('output',{id:'commits'},String(commits.value)),h('output',{id:'cancelled'},String(cancelled.value)),h('output',{id:'forms'},String(forms.value))]);}})).mount('#app');
