import {expect,test} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
const component={render:()=>null};
test('view visibility stays separate from registration, collapse, and instance state',()=>{
 const frame=createFrame(),other=createFrame();
 other.registerView({id:'a',label:'Other A',component},'primary');
 const remove=frame.registerView({id:'collection',label:'Collection',children:[{id:'a',label:'A',component,collapsed:true},{id:'b',label:'B',component,visible:false}]},'primary');
 expect(frame.isViewVisible('a')).toBe(true);expect(frame.isViewVisible('b')).toBe(false);
 frame.setViewVisible('a',false);expect(frame.getViewChildren('collection').map(view=>view.id)).toEqual(['a','b']);
 expect(frame.viewState.collapsed.a).toBe(true);expect(other.isViewVisible('a')).toBe(true);
 frame.openView('a');expect(frame.isViewVisible('a')).toBe(true);expect(frame.viewState.collapsed.a).toBe(false);
 remove();expect(frame.viewState.hidden.a).toBeUndefined();expect(()=>frame.setViewVisible('a',true)).toThrow();
 frame.dispose();other.dispose();
});
test('moved views keep visibility and join their current collection, with ancestor reveal and disposal',()=>{
 const frame=createFrame();
 frame.registerView({id:'first',label:'First',children:[{id:'child',label:'Child',component}]},'primary');
 frame.registerView({id:'second',label:'Second',children:[]},'secondary');
 frame.setViewVisible('child',false);expect(frame.moveView('child','secondary',undefined,'second')).toBe(true);
 expect(frame.getViewChildren('first')).toHaveLength(0);expect(frame.getViewChildren('second')[0]!.id).toBe('child');expect(frame.isViewVisible('child')).toBe(false);
 frame.setViewVisible('second',false);frame.openView('child');expect(frame.isViewVisible('child')).toBe(true);expect(frame.isViewVisible('second')).toBe(true);
 frame.dispose();expect(Object.keys(frame.viewState.hidden)).toHaveLength(0);
});
