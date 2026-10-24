import { createFrame, type WorkspaceOptions, type WorkspaceTabDefinition, type WorkspaceResult } from '@frame/core';
const workspace: WorkspaceOptions = {maxPanes:4,allowPaneCreation:true,tabs:{allowCreate:true,allowClose:true,allowMove:true,create:async context=>context.signal.aborted?undefined:{id:'new',title:'New tab'},beforeClose:context=>context.tabIds.length>0}};
const frame=createFrame({workspace});
const w=frame.workspace;
w.setPaneMode(w.initialPaneId,'tabs');
const definition:WorkspaceTabDefinition={id:'document',title:'Document',icon:'file',closable:true,movable:true};
const unregister=w.registerTab(w.initialPaneId,definition);
w.configurePaneTabs(w.initialPaneId,{lastTab:'allow-empty',showTitles:false});
const removeListener=w.onDidChange(event=>{const ids:readonly string[]=event.tabIds;void ids;});
const result:WorkspaceResult<string>=w.moveTabToNewPane(definition.id,'right');
if(result.ok){const pane:string=result.value;void pane;}else{const reason:string=result.reason;void reason;}
w.requestTab().then(result=>{if(result.ok)w.closeTabs([result.value]);});
// @ts-expect-error Only known directions are accepted.
w.moveTabToNewPane(definition.id,'diagonal');
// @ts-expect-error Configuration permissions are boolean.
w.configure({tabs:{allowClose:'yes'}});
unregister();removeListener();frame.dispose();
