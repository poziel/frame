import {expect,test} from 'bun:test';
import {scrubValue,scrubPosition} from '../packages/core/src/components/forms/shared/scrub';
test('scrub values retain configured precision and clamp at both bounds',()=>{
 expect(scrubValue(.1+.2,.1,0,1)).toBe(.3);
 expect(scrubValue(2.75,.25,0,10)).toBe(2.75);
 expect(scrubValue(-2,1,0,10)).toBe(0);
 expect(scrubValue(20,1,0,10)).toBe(10);
 expect(scrubValue(.0000002,1e-7,undefined,undefined)).toBe(.0000002);
});

test('bounded scrubbing maps the pointer to the visible bar at different widths',()=>{
 for(const width of [200,500]) {
  expect(scrubPosition(30+width*.25,30,width,0,100,1)).toBe(25);
  expect(scrubPosition(30+width*.75,30,width,0,100,1)).toBe(75);
  expect(scrubPosition(30+width,30,width,0,100,1)).toBe(100);
 }
 expect(scrubPosition(20,30,200,-10,10,.5)).toBe(-10);
 expect(scrubPosition(999,30,200,-10,10,.5)).toBe(10);
});
