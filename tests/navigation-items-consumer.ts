import {createFrame,type NavigationItem,type NavigationBarOptions,type PrimaryViewBarOptions,type PanelViewBarOptions} from '@frame/core';
const options:NavigationBarOptions={position:'left',display:'both',size:'compact',collapsed:true,allowAddSeparator:true,hidden:['hidden']};
const viewOptions:PrimaryViewBarOptions={display:'text',hidden:['view']};
const panelOptions:PanelViewBarOptions={visible:true,size:'compact'};
const frame=createFrame({navigationBar:options,primaryViewBar:viewOptions,panelViewBar:panelOptions});
const item:NavigationItem={id:'menu',type:'dropdown',label:'Menu',items:[{id:'link',type:'link',label:'Link',href:'#/home',onNavigate:async()=>{}},{id:'divider',type:'separator'},{id:'action',type:'action',label:'Action',run:async()=>{}}]};
frame.registerNavigationItem(item);frame.navigationBar.setPosition('bottom');frame.navigationBar.moveItem('menu');frame.navigationBar.activate('link');
frame.primaryViewBar.setVisible('view',true);frame.secondaryViewBar.setSize('compact');frame.panelViewBar.setBarVisible(false);
// @ts-expect-error Navigation links require a destination.
frame.registerNavigationItem({id:'bad-link',type:'link',label:'Bad'});
// @ts-expect-error Navigation actions cannot contain view content.
frame.registerNavigationItem({id:'bad-view',type:'action',label:'Bad',component:{render:()=>null},run(){}});
// @ts-expect-error Separators cannot execute.
frame.registerNavigationItem({id:'bad-divider',type:'separator',run(){}});
// @ts-expect-error Dropdowns contain menu items, not associated view components.
frame.registerNavigationItem({id:'bad-menu',type:'dropdown',label:'Bad',component:{render:()=>null}});
frame.navigationBar.setCollapsed(true);
const removeDivider=frame.primaryViewBar.registerSeparator({id:'divider',before:'view',allowRemove:true});
frame.primaryViewBar.moveSeparator('divider');removeDivider();
frame.dispose();
