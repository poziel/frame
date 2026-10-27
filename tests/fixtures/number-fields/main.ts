import { createApp, defineComponent, h, ref } from 'vue';
import { FrameNumberField, FrameTextField, FrameTextArea, FrameSelect, FrameDateField, CalendarDate, FrameFieldGroup, FrameEditable, FrameAutocomplete, FrameCombobox, FramePinField, FrameTagField, FrameColorField, FrameSlider, FrameCheckbox } from '@frame/core';
import '../../../packages/core/src/style.css';
createApp(defineComponent({setup(){const value=ref(2),text=ref('Draft'),choice=ref('one'),pin=ref<string[]>([]),tags=ref<string[]>([]),color=ref('#0078d4');return ()=>h('main',{style:'padding:30px;display:grid;gap:18px;background:#202020;--frame-accent:#ff5d57'},[
 ...(['buttons','none','stacked'] as const).flatMap(controls=>(['default','compact'] as const).map(size=>h('div',{'data-example':controls+'-'+size},[h(FrameNumberField,{modelValue:value.value,min:0,max:3,step:.5,label:controls+' '+size,controls,size,'onUpdate:modelValue':(
   n:number
 )=>value.value=n})]))),
 h(FrameNumberField,{modelValue:2,label:'Disabled',disabled:true,controls:'stacked'}),h('output',{id:'value'},String(value.value)),h(FrameTextField,{'aria-label':'Reference text',modelValue:'Text'}),h(FrameTextArea,{'aria-label':'Reference area',modelValue:'Text'}),h(FrameSelect,{label:'Reference select',modelValue:'one',options:[{value:'one',label:'One'}]}),h(FrameDateField,{label:'Reference date',modelValue:new CalendarDate(2026,10,24)}),
 h(FrameFieldGroup,{'aria-label':'Price group'},{prefix:()=>h('span','$'),default:()=>h(FrameTextField,{'aria-label':'Price',modelValue:text.value,'onUpdate:modelValue':(
   v:string|number
 )=>text.value=String(v)}),suffix:()=>h('span','USD')}),
 h(FrameEditable,{label:'Editable name',modelValue:text.value,'onUpdate:modelValue':(
   v:string
 )=>text.value=v}),
 h(FrameAutocomplete,{label:'Autocomplete name',options:['Draft','Ready'],modelValue:text.value,'onUpdate:modelValue':(
   v:string
 )=>text.value=v}),
 h(FrameCombobox,{label:'Search choice',modelValue:choice.value,options:[{value:'one',label:'One'},{value:'two',label:'Two'}],'onUpdate:modelValue':(
   v:string
 )=>choice.value=v}),
 h(FramePinField,{label:'Code',length:4,modelValue:pin.value,'onUpdate:modelValue':(
   v:string[]
 )=>pin.value=v}),
 h(FrameTagField,{label:'Tags',modelValue:tags.value,'onUpdate:modelValue':(
   v:string[]
 )=>tags.value=v}),
 h(FrameColorField,{'aria-label':'Color text',modelValue:color.value,'onUpdate:modelValue':(
   v:string
 )=>color.value=v}),
 h(FrameSlider,{'aria-label':'Level',modelValue:value.value,min:0,max:3,step:.5,'onUpdate:modelValue':(
   v:number
 )=>value.value=v}),
 h(FrameCheckbox,{label:'Enabled',modelValue:false}),
 h('output',{id:'composite-values'},JSON.stringify({text:text.value,choice:choice.value,pin:pin.value,tags:tags.value,color:color.value})),
]);}})).mount('#app');
