async page => {
  await page.goto('http://localhost:1420/#/playground/ai-chat');
  const input = page.getByRole('region', { name: 'AI chat', exact: true }).getByRole('textbox', { name: 'Message', exact: true });
  await input.waitFor();
  const check = async state => {
    const style = await input.evaluate(el => {
      const inner = getComputedStyle(el), outer = getComputedStyle(el.closest('.frame-chat-composer'));
      return { border: inner.borderTopWidth, outline: inner.outlineStyle, shadow: inner.boxShadow, outer: outer.borderTopWidth };
    });
    if (style.border !== '0px' || style.outline !== 'none' || style.shadow !== 'none' || style.outer !== '1px') throw new Error(`${state}: ${JSON.stringify(style)}`);
  };
  await page.getByRole('heading').first().click().catch(() => input.blur());
  await check('idle');
  await input.hover(); await check('hover');
  await input.focus(); await check('focus');
  await input.fill('Composer border check'); await check('populated focus');
  await input.fill('');
  return 'Composer retains one outer border in idle, hover, focus, and populated states.';
}
