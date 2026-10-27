import {expect,test} from 'bun:test';
import {barContextActions} from '../packages/core/src/framework/layout/barContext';
test('shared bar actions follow empty, separator, and item menu ordering',()=>{
 const labels=(target?:{separator?:boolean;label:string;allowRemove?:boolean})=>barContextActions({allowAddSeparator:true,target:target&&{...target,badgeVisible:true,earlier:true,later:true}}).map(item=>item.type==='separator'?'---':item.label);
 expect(labels()).toEqual(['Add Separator','---']);
 expect(labels({separator:true,label:'Divider',allowRemove:true})).toEqual(['Add Separator','Delete Separator','---','Move Earlier','Move Later','---']);
 expect(labels({label:'Home'})).toEqual(['Add Separator','---',"Hide 'Home'",'Hide Badge','Move Earlier','Move Later','---']);
 expect(barContextActions({allowAddSeparator:false,target:{separator:true,label:'Fixed',earlier:false,later:false}}).map(item=>item.id)).not.toContain('delete-separator');
});
