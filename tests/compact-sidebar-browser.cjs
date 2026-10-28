// CSS cascade regression: include FrameShell's sidebar stylesheet and real edge classes.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');
const {compile} = createRequire(
  path.resolve(__dirname, '../packages/core/package.json')
)('sass');

function css(file) {
  return compile(file).css;
}

(async () => {
  const browser = await chromium.launch({channel: 'chrome'});
  try {
    const page = await browser.newPage();
    await page.setContent(
      '<div class="workbench"><div class="workbench-body layout-grid"><div class="navigation-container shell-sidebar"><nav class="view-bar"></nav><section class="side-panel"></section></div></div></div>'
    );
    const root = path.resolve(__dirname, '../packages/core/src');
    for (const file of [
      'styles/index.scss',
      'components/framework/styles/view-bars.scss',
      'components/framework/styles/bar-items.scss',
      'components/framework/styles/shell-sidebars.scss',
    ]) {
      await page.addStyleTag({content: css(path.join(root, file))});
    }
    let checks = 0;
    for (const density of ['default', 'compact'])
      for (const region of ['primary', 'secondary'])
        for (const side of ['left', 'right'])
          for (const position of ['default', 'top', 'bottom', 'hidden'])
            for (const expanded of [true, false]) {
              await page.evaluate(
                ({density, region, side, position, expanded}) => {
                  document.querySelector('.workbench').className =
                    `workbench ${density}`;
                  document.querySelector('.layout-grid').className =
                    `workbench-body layout-grid primary-${side}`;
                  const shell = document.querySelector('.shell-sidebar');
                  shell.dataset.sidebarSide = side;
                  shell.className = `navigation-container shell-sidebar ${region}-region`;
                  if (expanded) shell.classList.add('expanded');
                  if (position === 'hidden')
                    shell.classList.add('without-rail');
                  else if (position !== 'default')
                    shell.classList.add(
                      'sidebar-horizontal',
                      `view-bar-${position}`
                    );
                },
                {density, region, side, position, expanded}
              );
              for (const selector of ['.view-bar', '.side-panel']) {
                if (selector === '.view-bar' && position === 'hidden') continue;
                const radii = await page.locator(selector).evaluate((el) => {
                  const s = getComputedStyle(el);
                  return [
                    s.borderTopLeftRadius,
                    s.borderTopRightRadius,
                    s.borderBottomLeftRadius,
                    s.borderBottomRightRadius,
                  ];
                });
                assert.equal(
                  radii.every((r) => r === '0px'),
                  density === 'compact',
                  JSON.stringify({
                    density,
                    region,
                    side,
                    position,
                    expanded,
                    selector,
                    radii,
                  })
                );
              }
              checks++;
            }
    console.log(
      `${checks} sidebar density/placement/expansion combinations passed`
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
