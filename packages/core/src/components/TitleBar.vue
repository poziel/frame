<script setup lang="ts">
import type { ToolbarControl } from "../frame/toolbar";
import type { FrameMenuItem } from "../types";
import { computed, ref, shallowRef } from "vue";
import { useFrame } from "../frame/createFrame";
import FrameMenu from "./FrameMenu.vue";
import { regionIcon } from "../frame/layoutIcons";
import FrameLogo from "./FrameLogo.vue";
import FrameIcon from "./FrameIcon.vue";
import FrameIconButton from "./FrameIconButton.vue";
import FrameButton from "./FrameButton.vue";
import FrameTooltip from "./FrameTooltip.vue";
import MenuBar from "./MenuBar.vue";
const props = defineProps<{ sidebarVisible: boolean; panelVisible: boolean; native: boolean; maximized: boolean; menuItems: readonly FrameMenuItem[]; titleText: string; showSearch: boolean; menuBarVisible: boolean; zenMode: boolean; primarySide: "left" | "right"; secondaryVisible: boolean }>();
const frame = useFrame();
const menuAnchor=shallowRef<HTMLElement>();
const menuPoint=ref({x:0,y:0});
const menuControl=ref('');
const builtins: {id:ToolbarControl;label:string}[]=[{id:'customize',label:'Customize Layout…'},{id:'primary',label:'Toggle Primary Side Bar'},{id:'bottom',label:'Toggle Panel'},{id:'secondary',label:'Toggle Secondary Side Bar'}];
const eligibleToolbarActions=computed(()=>frame.toolbarActions.filter(item=>item.showInToolbar?.()!==false));
const activeToolbarActions=computed(()=>eligibleToolbarActions.value.filter(item=>item.feature?.enabled!==false));
const overflowAnchor=shallowRef<HTMLElement>();
const overflowCommands:Record<string,string>={customize:'frame.layout.customize',primary:'frame.sidebar.toggle',bottom:'frame.panel.toggle',secondary:'frame.secondary.toggle'};
const overflowMenu=computed<FrameMenuItem[]>(()=>[
 ...builtins.filter(item=>!frame.toolbar.isVisible(item.id)).map(item=>({id:item.id,label:item.label,...(item.id==='customize'?{}:{checked:item.id==='primary'?props.sidebarVisible:item.id==='bottom'?props.panelVisible:props.secondaryVisible,shortcut:item.id==='primary'?'Ctrl+B':item.id==='bottom'?'Ctrl+J':'Ctrl+Alt+B'})})),
 ...activeToolbarActions.value.filter(item=>!item.visible).map(item=>({id:'action:'+item.id,label:item.label,disabled:item.disabled})),
]);
function openOverflow(event:MouseEvent){menuAnchor.value=undefined;overflowAnchor.value=overflowAnchor.value?undefined:event.currentTarget as HTMLElement;}
function chooseOverflow(item:FrameMenuItem){
 if(item.type==='separator'||item.disabled)return;
 if(item.id.startsWith('action:')){const action=frame.toolbarActions.find(action=>action.id===item.id.slice(7));if(action&&!action.disabled&&action.feature?.enabled!==false&&action.showInToolbar?.()!==false)action.run();}
 else if(overflowCommands[item.id])emit('execute',overflowCommands[item.id]!);
}
const targeted=computed(()=>menuControl.value.startsWith('action:')?frame.toolbarActions.find(item=>item.id===menuControl.value.slice(7)):builtins.find(item=>item.id===menuControl.value));
const toolbarMenu=computed<FrameMenuItem[]>(()=>[
 ...(targeted.value?[{id:'hide-target',label:`Hide '${targeted.value.label}'`},{id:'target-divider',type:'separator' as const}]:[]),
 ...builtins.map(item=>({...item,checked:frame.toolbar.isVisible(item.id)})),
 ...activeToolbarActions.value.map(item=>({id:'action:'+item.id,label:item.label,checked:!!item.visible})),
 {id:'chrome-divider',type:'separator'},
 {id:'menuBar',label:'Menu Bar',checked:frame.layout.menuBarVisible},
 {id:'commandCenter',label:'Command Center',checked:props.showSearch && frame.toolbar.isVisible('commandCenter'),disabled:!props.showSearch},
 {id:'layoutControls',label:'Layout Controls',checked:frame.toolbar.isVisible('layoutControls')},
 ...eligibleToolbarActions.value.filter(item=>item.feature).map(item=>({id:'feature:'+item.id,label:item.feature!.label,checked:item.feature!.enabled})),
]);
function chooseToolbar(item:FrameMenuItem){
 if(item.id==='hide-target'){const id=menuControl.value;if(id.startsWith('action:'))frame.toolbar.setActionVisible(id.slice(7),false);else frame.toolbar.setVisible(id as ToolbarControl,false);}
 else if(item.id.startsWith('feature:')){const action=eligibleToolbarActions.value.find(action=>action.id===item.id.slice(8));if(action?.feature)frame.toolbar.setActionEnabled(action.id,!action.feature.enabled);}
 else if(item.id==='menuBar')frame.layout.menuBarVisible=!frame.layout.menuBarVisible;
 else if(item.id.startsWith('action:')){const id=item.id.slice(7);const action=frame.toolbarActions.find(item=>item.id===id);if(action)frame.toolbar.setActionVisible(id,!action.visible);}
 else frame.toolbar.toggle(item.id as ToolbarControl);
}
function openToolbarMenu(event:MouseEvent){
 const element=event.target as HTMLElement;
 if(element.closest('.menu-bar,.window-controls,[role=menubar]'))return;
 event.preventDefault();event.stopPropagation();overflowAnchor.value=undefined;
 const control=element.closest<HTMLElement>('[data-toolbar-control]');
 menuControl.value=control?.dataset.toolbarControl??'';
 menuAnchor.value=control??event.currentTarget as HTMLElement;
 menuPoint.value={x:event.clientX||menuAnchor.value.getBoundingClientRect().left,y:event.clientY||menuAnchor.value.getBoundingClientRect().bottom};
}
const emit = defineEmits<{ commands: []; execute: [id: string] }>();
</script>
<template>
  <header class="titlebar" @contextmenu="openToolbarMenu">
    <div class="titlebar-leading">
      <span v-if="!zenMode" class="app-mark" aria-label="Frame"><FrameLogo/></span>
      <MenuBar v-if="menuBarVisible && !zenMode" :items="menuItems" @execute="emit('execute', $event)" />
    </div>
    <div class="titlebar-drag" data-tauri-drag-region />
    <div class="titlebar-center">
      <nav v-if="frame.features.navigation && frame.layout.navigationVisible" class="titlebar-navigation" aria-label="Navigation history">
        <FrameIconButton class="titlebar-button" label="Back" icon="arrow-left" :icon-size="16" :disabled="!frame.navigation.canGoBack" @click="frame.navigation.back()" />
        <FrameIconButton class="titlebar-button" label="Forward" icon="arrow-right" :icon-size="16" :disabled="!frame.navigation.canGoForward" @click="frame.navigation.forward()" />
      </nav>
      <FrameTooltip v-if="showSearch && frame.toolbar.isVisible('commandCenter')" text="Quick actions" shortcut="Ctrl+P" class="command-tooltip" v-slot="{ describedby }">
        <FrameButton class="workspace-command" aria-label="Open quick actions" :aria-describedby="describedby" @click="emit('commands')">
          <span>{{ titleText }}</span><FrameIcon name="chevron-down" :size="12" />
        </FrameButton>
      </FrameTooltip>
      <div v-if="!showSearch || !frame.toolbar.isVisible('commandCenter')" class="titlebar-text" data-tauri-drag-region>{{ titleText }}</div>
    </div>
    <div class="titlebar-drag" data-tauri-drag-region />
    <div v-if="frame.toolbar.isVisible('layoutControls')" class="titlebar-layout">
      <FrameIconButton v-if="frame.toolbar.isVisible('customize')" data-toolbar-control="customize" class="titlebar-button" label="Customize layout" icon="layout" :icon-size="16" @click="emit('execute', 'frame.layout.customize')" />
      <FrameIconButton v-if="frame.toolbar.isVisible('primary')" data-toolbar-control="primary" class="titlebar-button" label="Toggle primary sidebar" shortcut="Ctrl+B" :icon="regionIcon('primary', sidebarVisible, primarySide)" :icon-size="16" :aria-expanded="sidebarVisible" aria-controls="side-panel" @click="emit('execute', 'frame.sidebar.toggle')" />
      <FrameIconButton v-if="frame.toolbar.isVisible('bottom')" data-toolbar-control="bottom" class="titlebar-button" label="Toggle bottom panel" shortcut="Ctrl+J" :icon="regionIcon('panel', panelVisible, primarySide)" :icon-size="16" :aria-expanded="panelVisible" aria-controls="bottom-panel" @click="emit('execute', 'frame.panel.toggle')" />
      <FrameIconButton v-if="frame.toolbar.isVisible('secondary')" data-toolbar-control="secondary" class="titlebar-button" label="Toggle secondary sidebar" shortcut="Ctrl+Alt+B" :icon="regionIcon('secondary', secondaryVisible, primarySide)" :icon-size="16" :aria-expanded="secondaryVisible" @click="emit('execute', 'frame.secondary.toggle')" />
      <FrameIconButton v-for="action in activeToolbarActions.filter(item => item.visible)" :key="action.id" :data-toolbar-control="'action:'+action.id" class="titlebar-button" :label="action.label" :icon="action.icon" :show-label="!action.icon" :icon-size="16" :disabled="action.disabled" @click="action.run" />
      <FrameIconButton v-if="overflowMenu.length" class="titlebar-button" label="More Actions…" icon="ellipsis" :icon-size="16" aria-haspopup="menu" :aria-expanded="!!overflowAnchor" @click="openOverflow" />
    </div>
    <div class="window-controls" aria-label="Window controls">
      <FrameIconButton :disabled="!native" class="window-control" label="Minimize window" @click="emit('execute', 'frame.window.minimize')">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.5h10" stroke="currentColor" /></svg>
      </FrameIconButton>
      <FrameIconButton :disabled="!native" class="window-control" :label="maximized ? 'Restore window' : 'Maximize window'" @click="emit('execute', 'frame.window.maximize')">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path v-if="maximized" d="M3.5 3.5v-2h7v7h-2 M1.5 3.5h7v7h-7z" /><path v-else d="M1.5 1.5h9v9h-9z" /></svg>
      </FrameIconButton>
      <FrameIconButton :disabled="!native" class="window-control window-close" label="Close window" @click="emit('execute', 'frame.window.close')">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m1.5 1.5 9 9m-9 0 9-9" stroke="currentColor" /></svg>
      </FrameIconButton>
    </div>
    <FrameMenu v-if="overflowAnchor" :anchor="overflowAnchor" :items="overflowMenu" label="More Actions" @select="chooseOverflow" @close="overflowAnchor=undefined"/>
    <FrameMenu v-if="menuAnchor" :anchor="menuAnchor" :point="menuPoint" :items="toolbarMenu" label="Title bar actions" @select="chooseToolbar" @close="menuAnchor=undefined"/>
  </header>
</template>