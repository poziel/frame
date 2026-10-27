import ts from 'typescript';
import {parse} from '@vue/compiler-sfc';

/** A replacement confined to trivia between declarations or members. */
interface SpacingEdit {

  /** Beginning of the whitespace being normalized. */
  start: number;

  /** End of the whitespace being normalized. */
  end: number;

  /** Canonical whitespace, without changes to comments or code. */
  text: string;
}

/**
 * Restores Frame's class and interface spacing after baseline formatting.
 * Keeps a blank line after the opening brace and between distinct members,
 * including their documentation, without reordering executable declarations.
 */
export class MemberFormatter {

  /**
   * Applies member spacing to scripts and the script blocks inside Vue files.
   *
   * @param source - Baseline-formatted source code.
   * @param filename - Filename determining script extraction and parser mode.
   * @returns Source with project-specific whitespace around declarations.
   */
  format(source: string, filename: string): string {
    const edits: SpacingEdit[] = [];
    const segments = filename.endsWith('.vue')
      ? this.vueScripts(source, filename)
      : [
          {
            text: source,
            offset: 0,
            kind: /\.[jt]sx$/.test(filename)
              ? ts.ScriptKind.TSX
              : ts.ScriptKind.TS,
          },
        ];
    for (const segment of segments) {
      const file = ts.createSourceFile(
        filename,
        segment.text,
        ts.ScriptTarget.Latest,
        true,
        segment.kind
      );
      const visit = (node: ts.Node) => {
        if (
          (ts.isClassDeclaration(node) ||
            ts.isClassExpression(node) ||
            ts.isInterfaceDeclaration(node)) &&
          node.members.length
        ) {
          const members = [...node.members];
          for (let index = 0; index < members.length; index++) {
            const member = members[index]!;
            this.addGap(
              edits,
              source,
              segment.offset +
                (index ? members[index - 1]!.end : node.members.pos),
              segment.offset + member.getStart(file)
            );
          }
          const start = segment.offset + members[members.length - 1]!.end;
          const end = segment.offset + node.end - 1;
          if (/^\s*$/.test(source.slice(start, end))) {
            const indent =
              segment.text
                .slice(
                  segment.text.lastIndexOf('\n', node.getStart(file)) + 1,
                  node.getStart(file)
                )
                .match(/^ */)?.[0] ?? '';
            edits.push({start, end, text: '\n' + indent});
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(file);
      for (let index = 1; index < file.statements.length; index++) {
        const previous = file.statements[index - 1]!;
        const current = file.statements[index]!;
        if (
          (ts.isImportDeclaration(previous) &&
            !ts.isImportDeclaration(current)) ||
          this.isDeclaration(previous) ||
          this.isDeclaration(current)
        ) {
          this.addGap(
            edits,
            source,
            previous.end + segment.offset,
            current.getStart(file) + segment.offset
          );
        }
      }
    }
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
    }
    return source;
  }

  /**
   * Adds a blank separator before documentation while retaining trailing notes.
   *
   * @param edits - Whitespace replacements accumulated for this file.
   * @param source - Original complete source.
   * @param start - End of the preceding declaration or opening brace.
   * @param end - Start of the following member's code, after documentation.
   */
  private addGap(
    edits: SpacingEdit[],
    source: string,
    start: number,
    end: number
  ): void {
    const gap = source.slice(start, end);
    const leading = gap.match(/^\s*/)?.[0] ?? '';
    if (
      !leading.includes('\n') &&
      (gap.slice(leading.length).startsWith('//') ||
        gap.slice(leading.length).startsWith('/*'))
    ) {
      const commentEnd = gap.slice(leading.length).startsWith('/*')
        ? source.indexOf('*/', start) + 2
        : start;
      const newline = source.indexOf('\n', commentEnd);
      if (newline < 0 || newline >= end) return;
      start = newline;
    }
    const whitespace = source.slice(start, end).match(/^\s*/)?.[0] ?? '';
    const lineStart = source.lastIndexOf('\n', end - 1) + 1;
    const indent = source.slice(lineStart, end).match(/^ */)?.[0] ?? '';
    edits.push({start, end: start + whitespace.length, text: '\n\n' + indent});
  }

  /**
   * Identifies declarations that need separation from neighboring statements.
   *
   * @param node - Top-level script statement.
   * @returns Whether a blank declaration separator is required.
   */
  private isDeclaration(node: ts.Node): boolean {
    return (
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)
    );
  }

  /**
   * Extracts both ordinary and setup scripts without touching Vue markup.
   *
   * @param source - Complete single-file component.
   * @param filename - Component filename for parser diagnostics.
   * @returns Script contents and their absolute positions.
   */
  private vueScripts(
    source: string,
    filename: string
  ): {text: string; offset: number; kind: ts.ScriptKind}[] {
    const {descriptor} = parse(source, {filename});
    return [descriptor.script, descriptor.scriptSetup]
      .filter((block) => block !== null)
      .map((block) => ({
        text: block.content,
        offset: block.loc.start.offset,
        kind:
          block.lang === 'tsx' || block.lang === 'jsx'
            ? ts.ScriptKind.TSX
            : ts.ScriptKind.TS,
      }));
  }
}
