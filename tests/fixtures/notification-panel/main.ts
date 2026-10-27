import {createApp,h} from 'vue';
import {createFrame,FrameShell} from '@frame/core';
import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/core/modules/notifications';
import '../../../packages/core/src/style.css';

const frame=createFrame();const history=createNotificationHistory(frame);
createApp({setup:()=>()=>h('div',[
 h('button',{id:'notify',onClick:()=>frame.notify({title:'Build complete',source:'Build service',details:'Your project is ready.',duration:0})},'Notify'),
 h('button',{id:'move-bottom',onClick:()=>history.setPosition('bottom-right')},'Move to bottom right'),
 h(FrameShell,{frame,titleText:'Notifications fixture',style:'width:1000px;height:650px;min-height:0'}, {
  overlays:()=>h(NotificationPanel,{frame,history}),
  'status-leading-actions':()=>history.state.indicatorPosition==='bottom-left'?h(NotificationIndicator,{history}):null,
  'status-actions':()=>history.state.indicatorPosition==='bottom-right'?h(NotificationIndicator,{history}):null,
 }),
])}).mount('#app');
