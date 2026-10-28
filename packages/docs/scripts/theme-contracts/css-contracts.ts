import postcss, {type Declaration, type Rule} from 'postcss';
import valueParser from 'postcss-value-parser';
import {expandCssDefaults} from './expand-css-defaults';

/** A public styling variable and the CSS context that owns its default. */
export interface CssTokenContract {

  /** Canonical public custom-property name accepted by themes. */
  name: string;

  /** Source default expression; empty when supplied by inheritance or runtime. */
  value: string;

  /** Purpose read from local CSS comments or owning shared-catalog TSDoc. */
  description: string;

  /** Consuming selector, including surrounding conditional CSS contexts. */
  selector: string;

  /** Repository-relative CSS or Vue source owning this usage. */
  source: string;
}

/** Keeps a token's source, selector, and conditional context in its identity. */
export function cssTokenContextKey(
  token: Pick<CssTokenContract, 'name' | 'selector' | 'source'>
): string {
  return `${token.source}\0${token.selector}\0${token.name}`;
}

/** Removes annotation syntax while preserving the source author's prose. */
function commentDescription(text: string): string {
  return text
    .replace(/^\*\s*/, '')
    .replace(/\s*@token\s+--frame-[\w-]+/, '')
    .replace(/\s*@context\b/, '')
    .trim();
}

/** Descriptions come only from adjacent source comments. */
function description(declaration: Declaration): string {
  const previous = declaration.prev();
  return previous?.type === 'comment' ? commentDescription(previous.text) : '';
}

/** Identifies the public token documented by the adjacent purpose comment. */
function annotation(declaration: Declaration): string | undefined {
  const previous = declaration.prev();
  return previous?.type === 'comment'
    ? previous.text.match(/@token\s+(--frame-[\w-]+)/)?.[1]
    : undefined;
}

/** Matches positive class occurrences without treating :not/:has as ownership. */
export function matchesClass(selector: string, name: string): boolean {
  return new RegExp(
    '\\.' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])'
  ).test(selector.replace(/:(?:not|has)\([^)]*\)/g, ''));
}

/** Keeps conditional contexts when a token has several state-specific defaults. */
function context(rule: Rule): string {
  let result = rule.selector;
  let parent = rule.parent;
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule')
      result = `@${parent.name} ${parent.params} { ${result} }`;
    parent = parent.parent;
  }
  return result;
}

/**
 * Reads declarations and consuming references without inventing defaults.
 * Local purpose comments take precedence over shared catalog TSDoc. @context
 * marks inherited aliases and runtime geometry, including animation endpoints.
 */
export function extractCssContracts(
  css: string,
  source: string,
  classes: readonly string[],
  semantic: Readonly<Record<string, string>> = {},
  includeAllRules = false,
  semanticDescriptions: Readonly<Record<string, string>> = {}
): {
  classes: {name: string; description: string}[];
  tokens: CssTokenContract[];
} {
  const tokens = new Map<string, CssTokenContract>();
  const priorities = new Map<string, number>();
  const publicClasses = new Map<string, {name: string; description: string}>();
  postcss.parse(css, {from: source}).walkRules((rule) => {
    const owned = classes.filter((name) => matchesClass(rule.selector, name));
    if (
      (!owned.length || rule.selector.startsWith(':root')) &&
      !includeAllRules
    )
      return;
    for (const name of owned)
      publicClasses.set(name, {name: '.' + name, description: ''});
    const defaults = new Map<string, string>();
    const contextual = new Map<string, string>();
    for (const node of rule.nodes) {
      if (node.type === 'decl' && node.prop.startsWith('--_frame-default-'))
        defaults.set(node.prop, node.value);
      if (node.type === 'comment' && /@context\b/.test(node.text)) {
        const name = node.text.match(/@token\s+(--frame-[\w-]+)/)?.[1];
        if (name) contextual.set(name, commentDescription(node.text));
      }
    }
    const selector = context(rule);
    const declared = new Set<string>();
    rule.walkDecls((declaration) => {
      if (declaration.parent !== rule || !declaration.prop.startsWith('--'))
        return;
      const name =
        annotation(declaration) ??
        (declaration.prop.startsWith('--frame-')
          ? declaration.prop
          : undefined);
      if (!name) return;
      declared.add(name);
      const key = cssTokenContextKey({name, selector, source});
      tokens.set(key, {
        name,
        value: contextual.has(name)
          ? ''
          : expandCssDefaults(declaration.value, defaults),
        description:
          description(declaration) ||
          contextual.get(name) ||
          semanticDescriptions[name] ||
          '',
        selector,
        source,
      });
      priorities.set(key, 4);
    });
    rule.walkDecls((declaration) => {
      if (declaration.parent !== rule) return;
      const isDefault = declaration.prop.startsWith('--_frame-default-');
      if (declaration.prop.startsWith('--') && !isDefault) return;
      valueParser(declaration.value).walk((node) => {
        if (node.type !== 'function' || node.value !== 'var') return;
        const name = node.nodes[0]?.value;
        if (!name?.startsWith('--frame-') || declared.has(name)) return;
        const advertised = annotation(declaration);
        const local =
          contextual.get(name) ||
          (!isDefault && (!advertised || advertised === name)
            ? description(declaration)
            : '');
        const prose = local || semanticDescriptions[name] || '';
        const priority = local ? 2 : prose ? 1 : 0;
        const key = cssTokenContextKey({name, selector, source});
        if ((priorities.get(key) ?? -1) > priority) return;
        const separator = node.nodes.findIndex(
          (part) => part.type === 'div' && part.value === ','
        );
        const fallback =
          separator < 0
            ? ''
            : valueParser.stringify(node.nodes.slice(separator + 1)).trim();
        tokens.set(key, {
          name,
          value: contextual.has(name)
            ? ''
            : expandCssDefaults(fallback || semantic[name] || '', defaults),
          description: prose,
          selector,
          source,
        });
        priorities.set(key, priority);
      });
    });
  });
  return {classes: [...publicClasses.values()], tokens: [...tokens.values()]};
}
