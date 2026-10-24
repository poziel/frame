import {createFrame,type SecondaryViewBarDisplay,type SecondaryViewBarSize,type SecondaryViewBarOptions} from '@frame/core';
const options:SecondaryViewBarOptions={display:'icons',size:'compact',hidden:['chat'],hiddenBadges:['chat']};
const frame=createFrame({secondaryViewBar:options});
frame.registerSecondaryTab({id:'chat',label:'Chat',badge:3,component:{render:()=>null}});
const display:SecondaryViewBarDisplay=frame.secondaryViewBar.display.value;
const size:SecondaryViewBarSize=frame.secondaryViewBar.size.value;
frame.secondaryViewBar.setDisplay(display);frame.secondaryViewBar.setSize(size);
frame.secondaryViewBar.setVisible('chat',false);frame.secondaryViewBar.setBadgeVisible('chat',false);frame.secondaryViewBar.setBadge('chat',0);frame.secondaryViewBar.moveSide('left');
frame.openSecondaryPanel('chat');frame.dispose();
// @ts-expect-error Display is a supported view-bar mode, not arbitrary CSS.
frame.secondaryViewBar.setDisplay('flex');
