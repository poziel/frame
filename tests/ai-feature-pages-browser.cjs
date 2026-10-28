async page => {
  const check = (value, message) => { if (!value) throw new Error(message); };
  await page.setViewportSize({ width: 1500, height: 1050 });
  for (const id of ['ai-prompt','ai-conversation','ai-history','ai-chat']) {
    await page.goto(`http://localhost:1420/#/features/${id}`);
    await page.getByRole('region', { name: 'Usage guide', exact: true }).waitFor();
    check(await page.locator('.documentation-feature').count() >= 2, `${id} has insufficient usage examples`);
    if (id !== 'ai-chat') {
      check(await page.locator('.documentation-feature .docs-ai-feature-room').first().evaluate(el=>el.getBoundingClientRect().width >= 600), `${id} preview collapsed to an unusable width`);
    }
    await page.getByRole('tab', { name: 'API', exact: true }).click();
    check(await page.locator('.documentation-structure').count() > 0, `${id} has no generated structure`);
    await page.getByRole('tab', { name: 'Theming', exact: true }).click();
    check((await page.getByRole('tabpanel').innerText()).includes('--frame-'), `${id} has no generated tokens`);
    await page.getByRole('tab', { name: 'Interactive demo', exact: true }).click();
    await page.getByRole('region', { name: `${id} interactive demo`, exact: true }).waitFor();
    check(await page.locator('.workbench').count() === 1, `${id} adds a nested shell`);
    await page.getByRole('tab', { name: 'API', exact: true }).click();
    check(await page.getByRole('separator', { name: 'Resize secondary sidebar', exact: true }).count() === 0, `${id} leaked its sidebar`);
  }
  await page.goto('http://localhost:1420/#/features/ai-view');
  await page.getByRole('heading', { name: 'Assistant', exact: true, level: 1 }).waitFor();
  check(page.url().endsWith('#/features/ai-chat'), 'Legacy view page should redirect to the complete assistant page');
  await page.goto('http://localhost:1420/#/features/ai-conversation');
  await page.getByRole('heading', { name: 'Display one conversation', exact: true }).waitFor();
  await page.screenshot({path:'.ai-workspace/playwright/ai-conversation-docs-refined.png'});
  return 'All four AI pages share generated API/structure/theming docs and independent demos without leaked sidebars.';
}
