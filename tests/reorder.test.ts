import {test,expect} from 'bun:test';
import {reorderItems} from '../packages/core/src/components/forms/shared/reorder';
test('reorder preserves group and unselected order in either direction',()=>{
 expect(reorderItems(['a','b','c','d','e'],['d','b'],'a')).toEqual(['b','d','a','c','e']);
 expect(reorderItems(['a','b','c','d','e'],['a','c'],null)).toEqual(['b','d','e','a','c']);
 expect(reorderItems(['a','b'],['a'],'a')).toEqual(['a','b']);
 expect(reorderItems(['a','b'],['unknown'],null)).toEqual(['a','b']);
});
