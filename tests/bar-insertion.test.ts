import {expect,test} from 'bun:test';
import {nearestBarGap} from '../packages/core/src/framework/layout/barInsertion';

test('both adjacent item edges resolve to one centered gap, horizontally and vertically',()=>{
 const gaps=[{before:'a',center:0},{before:'b',center:42},{before:undefined,center:84}];
 for(const coordinate of [39,40,42,44,45])expect(nearestBarGap(gaps,coordinate)).toBe(gaps[1]);
 expect(nearestBarGap(gaps,-10)?.before).toBe('a');
 expect(nearestBarGap(gaps,100)?.before).toBeUndefined();
 expect(nearestBarGap([],20)).toBeUndefined();
});
