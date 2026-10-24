import { createApp, h, ref } from 'vue';
import { createFrame, FrameShell, defineTheme } from '@frame/core';
import '../../../packages/core/src/style.css';
const first=createFrame(), second=createFrame(); const showSecond=ref(false); const calls=ref('');
for (const [index,frame] of [first,second].entries()) {
 const name=index?'second':'first';
 frame.registerCommand({id:'app.find',label:'Find document',shortcut:'Ctrl+K',run(){calls.value=name+':find';}});
 frame.registerCommand({id:'extension.preferences',label:'Extension: Preferences',scope:'frame',shortcut:'Ctrl+Shift+Y',run(){calls.value=name+':preferences';}});
 frame.registerCommand({id:'app.disabled',label:'Disabled choice',enabled:()=>false,run(){calls.value='FAIL';}});
 frame.registerCommand({id:'app.zebra',label:'Zebra',run(){calls.value=name+':zebra';}});
 frame.registerView({id:'secondary',label:'Inspector',component:{render:()=>h('input',{'aria-label':name+' inspector'})}},'secondary'); frame.openView('secondary');
 frame.registerView({id:'explorer',label:'Explorer',children:[{id:'nested-outline',label:'Outline',icon:{render:()=>h('svg',{'data-fixture-icon':'nested',viewBox:'0 0 16 16'})},component:{render:()=>h('p','Nested outline')}}]},'primary');
 frame.registerView({id:'secondary-outline',label:'Outline',icon:{render:()=>h('svg',{'data-fixture-icon':'secondary',viewBox:'0 0 16 16'})},component:{render:()=>h('p','Secondary outline')}},'secondary');
 frame.status.register({id:'fixture.status',kind:'button',label:name+' status',run(){}});
 frame.theme.register(defineTheme({version:1,id:'fixture-light',name:'Fixture light',appearance:'light',tokens:{'--frame-text':'#112233'}}));
}
Object.assign(window,{fixture:{first,second,showSecond,calls}});
createApp({setup:()=>()=>h('div',[
 h('output',{'id':'calls'},calls.value),h(FrameShell,{frame:first,style:'height:600px;min-height:0;'},()=>h('input',{'aria-label':'first content'})),
 showSecond.value&&h(FrameShell,{frame:second,style:'height:600px;min-height:0;'},()=>h('input',{'aria-label':'second content'}))
])}).mount('#app');
