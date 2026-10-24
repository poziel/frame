// Run with: playwright-cli -s=chat-playground run-code --filename tests/ai-chat-playground-browser.cjs
async page => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const expect = locator => ({
    async toBeDisabled() { check(await locator.isDisabled(), `Expected disabled: ${locator}`); },
    async toContainText(text) { check((await locator.textContent()).includes(text), `Expected text ${text}: ${await locator.textContent()}`); },
    async toHaveText(text) { check((await locator.textContent()).trim() === text, `Expected exact text ${text}: ${await locator.textContent()}`); },
    async toHaveAttribute(name, value) { check(await locator.getAttribute(name) === value, `Expected ${name}=${value}`); },
    async toBeVisible() { await locator.waitFor({ state: 'visible' }); },
    async toHaveCount(count) { check(await locator.count() === count, `Expected count ${count}: ${locator}`); },
  });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://localhost:1420/#/playground/ai-chat');
  await page.reload();
  await page.setViewportSize({ width: 1600, height: 1000 });
  const work = page.getByRole('main', { name: 'AI chat playground', exact: true });
  const chat = page.getByRole('region', { name: 'AI chat', exact: true });
  await expect(work.getByRole('button', { name: 'Send text', exact: true })).toBeDisabled();
  await chat.getByRole('textbox', { name: 'Message', exact: true }).fill('Create a pixel icon');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await expect(work.getByRole('region', { name: 'Current request' })).toContainText('Create a pixel icon');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  await work.getByRole('textbox', { name: 'Thought text' }).fill('Comparing two palettes.');
  await work.getByRole('button', { name: 'Set thought', exact: true }).click();
  await expect(chat.locator('.frame-chat-current-thought')).toHaveText('Comparing two palettes.');
  await work.getByRole('button', { name: 'Clear thought', exact: true }).click();
  await expect(chat.locator('.frame-chat-current-thought')).toHaveCount(0);
  await work.getByRole('textbox', { name: 'Response text' }).fill('I am preparing the palette.');
  await work.getByRole('button', { name: 'Send text', exact: true }).click();
  await expect(chat.locator('.frame-chat-commentary')).toHaveText('I am preparing the palette.');
  await work.getByRole('button', { name: 'Start activity', exact: true }).click();
  await work.getByRole('textbox', { name: 'Activity output' }).fill('Loaded palette.png');
  await work.getByRole('button', { name: 'Update activity', exact: true }).click();
  await work.getByRole('button', { name: 'Complete activity', exact: true }).click();
  await chat.locator('.frame-chat-activity-group-summary').click();
  await chat.locator('.frame-chat-activity summary').click();
  await expect(chat.getByRole('region', { name: 'Activity output', exact: true })).toHaveText('Loaded palette.png');
  await work.getByRole('button', { name: 'Request approval', exact: true }).click();
  await work.getByRole('button', { name: 'End turn', exact: true }).click();
  await expect(work.locator('.playground-feedback')).toContainText('pending requests');
  await chat.getByRole('button', { name: 'Allow', exact: true }).click();
  await expect(chat.locator('.frame-chat-event-result')).toHaveText('Allowed');
  await work.getByRole('button', { name: 'Ask questions', exact: true }).click();
  let card = chat.locator('.frame-chat-interaction.pending').last();
  await expect(card.getByRole('button', { name: 'Submit answers' })).toBeDisabled();
  await card.getByRole('radio', { name: 'Write my own answer', exact: true }).click();
  await card.getByRole('textbox', { name: 'Your answer: Which direction should I take?' }).fill('Use an autumn palette');
  await card.getByRole('button', { name: 'Submit answers' }).click();
  await expect(chat.locator('.frame-chat-answers').last()).toContainText('Use an autumn palette');
  await work.getByRole('checkbox', { name: 'Allow multiple selections', exact: true }).click();
  await work.getByRole('button', { name: 'Ask questions', exact: true }).click();
  card = chat.locator('.frame-chat-interaction.pending').last();
  await card.getByRole('checkbox', { name: 'Option A', exact: true }).click();
  await card.getByRole('checkbox', { name: 'Option B', exact: true }).click();
  await card.getByRole('textbox', { name: 'Your answer: Which direction should I take?' }).fill('Also use gold');
  await card.getByRole('button', { name: 'Submit answers' }).click();
  await expect(chat.locator('.frame-chat-answers').last()).toContainText('Option A, Option B, Also use gold');
  await work.getByRole('combobox', { name: 'Text type', exact: true }).click();
  await page.getByRole('option', { name: 'Final answer', exact: true }).click();
  await work.getByRole('textbox', { name: 'Response text' }).fill('Here is your icon.');
  await work.getByRole('button', { name: 'Send text', exact: true }).click();
  await work.getByRole('textbox', { name: 'Response text' }).fill(' Ready to export.');
  await work.getByRole('button', { name: 'Append text', exact: true }).click();
  await expect(chat.locator('.assistant .frame-chat-text')).toHaveText('Here is your icon. Ready to export.');
  await expect(chat.getByRole('button', { name: 'Stop response' })).toBeVisible();
  await work.getByLabel('Add an artifact', { exact: true }).setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5ZkAAAAASUVORK5CYII=', 'base64') });
  await expect(chat.getByRole('img', { name: 'pixel.png', exact: true })).toBeVisible();
  await work.getByLabel('Add an artifact', { exact: true }).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Export notes') });
  await expect(chat.getByRole('button', { name: 'Download notes.txt', exact: true })).toBeVisible();
  await work.getByRole('button', { name: 'End turn', exact: true }).click();
  await expect(chat.locator('.frame-chat-work-summary')).toContainText('Worked for');
  await page.getByRole('button', { name: 'Hide secondary sidebar' }).click();
  await page.getByRole('button', { name: 'AI chat playground', exact: true }).click();
  await expect(chat.locator('.assistant .frame-chat-text')).toHaveText('Here is your icon. Ready to export.');
  await work.getByRole('button', { name: 'Reset session' }).click();
  await chat.getByRole('textbox', { name: 'Message', exact: true }).fill('Stop test');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await work.getByRole('button', { name: 'Request approval', exact: true }).click();
  await work.getByRole('button', { name: 'Ask questions', exact: true }).click();
  await chat.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(chat.locator('.frame-chat-interaction.pending')).toHaveCount(0);
  await expect(work.getByRole('button', { name: 'Send text', exact: true })).toBeDisabled();
  await expect(chat.locator('.frame-chat-work-summary')).toContainText('Stopped');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).fill('Failure test');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await work.getByRole('button', { name: 'Simulate failure', exact: true }).click();
  await expect(chat.getByRole('alert')).toContainText('lost its connection');
  await work.getByRole('button', { name: 'Reset session' }).click();
  await expect(chat.locator('.frame-chat-message')).toHaveCount(0);
  if (errors.length) throw new Error(errors.join('\n'));
  return 'Chat playground: manual events, approvals, custom/multiple answers, artifacts, completion, retention, stop, failure and reset passed.';
}
