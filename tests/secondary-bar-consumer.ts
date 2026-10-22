import {createFrame,type SecondaryBarDisplay,type SecondaryBarSize,type SecondaryBarOptions} from '@frame/core';
const options:SecondaryBarOptions={display:'icons',size:'compact',hidden:['chat'],hiddenBadges:['chat']};
const frame=createFrame({secondaryBar:options});
frame.registerSecondaryTab({id:'chat',label:'Chat',badge:3,component:{render:()=>null}});
const display:SecondaryBarDisplay=frame.secondaryBar.display.value;
const size:SecondaryBarSize=frame.secondaryBar.size.value;
frame.secondaryBar.setDisplay(display);frame.secondaryBar.setSize(size);
frame.secondaryBar.setVisible('chat',false);frame.secondaryBar.setBadgeVisible('chat',false);frame.secondaryBar.setBadge('chat',0);frame.secondaryBar.moveSide('left');
frame.openSecondaryPanel('chat');frame.dispose();
// @ts-expect-error Display is a supported view-bar mode, not arbitrary CSS.
frame.secondaryBar.setDisplay('flex');
