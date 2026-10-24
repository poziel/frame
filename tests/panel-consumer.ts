import {createFrame,type PanelOptions,type PanelPosition,type PanelDisplay} from '@frame/core';
const options:PanelOptions={position:'top',alignment:'justify'};
const frame=createFrame({panel:options,panelViewBar:{display:'both',hidden:[],hiddenBadges:[]}});
frame.registerBottomTab({id:'output',label:'Output',component:{render:()=>null},badge:2});
const position:PanelPosition=frame.panel.position.value;
const display:PanelDisplay=frame.panelViewBar.display.value;
frame.panel.setPosition(position);frame.panelViewBar.setDisplay(display);frame.panel.setAlignment('center');
frame.panelViewBar.setVisible('output',false);frame.panelViewBar.setBadgeVisible('output',false);frame.panelViewBar.setBadge('output',3);
const canAlign:boolean=frame.panel.canAlign.value;void canAlign;
frame.openBottomPanel('output');frame.panel.hide();frame.dispose();
// @ts-expect-error Physical docking is limited to four positions.
frame.panel.setPosition('floating');
