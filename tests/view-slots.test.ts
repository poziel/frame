import {test,expect} from 'bun:test';
import {createFrame} from '../packages/core/src/frame/createFrame';
test('fixed view slots preserve their components, props and independent padding across regions',()=>{
 const frame=createFrame(), top={render:()=>null}, bottom={render:()=>null}, middle={render:()=>null};
 const remove=frame.registerSidePanel({id:'slots',label:'Slots',component:middle,padded:false,top:{component:top,props:{label:'Search'},padded:false},bottom:{component:bottom}});
 for(const region of ['primary','secondary','bottom'] as const){frame.moveView('slots',region);frame.openView('slots');const view=frame.views.value.find(v=>v.id==='slots')!;expect(view.component).toBe(middle);expect(view.top?.component).toBe(top);expect(view.top?.props).toEqual({label:'Search'});expect(view.top?.padded).toBe(false);expect(view.bottom?.component).toBe(bottom);expect(view.bottom?.padded).toBeUndefined();expect(view.padded).toBe(false);}
 remove();expect(frame.views.value.find(v=>v.id==='slots')).toBeUndefined();frame.dispose();
});

