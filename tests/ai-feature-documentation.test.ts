import {expect, test} from 'bun:test';
import {componentDocumentation} from '../packages/docs/src/examples/documentation/registry';
import {catalogGroups} from '../packages/docs/src/examples/catalogNavigation';
import {readFileSync} from 'node:fs';
import pagePaths from '../packages/docs/src/markdown/componentPages.json';

test('AI pages share generated documentation and a dedicated feature section', () => {
  expect(
    catalogGroups(true)
      .find((group) => group.title === 'AI')
      ?.items.map((item) => item.id)
      .sort()
  ).toEqual(['ai-chat', 'ai-conversation', 'ai-history', 'ai-prompt']);
  for (const id of ['ai-chat', 'ai-conversation', 'ai-history', 'ai-prompt']) {
    const doc = componentDocumentation[id]!;
    expect(doc.components[0]!.structure?.length).toBeGreaterThan(0);
    expect(doc.classes.length).toBeGreaterThan(0);
    expect(doc.tokens.length).toBeGreaterThan(0);
    if (id !== 'ai-prompt')
      expect(
        doc.components.some((component) =>
          component.name.startsWith('createAIChat')
        )
      ).toBe(true);
    const markdown = readFileSync(
      'docs/' + pagePaths[id as keyof typeof pagePaths],
      'utf8'
    );
    expect(markdown).toContain('### What it does');
    expect(markdown).toContain('### When to use it');
    expect(doc.features.length).toBeGreaterThanOrEqual(2);
    expect(
      doc.features.every((example) => example.code.includes('<script setup'))
    ).toBe(true);
  }
  const history = componentDocumentation['ai-history']!.components.find(
    (component) => component.name === 'createAIChatHistory'
  )!;
  expect(history.methods.map((method) => method.name)).toContain('setScope');
  expect(history.methods.map((method) => method.name)).toContain('dispose');
  expect(history.props.map((prop) => prop.name)).toContain('applicationId');
  expect(history.methods.map((method) => method.name)).toEqual(
    expect.arrayContaining(['rename', 'pin', 'archive'])
  );
  const prompt = componentDocumentation['ai-prompt']!.components[0]!;
  expect(prompt.emits.map((event) => event.name)).toEqual(
    expect.arrayContaining(['submit', 'stop', 'update:attachments'])
  );
  expect(
    componentDocumentation['ai-chat']!.features.some(
      (example) => example.id === 'view'
    )
  ).toBe(true);
  expect(
    componentDocumentation['ai-chat']!.components.some(
      (component) => component.name === 'createAIChatView'
    )
  ).toBe(true);
});
