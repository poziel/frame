import {createFrame,type ToolbarActionFeature} from '@frame/core';
import { createNotificationHistory, type NotificationIndicatorPosition, type NotificationHistoryOptions } from '@frame/core/modules/notifications';
const frame=createFrame();
const position:NotificationIndicatorPosition='top-right';
const options:NotificationHistoryOptions={indicatorPosition:position,indicatorEnabled:true,indicatorPinned:false};
const history=createNotificationHistory(frame,options);
history.setPosition('bottom-left');history.setEnabled(true);
frame.toolbar.setActionEnabled(history.toolbarActionId,false);
frame.toolbar.setActionVisible(history.toolbarActionId,true);
const feature:ToolbarActionFeature={label:'Optional feature',enabled:true,setEnabled(
  _enabled:boolean
){}};
frame.registerToolbarAction({id:'optional',label:'Open feature',feature,showInToolbar:()=>true,run(){}});
history.dispose();frame.dispose();
// @ts-expect-error Only the three supported corner placements are accepted.
history.setPosition('center');
