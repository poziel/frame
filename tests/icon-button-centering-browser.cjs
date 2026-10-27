const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({ channel: 'chrome' });
 try {
  const page = await browser.newPage();
  const css = fs.readFileSync(path.join(__dirname, '../packages/core/src/style.css'), 'utf8');
  const icon = '<span class="frame-icon-button-icon"><span class="frame-icon" style="width:16px;height:16px"><svg viewBox="0 0 16 16"><rect width="16" height="16"/></svg></span></span>';
  for (const [width,height,padding] of [[26,26,0],[24,28,3],[18,28,4],[28,18,4],[12,12,4]]) {
   await page.setContent(`<style>${css}\n.fixture button.frame-button.frame-icon-button {inline-size:${width}px;block-size:${height}px;min-width:0;min-height:0;box-sizing:border-box;padding:2px;} .fixture button span {padding:1px ${padding}px;}</style><div class="fixture"><button class="frame-button frame-icon-button" style="--frame-icon-button-icon-size:16px">${icon}</button></div>`);
   const boxes = await page.locator('button, svg').evaluateAll(nodes => nodes.map(el => { const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}; }));
   assert(Math.abs(boxes[0].x-boxes[1].x)<0.1, `horizontal centering ${width}x${height}, padding ${padding}: ${JSON.stringify(boxes)}`);
   assert(Math.abs(boxes[0].y-boxes[1].y)<0.1, `vertical centering ${width}x${height}`);
   assert.equal(boxes[1].w,16,'preserve icon size when padding cannot fit');
   assert.equal(boxes[1].h,16);
  }
  console.log('Icon button centering: square, narrow, short, undersized, and padded wrappers passed');
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
