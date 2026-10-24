import {createApp,h} from 'vue';
import {createFrame,FrameShell} from '../../../packages/core/src/frame/index';
const frame=createFrame({workspace:{allowPaneCreation:false,welcome:{commands:['example.open','example.new']}},primaryViewBar:{position:'top',size:'compact',display:'icons',allowSizeChange:false,allowDisplayChange:false},toolbar:{customize:true,primary:true,bottom:false,secondary:false,layoutControls:true,commandCenter:false}});
frame.commands.register({id:'example.open',feature:'example',label:'Open document',shortcut:'Ctrl+O',run:()=>{(window as any).welcomeOpened=true;}});
frame.commands.register({id:'example.new',feature:'example',label:'New document',run:()=>{}});
frame.registerSidePanel({id:'example',label:'Example',component:{render:()=>h('input',{'aria-label':'Draft'})}});frame.openSidePanel('example');
const menuItems=['File','View','Inspect'].map(label=>({id:label,label,children:[{id:label+'.action',label:label+' action'}]}));
createApp({render:()=>h(FrameShell,{frame,menuItems,showSearch:false,titleText:'Responsive title'})}).mount('#app');
