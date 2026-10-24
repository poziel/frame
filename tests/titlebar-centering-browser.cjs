const { chromium } = require(process.env.FRAME_PLAYWRIGHT || 'playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.FRAME_BROWSER ? {executablePath:process.env.FRAME_BROWSER} : {})});
  const page = await browser.newPage();
  const near = (a,b) => { if(Math.abs(a-b)>1) throw new Error(`${a} != ${b}`); };
  try {
    await page.goto((process.env.FRAME_TEST_URL || 'http://localhost:1448') + '/@fs/' + path.resolve('tests/fixtures/shell-toolbar/index.html').replaceAll('\\','/'));
    await page.locator('.titlebar-center').waitFor();
    for(const width of [1880,1280,900,700,500]) {
      await page.setViewportSize({width,height:760});
      for(const command of [true,false]) for(const navigation of [true,false]) {
        await page.evaluate(({command,navigation}) => {
          window.toolbarFixture.toolbar.setVisible('commandCenter',command);
          window.toolbarFixture.layout.navigationVisible=navigation;
        },{command,navigation});
        await page.waitForTimeout(100);
        const header=await page.locator('.titlebar').boundingBox();
        const center=await page.locator('.titlebar-center').boundingBox();
        near(center.x+center.width/2,header.x+header.width/2);
        if(center.width>600.5) throw new Error(`Center too wide: ${center.width}`);
        if(width>=1280) near(center.width,600);
        const arrows=page.locator('.titlebar-navigation');
        if(await arrows.count()!==Number(navigation)) throw new Error('Navigation visibility');
        if(navigation) {
          const parent=await arrows.evaluate(el=>el.parentElement.className);
          if(parent!==(command?'titlebar-center':'titlebar-leading')) throw new Error(parent);
          const nav=await arrows.boundingBox();
          if(command) {
            const bar=await page.locator('.workspace-command').boundingBox();
            near(nav.x,center.x);
            near(bar.x+bar.width,center.x+center.width);
            if(bar.x<nav.x+nav.width) throw new Error('Arrows overlap command center');
          } else {
            const menus=await page.getByRole('menubar').boundingBox();
            if(nav.x<menus.x+menus.width) throw new Error('Arrows overlap menus');
          }
        }
        if(command&&!navigation) near((await page.locator('.workspace-command').boundingBox()).width,center.width);
        if(!command) {
          const title=await page.locator('.titlebar-text').boundingBox();
          near(title.x+title.width/2,header.x+header.width/2);
        }
      }
    }
    await page.setViewportSize({width:1280,height:760});
    await page.evaluate(() => {
      window.toolbarFixture.toolbar.setVisible('commandCenter',true);
      document.documentElement.style.setProperty('--frame-palette-width','480px');
    });
    await page.waitForTimeout(100);
    near((await page.locator('.titlebar-center').boundingBox()).width,480);
    await page.getByRole('button',{name:'Open quick actions',exact:true}).click();
    near((await page.locator('.palette').boundingBox()).width,480);
    console.log('Title bar: bounded width, application centering, arrow placement and visibility passed at five viewport widths.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
