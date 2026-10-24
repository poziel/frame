// Standalone host API regression: playwright-cli -s=chat-playground run-code --filename tests/ai-chat-rich-browser.cjs
async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://localhost:1420/@fs/D:/Dev/1-codes/frame/tests/fixtures/chat-rich/index.html');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Host-supplied IDs and assets');
  await page.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await page.evaluate(() => {
    const writer = window.richChatFixture.writer;
    writer.askQuestions({ questions: [
      { id: 'constructor', text: 'Single choice', choices: [{ id: '__proto__', label: 'A' }], allowCustom: true },
      { id: 'toString', text: 'Multiple choice', choices: [{ id: 'hasOwnProperty', label: 'B' }], multiple: true, allowCustom: true },
      { id: '__proto__', text: 'Custom only', choices: [], allowCustom: true },
    ] });
    writer.artifact({ kind: 'file', name: 'Unsafe script', url: 'javascript:alert(1)' });
    writer.artifact({ kind: 'image', name: 'Raw local path', url: 'file:///C:/private.png' });
  });
  await page.getByRole('radio', { name: 'A', exact: true }).click();
  await page.getByRole('checkbox', { name: 'B', exact: true }).click();
  await page.getByRole('radiogroup', { name: 'Custom only' }).getByRole('radio', { name: 'Write my own answer' }).click();
  await page.getByRole('textbox', { name: 'Your answer: Custom only' }).fill('A custom result');
  await page.getByRole('button', { name: 'Submit answers' }).click();
  const text = await page.locator('.frame-chat-answers').textContent();
  if (!text.includes('Single choiceA') || !text.includes('Multiple choiceB') || !text.includes('A custom result')) throw new Error(`Incorrect answers: ${text}`);
  for (const name of ['Unsafe script', 'Raw local path']) {
    if (!(await page.getByRole('button', { name: `Open ${name}`, exact: true }).isDisabled()) || !(await page.getByRole('button', { name: `Download ${name}`, exact: true }).isDisabled())) throw new Error('Unsafe artifact URLs must not enable file actions');
  }
  const dimensions = await page.getByRole('region', { name: 'AI chat' }).evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
  if (dimensions.scroll > dimensions.width + 1) throw new Error(`Standalone chat overflow: ${JSON.stringify(dimensions)}`);
  await page.evaluate(() => window.richChatFixture.chat.stop());
  if (errors.length) throw new Error(errors.join('\n'));
  return 'Standalone rich chat: prototype-like question/choice IDs, custom-only answers, safe artifact links and 340px rendering passed.';
}
