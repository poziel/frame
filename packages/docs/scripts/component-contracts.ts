import ts from 'typescript';
import {createChecker} from 'vue-component-meta';
import type {PropertyMeta} from 'vue-component-meta';
import {parse, compileScript, registerTS} from '@vue/compiler-sfc';
import {baseParse} from '@vue/compiler-dom';
import {readFileSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {createHash} from 'node:crypto';

registerTS(() => ts);

/** Source-derived omission, literal expression, or documented contextual default. */
export type ContractDefault =
  | {kind: 'required' | 'omitted'}
  | {kind: 'literal'; value: string}
  | {kind: 'derived'; expression: string};

/** One public prop consumed by references and playground controls. */
export interface ContractProp {

  /** Public member or component identifier. */
  name: string;

  /** Compiler-resolved readable TypeScript type. */
  type: string;

  /** Whether the caller must supply this prop. */
  required: boolean;

  /** Declared omission or default expression, never executed. */
  default: ContractDefault;

  /** Source declaration comment; empty when documentation is missing. */
  description: string;

  /** String literal choices resolved by the checker. */
  options?: string[];

  /** Playground editor selected from the resolved prop type. */
  control: string;

  /** Named types referenced by the prop declaration. */
  references: string[];

  /** Structured documentation tags retained from source. */
  tags: {name: string; text?: string}[];
}

/** Callable or exposed value with its compiler-resolved signature. */
export interface ContractMember {

  /** Public member or component identifier. */
  name: string;

  /** Resolved parameters or slot scope type. */
  parameters: string;

  /** Resolved callable return type or exposed property type. */
  returns: string;

  /** Source declaration comment; empty when documentation is missing. */
  description: string;

  /** Complete overload signatures; preserves parameter/return correspondence. */
  signatures?: string[];

  /** Distinguishes exposed methods from properties. */
  kind?: string;

  /** Structured documentation tags retained from source. */
  tags: {name: string; text?: string}[];
}

/** Stable JSON representation shared by generated Markdown and live playgrounds. */
export interface ComponentContract {

  /** Public member or component identifier. */
  name: string;

  /** Repository-relative owning Vue source path. */
  source: string;

  /** Generic parameters and constraints declared by the SFC. */
  generic?: string;

  /** Hash used to detect stale source-derived output. */
  sourceHash: string;

  /** Public props with Vue plumbing removed. */
  props: ContractProp[];

  /** Declared events including inherited emit contracts. */
  emits: ContractMember[];

  /** Declared or compiler-inferred public slot scopes. */
  slots: ContractMember[];

  /** Explicitly exposed methods and unwrapped properties. */
  methods: ContractMember[];

  /** Static template element outline; not a forwarding guarantee. */
  structure: string[];

  /** Whether automatic Vue attribute inheritance is enabled. */
  forwardsAttrs: boolean;

  /** Missing descriptions and contradictory declared defaults. */
  diagnostics: string[];
}

/** Removes machine-local import prefixes while keeping declared type identities. */
function readable(type: string): string {
  return type
    .replace(/import\("[^"]+"\)\./g, '')
    .replace(/\b(?:_internationalized_date\d*|vue\d*|vue_demi\d*)\./g, '');
}

/** Classifies source expressions without evaluating factories or setup code. */
function defaultValue(prop: PropertyMeta): ContractDefault {
  const documented = prop.tags.find((tag) => tag.name === 'defaultValue')?.text;
  const expression = prop.default ?? documented?.replace(/^`(.*)`$/, '$1');
  if (expression === undefined)
    return {kind: prop.required ? 'required' : 'omitted'};
  if (['undefined', 'void 0'].includes(expression)) return {kind: 'omitted'};
  const node = ts.createSourceFile(
    'default.ts',
    `const value = ${expression};`,
    ts.ScriptTarget.Latest,
    true
  );
  const statement = node.statements[0];
  const value =
    statement && ts.isVariableStatement(statement)
      ? statement.declarationList.declarations[0]?.initializer
      : undefined;
  const literal =
    value &&
    (ts.isStringLiteral(value) ||
      ts.isNumericLiteral(value) ||
      value.kind === ts.SyntaxKind.TrueKeyword ||
      value.kind === ts.SyntaxKind.FalseKeyword ||
      value.kind === ts.SyntaxKind.NullKeyword ||
      (ts.isPrefixUnaryExpression(value) &&
        (value.operator === ts.SyntaxKind.MinusToken ||
          value.operator === ts.SyntaxKind.PlusToken) &&
        ts.isNumericLiteral(value.operand)));
  return literal
    ? {kind: 'literal', value: expression}
    : {kind: 'derived', expression};
}

/** Reads Vue's emitted runtime prop options to identify actual Boolean casting. */
function booleanAbsenceDefaults(text: string, file: string): Set<string> {
  const descriptor = parse(text, {filename: file}).descriptor;
  const script = compileScript(descriptor, {
    id: 'frame-component-contract',
    fs: {fileExists: ts.sys.fileExists, readFile: ts.sys.readFile},
  });
  const source = ts.createSourceFile(
    file + '.ts',
    script.content,
    ts.ScriptTarget.Latest,
    true
  );
  const result = new Set<string>();
  const unquote = (value: string) => value.replace(/^['"]|['"]$/g, '');
  const property = (object: ts.ObjectLiteralExpression, name: string) =>
    object.properties.find(
      (node): node is ts.PropertyAssignment =>
        ts.isPropertyAssignment(node) &&
        unquote(node.name.getText(source)) === name
    );
  const booleanType = (node: ts.Expression): boolean =>
    (ts.isIdentifier(node) && node.text === 'Boolean') ||
    (ts.isArrayLiteralExpression(node) &&
      node.elements.some(
        (element) => ts.isIdentifier(element) && element.text === 'Boolean'
      ));
  for (const statement of source.statements) {
    if (!ts.isExportAssignment(statement)) continue;
    const expression = statement.expression;
    const options = ts.isCallExpression(expression)
      ? expression.arguments[0]
      : expression;
    if (!options || !ts.isObjectLiteralExpression(options)) continue;
    const props = property(options, 'props')?.initializer;
    if (!props || !ts.isObjectLiteralExpression(props)) continue;
    for (const prop of props.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const options = prop.initializer;
      if (
        booleanType(options) ||
        (ts.isObjectLiteralExpression(options) &&
          !property(options, 'default') &&
          !!property(options, 'type') &&
          booleanType(property(options, 'type')!.initializer))
      )
        result.add(unquote(prop.name.getText(source)));
    }
  }
  return result;
}

/** Creates one reusable Vue language-service session for an extraction batch. */
export function createComponentExtractor(
  root: string,
  tsconfig = 'packages/core/tsconfig.json'
) {
  const engine = createChecker(resolve(root, tsconfig), {
    schema: false,
  });
  return (source: string): ComponentContract => {
    const file = resolve(root, source);
    const text = readFileSync(file, 'utf8');
    const meta = engine.getComponentMeta(file);
    const booleanDefaults = booleanAbsenceDefaults(text, file);
    const checker = engine.getProgram()!.getTypeChecker();
    const sourceFile = engine
      .getProgram()!
      .getSourceFile(file.replace(/\\/g, '/'));
    const eventComments = new Map<string, string>();
    const exposedComments = new Map<string, string>();
    const slotParameters = new Map<string, string>();
    // Vue's event normalization drops comments on callable emit overloads and
    // shorthand exposed functions. Read their original checker declarations.
    const commentsFromMacros = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(sourceFile) === 'defineEmits' &&
        node.typeArguments?.[0]
      ) {
        const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
        for (const symbol of checker.getPropertiesOfType(type)) {
          eventComments.set(
            symbol.name,
            ts.displayPartsToString(symbol.getDocumentationComment(checker))
          );
        }
        for (const signature of type.getCallSignatures()) {
          const parameter = signature.parameters[0];
          const declaration =
            parameter?.valueDeclaration ?? parameter?.declarations?.[0];
          if (!parameter || !declaration) continue;
          const names = checker.getTypeOfSymbolAtLocation(
            parameter,
            declaration
          );
          for (const name of names.isUnion() ? names.types : [names]) {
            if (name.isStringLiteral())
              eventComments.set(
                name.value,
                ts.displayPartsToString(
                  signature.getDocumentationComment(checker)
                )
              );
          }
        }
      }
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(sourceFile) === 'defineSlots' &&
        node.typeArguments?.[0]
      ) {
        const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
        for (const symbol of checker.getPropertiesOfType(type)) {
          const declaration =
            symbol.valueDeclaration ?? symbol.declarations![0]!;
          const signature = checker
            .getNonNullableType(
              checker.getTypeOfSymbolAtLocation(symbol, declaration)
            )
            .getCallSignatures()[0];
          if (signature && signature.parameters.length === 0)
            slotParameters.set(symbol.name, '');
        }
      }
      if (
        ts.isVariableDeclaration(node) &&
        node.name.getText(sourceFile) === '__VLS_exposed' &&
        node.initializer &&
        ts.isObjectLiteralExpression(node.initializer)
      ) {
        for (const property of node.initializer.properties) {
          if (ts.isShorthandPropertyAssignment(property)) {
            const symbol = checker.getShorthandAssignmentValueSymbol(property);
            if (symbol)
              exposedComments.set(
                property.name.text,
                ts.displayPartsToString(symbol.getDocumentationComment(checker))
              );
          }
        }
      }
      ts.forEachChild(node, commentsFromMacros);
    };
    if (sourceFile) commentsFromMacros(sourceFile);
    const format =
      ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
    const props = meta.props
      .filter(
        (prop) =>
          !prop.global &&
          !meta.events.some(
            (event) =>
              prop.name ===
              `on${event.name[0]!.toUpperCase()}${event.name.slice(1)}`
          )
      )
      .map((prop): ContractProp => {
        const type = readable(prop.type);
        const raw = prop.getTypeObject();
        const branches = raw.isUnion() ? raw.types : [raw];
        const choices = branches
          .filter((branch) => branch.isStringLiteral())
          .map((branch) => (branch as ts.StringLiteralType).value);
        const boolean = branches.some(
          (branch) =>
            !!(
              branch.flags &
              (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)
            )
        );
        const number = branches.some(
          (branch) =>
            !!(
              branch.flags &
              (ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral)
            )
        );
        const string =
          choices.length > 0 ||
          branches.some((branch) => !!(branch.flags & ts.TypeFlags.String));
        const fixture =
          !string &&
          (/Controller|HTMLElement|\bFrame\b|Component|NotificationHistory/.test(
            type
          ) ||
            type.includes('=>') ||
            checker.getNonNullableType(raw).getCallSignatures().length > 0);
        return {
          name: prop.name,
          type,
          required: prop.required,
          default:
            prop.default === undefined &&
            booleanDefaults.has(prop.name) &&
            !prop.required
              ? {kind: 'literal', value: 'false'}
              : defaultValue(prop),
          description: prop.description,
          options: choices.length ? choices : undefined,
          control: fixture
            ? 'fixture'
            : boolean && !string
              ? 'boolean'
              : number && !string
                ? 'number'
                : string
                  ? 'text'
                  : 'json',
          references: [
            ...new Set(type.match(/\b[A-Z][A-Za-z0-9]+\b/g) ?? []),
          ].filter(
            (name) =>
              ![
                'Promise',
                'MouseEvent',
                'KeyboardEvent',
                'HTMLElement',
                'Component',
              ].includes(name)
          ),
          tags: prop.tags,
        };
      });
    const signatureParts = (type: ts.Type) =>
      type.getCallSignatures().map((signature) => ({
        parameters: signature.parameters
          .map(
            (parameter) =>
              `${parameter.name}: ${readable(checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration ?? parameter.declarations![0]!), undefined, format))}`
          )
          .join(', '),
        returns: readable(
          checker.typeToString(signature.getReturnType(), undefined, format)
        ),
      }));
    const emits = meta.events.map((event) => ({
      name: event.name,
      parameters: readable(event.type.replace(/^\[|\]$/g, '')),
      returns: 'void',
      description: event.description || eventComments.get(event.name) || '',
      tags: event.tags,
    }));
    const slots = meta.slots.map((slot) => ({
      name: slot.name,
      parameters: slotParameters.get(slot.name) ?? readable(slot.type),
      returns: 'VNodeChild',
      description: slot.description,
      tags: slot.tags,
    }));
    const methods = meta.exposed
      .filter(
        (member) =>
          !member.name.startsWith('$') && !member.name.startsWith('__')
      )
      .map((member) => {
        const signatures = signatureParts(member.getTypeObject());
        return {
          name: member.name,
          kind: signatures.length ? 'method' : 'property',
          signatures: member
            .getTypeObject()
            .getCallSignatures()
            .map((signature) =>
              readable(checker.signatureToString(signature, undefined, format))
            ),
          parameters: signatures
            .map((signature) => signature.parameters)
            .join(' | '),
          returns: signatures.length
            ? signatures.map((signature) => signature.returns).join(' | ')
            : readable(member.type),
          description:
            member.description || exposedComments.get(member.name) || '',
          tags: member.tags,
        };
      });
    const structure: string[] = [];
    const template = parse(text, {filename: file}).descriptor.template;
    const visit = (
      nodes: ReturnType<typeof baseParse>['children'],
      depth = 0
    ) => {
      for (const node of nodes)
        if (node.type === 1) {
          const classes = node.props.find(
            (prop) => prop.type === 6 && prop.name === 'class'
          );
          const suffix =
            classes?.type === 6 && classes.value
              ? '.' + classes.value.content.trim().split(/\s+/).join('.')
              : '';
          structure.push('  '.repeat(depth) + node.tag + suffix);
          visit(node.children, depth + 1);
        }
    };
    if (template) visit(baseParse(template.content).children);
    const diagnostics = [...props, ...emits, ...slots, ...methods]
      .filter((member) => !member.description)
      .map((member) => `Missing description: ${member.name}`);
    for (const prop of meta.props) {
      const documented = prop.tags.find(
        (tag) => tag.name === 'defaultValue'
      )?.text;
      if (
        prop.default !== undefined &&
        documented !== undefined &&
        prop.default !== documented
      )
        diagnostics.push(
          `Conflicting default: ${prop.name} (${prop.default} / ${documented})`
        );
    }
    return {
      name: file.split(/[\\/]/).pop()!.replace('.vue', ''),
      source: relative(root, file).replace(/\\/g, '/'),
      generic:
        typeof parse(text, {filename: file}).descriptor.scriptSetup?.attrs
          .generic === 'string'
          ? String(
              parse(text, {filename: file}).descriptor.scriptSetup?.attrs
                .generic
            )
          : undefined,
      sourceHash: createHash('sha256').update(text).digest('hex'),
      props,
      emits,
      slots,
      methods,
      structure,
      forwardsAttrs: !/inheritAttrs\s*:\s*false/.test(text),
      diagnostics,
    };
  };
}
