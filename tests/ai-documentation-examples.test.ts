import { expect, test } from 'bun:test';
import ts from 'typescript';
import { resolve } from 'node:path';
import { aiGuides } from '../packages/docs/src/examples/documentation/aiGuides';

test('AI example scripts type-check against the public package declarations', () => {
  const sources = new Map(Object.entries(aiGuides).flatMap(([page, guide]) => guide.features.map(example => [
    resolve(`tests/.ai-example-${page}-${example.id}.ts`).replaceAll('\\', '/'),
    example.code.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '',
  ] as const)));
  const options: ts.CompilerOptions = { strict: true, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true, noEmit: true, noUncheckedSideEffectImports: false, paths: { '@frame/core/modules/*': [resolve('packages/core/dist/types/modules/*/index.d.ts')], '@frame/core': [resolve('packages/core/dist/types/index.d.ts')] } };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (file, languageVersion, ...rest) => sources.has(file) ? ts.createSourceFile(file, sources.get(file)!, languageVersion, true) : original(file, languageVersion, ...rest);
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).map(item => `${item.file?.fileName ?? ''}: ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`);
  expect(diagnostics).toEqual([]);
});
