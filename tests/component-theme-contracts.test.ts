import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
test('documented theme variables are consumed by production component CSS',()=>{
 for(const doc of Object.values(componentDocumentation))for(const token of doc.tokens){
  expect(token.source.startsWith('packages/core/')||token.source.startsWith('packages/features/')).toBe(true);
  expect(readFileSync(token.source,'utf8')).toContain('var('+token.name);
  expect(token.value.length).toBeGreaterThan(0);
 }
});
test('FrameIcon does not inherit FrameIconButton-only variables through a class prefix',()=>{
 expect(componentDocumentation.icons!.tokens.some(token=>token.selector==='.frame-icon-button'||token.selector.includes(':not(.frame-icon)'))).toBe(false);
});
