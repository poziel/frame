// playwright-cli -s=chat-playground run-code --filename tests/ai-chat-activity-groups-browser.cjs
async page => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = []; page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://localhost:1420/#/playground/ai-chat'); await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  const work = page.getByRole('main', { name: 'AI chat playground', exact: true });
  const chat = page.getByRole('region', { name: 'AI chat', exact: true });
  const thought = chat.locator('.frame-chat-current-thought');
  const groups = chat.locator('.frame-chat-activity-group');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).fill('Test grouped work');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await work.getByRole('textbox', { name: 'Thought text' }).fill('First idea');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  await work.getByRole('textbox', { name: 'Thought text' }).fill('A more useful idea');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  check(await thought.count() === 1 && (await thought.textContent()).trim() === 'A more useful idea', 'Set thought must update one line');
  for (const label of ['Command A', 'Command B']) {
    await work.getByRole('textbox', { name: 'Activity label', exact: true }).fill(label);
    await work.getByRole('button', { name: 'Start activity', exact: true }).click();
  }
  check(await thought.count() === 0, 'Activity start must clear the current thought');
  check(await groups.count() === 1 && await groups.first().locator('.frame-chat-activity').count() === 2, 'Consecutive activities must share a group');
  await work.getByRole('textbox', { name: 'Response text' }).fill('The first checks are running. I will inspect another file.');
  await work.getByRole('button', { name: 'Send text', exact: true }).click();
  await work.getByRole('textbox', { name: 'Activity label', exact: true }).fill('Command C');
  await work.getByRole('button', { name: 'Start activity', exact: true }).click();
  check(await groups.count() === 2, 'Commentary must start a new visual group');
  const order = await chat.locator('.frame-chat-work-events').evaluate(element => Array.from(element.children).map(child => child.className));
  check(order[0].includes('activity-group') && order[1].includes('commentary') && order[2].includes('activity-group'), 'Commentary must stay between groups');
  await work.getByRole('combobox', { name: 'Active activity', exact: true }).click();
  await page.getByRole('option', { name: 'Command A', exact: true }).click();
  await work.getByRole('textbox', { name: 'Activity output', exact: true }).fill('Command A kept running across the commentary boundary.');
  await work.getByRole('button', { name: 'Update activity', exact: true }).click();
  await groups.first().locator('.frame-chat-activity summary').first().click();
  check((await groups.first().getByRole('region', { name: 'Activity output', exact: true }).textContent()).includes('kept running'), 'Earlier groups must keep receiving output');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  check(await chat.locator('.frame-chat-work-events').evaluate(element => element.lastElementChild.classList.contains('frame-chat-current-thought')), 'Current thought must stay at the bottom');
  await work.getByRole('button', { name: 'Update activity', exact: true }).evaluate(button => button.click());
  check(await thought.count() === 1 && await groups.count() === 2, 'Output updates must not create groups or clear a new thought');
  await work.getByRole('button', { name: 'Clear thought', exact: true }).click();
  check(await thought.count() === 0, 'Clear thought must remove the line');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  await work.getByRole('combobox', { name: 'Text type', exact: true }).click();
  await page.getByRole('option', { name: 'Final answer', exact: true }).click();
  await work.getByRole('textbox', { name: 'Response text' }).fill('The grouped work is complete.');
  await work.getByRole('button', { name: 'Send text', exact: true }).click();
  await work.getByRole('button', { name: 'End turn', exact: true }).click();
  check(!(await chat.locator('.frame-chat-work').evaluate(element => element.open)), 'Successful completion must keep work collapsed');
  check(await chat.locator('.frame-chat-answer').isVisible() && await thought.count() === 0, 'Final answer must remain visible without stale thought');
  await chat.locator('.frame-chat-work-summary').click();
  check(await groups.count() === 2 && await thought.count() === 0, 'Reopened history must retain groups without archived thought blocks');
  if (errors.length) throw new Error(errors.join('\n'));
  await chat.screenshot({ path: '.ai-workspace/playwright/ai-chat-activity-groups.png' });
  return 'Activity grouping, commentary boundaries, concurrent output, single changing bottom thought, clear and completed collapse passed.';
}
