import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import ts from 'typescript';

/** Reads shared token prose from TSDoc attached to its owning catalog property. */
export function themeTokenDescriptions(
  source: string,
  filename: string
): Record<string, string> {
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true
  );
  const result: Record<string, string> = {};
  function visit(node: ts.Node): void {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.name) &&
      node.name.text.startsWith('--frame-')
    ) {
      const prose = ts
        .getJSDocCommentsAndTags(node)
        .filter(ts.isJSDoc)
        .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
        .filter(Boolean)
        .join('\n');
      if (prose) result[node.name.text] = prose;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return result;
}

/** Reads descriptions from the same hand-owned catalogs that define defaults. */
export function readThemeTokenDescriptions(
  root: string
): Record<string, string> {
  return Object.assign(
    {},
    ...['shellDefaults.ts', 'tokenCatalog.ts'].map((name) => {
      const path = resolve(root, 'packages/core/src/themes/tokens', name);
      return themeTokenDescriptions(readFileSync(path, 'utf8'), path);
    })
  );
}
