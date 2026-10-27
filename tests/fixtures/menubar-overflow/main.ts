import {createApp,defineComponent,h,ref} from 'vue';
import {FrameMenubar} from '../../../packages/core/src/index';
import '../../../packages/core/src/style.css';
const menus=['File','View','Inspect','Tools'].map(label=>({id:label,label,children:[{id:label+'.item',label:label+' action'}]}));
createApp(defineComponent({setup(){const count=ref(3);return()=>h('div',[h('button',{onClick:()=>count.value=count.value===3?4:3},'Toggle fourth menu'),h(FrameMenubar,{menus:menus.slice(0,count.value),maxVisible:3})]);}})).mount('#app');
