// playwright-cli -s=chat-playground run-code --filename tests/ai-chat-remote-download-browser.cjs
async page => {
  await page.route('https://chat-artifact.test/remote-notes', route => route.fulfill({ status: 200, contentType: 'text/plain', headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Remote preview notes' }));
  await page.goto('http://localhost:1420/@fs/D:/Dev/1-codes/frame/tests/fixtures/chat-rich/index.html');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Remote file');
  await page.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
  await page.evaluate(() => window.richChatFixture.writer.artifact({ kind: 'file', name: 'remote-notes.txt', mimeType: 'text/plain', url: 'https://chat-artifact.test/remote-notes' }));
  const outcome = Promise.race([
    page.waitForEvent('download').then(download => ({ kind: 'download', name: download.suggestedFilename() })),
    page.waitForURL('https://chat-artifact.test/remote-notes').then(() => ({ kind: 'navigation' })),
  ]);
  await page.getByRole('button', { name: 'Download remote-notes.txt', exact: true }).click();
  const result = await outcome;
  if (result.kind !== 'download' || result.name !== 'remote-notes.txt') throw new Error('Remote download must save the named file without navigating away from the app.');
  if (!page.url().startsWith('http://localhost:1420/')) throw new Error('The app location must remain unchanged.');
  return 'Cross-origin file downloads preserve the application and requested filename.';
}
