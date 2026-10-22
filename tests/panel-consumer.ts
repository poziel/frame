import {createFrame,type PanelOptions,type PanelPosition,type PanelDisplay} from '@frame/core';
const options:PanelOptions={position:'top',alignment:'justify',display:'both',hidden:[],hiddenBadges:[]};
const frame=createFrame({panel:options});
frame.registerBottomTab({id:'output',label:'Output',component:{render:()=>null},badge:2});
const position:PanelPosition=frame.panel.position.value;
const display:PanelDisplay=frame.panel.display.value;
frame.panel.setPosition(position);frame.panel.setDisplay(display);frame.panel.setAlignment('center');
frame.panel.setVisible('output',false);frame.panel.setBadgeVisible('output',false);frame.panel.setBadge('output',3);
const canAlign:boolean=frame.panel.canAlign.value;void canAlign;
frame.openBottomPanel('output');frame.panel.hide();frame.dispose();
// @ts-expect-error Physical docking is limited to four positions.
frame.panel.setPosition('floating');
