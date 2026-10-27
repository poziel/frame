import ts from 'typescript';
import {parse} from '@vue/compiler-sfc';

/** A whitespace replacement confined to one parameter list. */
interface ParameterEdit {

  /** First character inside the opening parenthesis. */
  start: number;

  /** First character of the closing parenthesis. */
  end: number;

  /** Canonical parameter-list whitespace. */
  text: string;
}

/** An independently parsed script and its location in the original file. */
interface ScriptSegment {

  /** Script contents, excluding Vue markup. */
  text: string;

  /** Absolute offset within the complete source file. */
  offset: number;

  /** Parser mode matching the script language. */
  kind: ts.ScriptKind;
}

/**
 * Formats definition parameters without reprinting surrounding source code.
 *
 * @remarks
 * Six or fewer parameters stay inline when their signature fits the width.
 * Longer signatures and structurally multiline parameters use one parameter
 * per line. Calls, comments, literals, class spacing, and templates are retained.
 * Every result is checked against the original syntax tree before returning.
 */
export class ParameterFormatter {

  /** Maximum permitted inline signature width, including indentation. */
  private readonly width: number;

  /**
   * Creates a formatter using the repository's signature-width convention.
   *
   * @param width - Maximum inline signature width; defaults to 80 columns.
   */
  constructor(width = 80) {
    this.width = width;
  }

  /**
   * Formats parameter lists in a TypeScript, JavaScript, or Vue source file.
   *
   * @param source - Original source, including any Vue markup.
   * @param filename - Filename used to select parser mode and diagnostics.
   * @returns Source with canonical parameter layout and unchanged syntax.
   * @throws If formatting changes syntax or fails to reach a stable layout.
   */
  format(source: string, filename: string): string {
    const original = this.fingerprint(source, filename);
    let current = source;
    for (let pass = 0; pass < 32; pass++) {
      const edits = this.collect(current, filename);
      if (!edits.length) {
        if (this.fingerprint(current, filename) !== original) {
          throw new Error(`Parameter formatting changed syntax: ${filename}`);
        }
        return current;
      }
      // Inner lists settle before their containing parameter declarations.
      const leaves = edits.filter(
        (edit) =>
          !edits.some(
            (other) =>
              other !== edit &&
              other.start >= edit.start &&
              other.end <= edit.end
          )
      );
      for (const edit of leaves.sort((a, b) => b.start - a.start)) {
        current =
          current.slice(0, edit.start) + edit.text + current.slice(edit.end);
      }
    }
    throw new Error(`Parameter formatting did not converge: ${filename}`);
  }

  /**
   * Collects changes only for declarations with explicit parentheses.
   *
   * @param source - Current full source text.
   * @param filename - Filename used for script extraction.
   * @returns Noncanonical parameter-list ranges, including nested lists.
   */
  private collect(source: string, filename: string): ParameterEdit[] {
    const edits: ParameterEdit[] = [];
    for (const segment of this.segments(source, filename)) {
      const file = ts.createSourceFile(
        filename,
        segment.text,
        ts.ScriptTarget.Latest,
        true,
        segment.kind
      );
      const visit = (node: ts.Node) => {
        if (ts.isFunctionLike(node)) {
          const parameters = node.parameters;
          const children = node.getChildren(file);
          const open = children.find(
            (child) =>
              child.kind === ts.SyntaxKind.OpenParenToken &&
              child.end === parameters.pos
          );
          const close = children.find(
            (child) =>
              child.kind === ts.SyntaxKind.CloseParenToken &&
              child.pos >= parameters.end
          );
          if (open && close) {
            const start = open.end + segment.offset;
            const end = close.getStart(file) + segment.offset;
            const text = this.layout(
              node,
              parameters,
              file,
              source,
              segment.offset,
              start,
              end,
              close.end
            );
            if (text !== source.slice(start, end)) {
              edits.push({start, end, text});
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(file);
    }
    return edits;
  }

  /**
   * Chooses compact or vertical layout while preserving parameter contents.
   *
   * @param node - Declaration owning the parameter list.
   * @param parameters - Parsed parameters, including their original trivia.
   * @param file - Script syntax tree containing the declaration.
   * @param source - Complete source used for line-width calculations.
   * @param offset - Script offset within the complete source.
   * @param start - First character inside the opening parenthesis.
   * @param end - Position of the closing parenthesis.
   * @param closeEnd - Script-relative end of the closing parenthesis.
   * @returns Canonical text between the existing parentheses.
   */
  private layout(
    node: ts.Node,
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
    file: ts.SourceFile,
    source: string,
    offset: number,
    start: number,
    end: number,
    closeEnd: number
  ): string {
    const original = source.slice(start, end);
    if (!parameters.length) {
      return original.trim() ? original : '';
    }
    const chunks = parameters.map((parameter, index) =>
      source
        .slice(
          parameter.pos + offset,
          index + 1 < parameters.length
            ? parameters[index + 1]!.pos + offset
            : end
        )
        .trim()
    );
    const lineStart = source.lastIndexOf('\n', start - 1) + 1;
    const prefix = source.slice(lineStart, start);
    const indent = prefix.match(/^[\t ]*/)?.[0] ?? '';
    const body =
      'body' in node ? (node.body as ts.Node | undefined) : undefined;
    const signatureEnd = body?.getStart(file) ?? node.end;
    const suffix =
      file.text.slice(closeEnd, signatureEnd).split(/\r?\n/, 1)[0] ?? '';
    const compact = chunks
      .map((chunk) => chunk.replace(/[\t ]*\r?\n[\t ]*/g, ' '))
      .join(' ');
    const structural = parameters.some((parameter) =>
      this.multilineStructure(parameter, file)
    );
    const comments = this.hasComments(
      original,
      parameters,
      file,
      start - offset
    );
    if (
      parameters.length <= 6 &&
      !structural &&
      !comments &&
      prefix.length + compact.length + 1 + suffix.length <= this.width
    ) {
      return compact;
    }
    const newline = source.includes('\r\n') ? '\r\n' : '\n';
    const unit = indent.includes('\t') ? '\t' : '  ';
    return (
      newline +
      chunks.map((chunk) => indent + unit + chunk).join(newline) +
      newline +
      indent
    );
  }

  /**
   * Retains multiline bodies, type members, JSX, and literal contents.
   *
   * @param parameter - Parameter whose internal structure is inspected.
   * @param file - Script containing the parameter.
   * @returns Whether compacting would disturb meaningful multiline content.
   */
  private multilineStructure(
    parameter: ts.ParameterDeclaration,
    file: ts.SourceFile
  ): boolean {
    let multiline = false;
    const visit = (node: ts.Node) => {
      if (
        (ts.isBlock(node) ||
          ts.isTypeLiteralNode(node) ||
          ts.isStringLiteralLike(node) ||
          ts.isTemplateExpression(node) ||
          ts.isJsxElement(node) ||
          ts.isJsxFragment(node)) &&
        /\r?\n/.test(node.getText(file))
      ) {
        multiline = true;
      }
      ts.forEachChild(node, visit);
    };
    visit(parameter);
    return multiline;
  }

  /**
   * Finds comments without confusing strings, templates, or regular expressions.
   *
   * @param text - Full parameter-list text, including separators and trivia.
   * @param parameters - Parameters providing literal protection ranges.
   * @param file - Script containing the parameters.
   * @param start - Script-relative beginning of the parameter-list text.
   * @returns Whether comment placement requires a vertical layout.
   */
  private hasComments(
    text: string,
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
    file: ts.SourceFile,
    start: number
  ): boolean {
    const literals: {start: number; end: number}[] = [];
    const visit = (node: ts.Node) => {
      if (
        ts.isStringLiteralLike(node) ||
        ts.isTemplateExpression(node) ||
        ts.isRegularExpressionLiteral(node)
      ) {
        literals.push({
          start: node.getStart(file) - start,
          end: node.end - start,
        });
      }
      ts.forEachChild(node, visit);
    };
    parameters.forEach(visit);
    const scanner = ts.createScanner(
      ts.ScriptTarget.Latest,
      false,
      ts.LanguageVariant.Standard,
      text
    );
    for (
      let token = scanner.scan();
      token !== ts.SyntaxKind.EndOfFileToken;
      token = scanner.scan()
    ) {
      if (
        (token === ts.SyntaxKind.SingleLineCommentTrivia ||
          token === ts.SyntaxKind.MultiLineCommentTrivia) &&
        !literals.some(
          (literal) =>
            scanner.getTokenPos() >= literal.start &&
            scanner.getTokenPos() < literal.end
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extracts executable scripts without touching Vue templates or styles.
   *
   * @param source - Complete file source.
   * @param filename - File extension used to select script mode.
   * @returns Scripts and their original offsets within the file.
   */
  private segments(source: string, filename: string): ScriptSegment[] {
    if (!filename.endsWith('.vue')) {
      return [
        {
          text: source,
          offset: 0,
          kind: /\.[jt]sx$/.test(filename)
            ? ts.ScriptKind.TSX
            : ts.ScriptKind.TS,
        },
      ];
    }
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

  /**
   * Encodes syntax-tree structure and exact tokens to reject semantic edits.
   *
   * @param source - Source before or after whitespace changes.
   * @param filename - Filename used for script extraction.
   * @returns A stable representation excluding only token-external trivia.
   */
  private fingerprint(source: string, filename: string): string {
    return this.segments(source, filename)
      .map((segment) => {
        const file = ts.createSourceFile(
          filename,
          segment.text,
          ts.ScriptTarget.Latest,
          true,
          segment.kind
        );
        const values: (string | number)[] = [];
        const visit = (node: ts.Node) => {
          values.push(node.kind);
          const children = node.getChildren(file);
          if (!children.length) {
            values.push(node.getText(file));
          } else {
            children.forEach(visit);
          }
          values.push(-1);
        };
        visit(file);
        return JSON.stringify(values);
      })
      .join('\n');
  }
}
