// playwright-cli -s=chat-playground run-code --filename tests/ai-chat-turn-browser.cjs
async page => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://localhost:1420/@fs/D:/Dev/1-codes/frame/tests/fixtures/chat-rich/index.html');
  const prompt = page.getByRole('textbox', { name: 'Message', exact: true });
  await prompt.fill('Build an icon'); await prompt.press('Enter');
  const assistant = page.locator('.frame-chat-message.assistant').first();
  const work = assistant.locator('.frame-chat-work');
  check(await work.evaluate(element => element.tagName === 'P'), 'Empty work must show a plain duration without a false disclosure');
  check(await assistant.evaluate(element => element.firstElementChild.classList.contains('frame-chat-work')), 'Working duration must precede the turn content');
  await page.evaluate(() => {
    const writer = window.richChatFixture.writer;
    writer.thinking('Compare palettes.'); writer.thinking('Choose autumn colors.');
  });
  check((await work.locator('.frame-chat-current-thought').textContent()).trim() === 'Choose autumn colors.', 'Only the latest thought should appear');
  await page.evaluate(() => {
    const writer = window.richChatFixture.writer;
    writer.commentary('I am checking the export.');
    writer.message('An intermediate observation.', { phase: 'intermediate' });
    const activity = writer.activity({ label: 'Export icon', text: 'Writing output.', output: 'Saved icon.png' });
    writer.finishActivity(activity);
    writer.message('Your icon is ready.');
    writer.artifact({ name: 'export-notes.txt', kind: 'file', url: 'blob:export-notes' });
  });
  check(await work.locator('.frame-chat-current-thought').count() === 0, 'A later event should clear the transient thought');
  check(await work.locator('.frame-chat-intermediate').count() === 1, 'Intermediate message must be in work history');
  check(await work.locator('.frame-chat-answer, .frame-chat-artifact').count() === 0, 'Final outputs must be outside work history');
  await work.locator('.frame-chat-activity-group-summary').click();
  await work.locator('.frame-chat-activity summary').click();
  await work.getByLabel('Activity output source', { exact: true }).focus();
  await page.evaluate(() => window.richChatFixture.writer.complete());
  check(!(await work.evaluate(element => element.open)), 'Successful completion must collapse work automatically');
  check((await work.locator('.frame-chat-work-summary').textContent()).includes('Worked for'), 'Completed summary must say Worked for');
  check(await work.locator('.frame-chat-work-summary').evaluate(element => document.activeElement === element), 'Completion must restore focus to the disclosure summary');
  check(await assistant.locator('.frame-chat-answer').isVisible(), 'Final answer must remain visible');
  check(await assistant.getByRole('button', { name: 'Download export-notes.txt' }).isVisible(), 'Delivered documents must remain visible');
  check(await work.locator('.frame-chat-current-thought').count() === 0, 'Thoughts must be cleared after completion');
  await work.locator('.frame-chat-work-summary').press('Space');
  check(await work.evaluate(element => element.open), 'Completed work must reopen with the keyboard');
  await work.locator('.frame-chat-work-summary').press('Space');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await assistant.getByRole('button', { name: 'Copy message', exact: true }).click();
  check(await page.evaluate(() => navigator.clipboard.readText()) === 'Your icon is ready.', 'Copy must exclude intermediate messages');
  const duration = await work.locator('.frame-chat-work-summary').textContent();
  await prompt.fill('Next question'); await prompt.press('Enter');
  await page.evaluate(() => { window.richChatFixture.writer.thinking('Checking.'); window.richChatFixture.writer.fail('Export failed.'); });
  const failed = page.locator('.frame-chat-message.assistant').last();
  check(await failed.locator('.frame-chat-work').evaluate(element => element.open), 'Failed work must remain expanded');
  check(await failed.getByRole('alert').isVisible(), 'Failure must remain visible');
  check(await work.locator('.frame-chat-work-summary').textContent() === duration, 'Prior completed duration must remain fixed');
  await prompt.fill('Stop test'); await prompt.press('Enter');
  await page.evaluate(() => window.richChatFixture.chat.stop());
  check(await page.locator('.frame-chat-message.assistant').last().locator('.frame-chat-work').evaluate(element => element.tagName === 'P'), 'Stopped turn with no retained work must not offer an empty disclosure');
  if (errors.length) throw new Error(errors.join('\n'));
  await page.getByRole('region', { name: 'AI chat' }).screenshot({ path: 'output/playwright/ai-chat-work-disclosure.png' });
  return 'Live work header, automatic collapse, visible final answer/documents, compact thoughts, keyboard reopen, focus, copy and failed/stopped turns passed.';
}
