// Run with: playwright-cli -s=chat-playground run-code --filename tests/ai-chat-playground-keyboard-browser.cjs
async page => {
  await page.goto('http://localhost:1420/#/playground/ai-chat');
  await page.reload();
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const work = page.getByRole('main', { name: 'AI chat playground', exact: true });
  const chat = page.getByRole('region', { name: 'AI chat', exact: true });
  await page.getByRole('button', { name: 'AI chat playground', exact: true }).click();
  await work.getByRole('button', { name: 'Reset session' }).click();
  await chat.getByRole('textbox', { name: 'Message', exact: true }).fill('Keyboard and narrow layout');
  await chat.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await work.getByRole('button', { name: 'Add question', exact: true }).click();
  await work.getByRole('textbox', { name: 'Question 2 prompt' }).fill('Which size?');
  await work.getByRole('button', { name: 'Ask questions', exact: true }).click();
  let request = chat.locator('.frame-chat-interaction.pending').last();
  const groups = request.getByRole('radiogroup');
  check(await groups.count() === 2, 'Two independently labeled question groups expected');
  await groups.nth(0).getByRole('radio', { name: 'Option A', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  check(await groups.nth(0).getByRole('radio', { name: 'Option B', exact: true }).getAttribute('aria-checked') === 'true', 'Arrow navigation should choose Option B');
  await groups.nth(1).getByRole('radio', { name: 'Write my own answer', exact: true }).focus();
  await page.keyboard.press('Space');
  const custom = request.getByRole('textbox', { name: 'Your answer: Which size?' });
  await custom.fill('24 × 24');
  await work.getByRole('button', { name: 'Send text', exact: true }).evaluate(button => button.click());
  check(await custom.evaluate(element => element === document.activeElement), 'Streamed content should preserve input focus');
  await request.getByRole('button', { name: 'Submit answers' }).focus();
  await page.keyboard.press('Enter');
  check((await chat.locator('.frame-chat-answers').last().textContent()).includes('24 × 24'), 'Keyboard submit should preserve custom answer');
  await work.getByRole('button', { name: 'Request approval', exact: true }).click();
  await chat.getByRole('button', { name: 'Deny', exact: true }).click();
  check((await chat.locator('.frame-chat-event-result').last().textContent()).includes('Denied'), 'Denial must be distinct from cancellation');
  await work.getByRole('button', { name: 'Ask questions', exact: true }).click();
  await chat.getByRole('button', { name: 'Cancel request', exact: true }).click();
  check(await chat.locator('.frame-chat-interaction.pending').count() === 0, 'Cancelled question should be read-only');
  // Navigate away without stopping the pending responder, then reopen the workspace controls.
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('button', { name: 'AI chat playground', exact: true }).click();
  check(await chat.getByRole('button', { name: 'Stop response', exact: true }).isVisible(), 'Reopening must retain active turn');
  await work.getByRole('button', { name: 'End turn', exact: true }).click();
  // Resize the actual Frame sidebar with its keyboard API, rather than overriding layout CSS.
  const sash = page.getByRole('separator', { name: 'Resize secondary sidebar', exact: true });
  for (let i = 0; i < 14; i++) await sash.press('ArrowRight');
  const dimensions = await chat.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
  check(dimensions.width <= 340 && dimensions.scroll <= dimensions.width + 1, `Narrow chat overflow: ${JSON.stringify(dimensions)}`);
  await chat.screenshot({ path: '.ai-workspace/playwright/ai-chat-playground-narrow.png' });
  await page.getByRole('button', { name: 'Hide primary sidebar', exact: true }).click();
  await page.setViewportSize({ width: 1380, height: 1000 });
  await page.screenshot({ path: '.ai-workspace/playwright/ai-chat-playground.png' });
  check(await work.evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'Playground must fit its workspace width');
  return { result: 'Keyboard input, multiple questions, focus retention, denial, cancellation, active-turn retention and narrow layout passed.', dimensions };
}
