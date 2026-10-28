import valueParser, {type Node} from 'postcss-value-parser';

/** Restores public fallback expressions from selector-local private defaults. */
export function expandCssDefaults(
  value: string,
  defaults: ReadonlyMap<string, string>,
  active: ReadonlySet<string> = new Set()
): string {
  const expand = (nodes: Node[]): Node[] =>
    nodes.flatMap((node) => {
      if (node.type !== 'function') return [node];
      const name = node.value === 'var' ? node.nodes[0]?.value : undefined;
      const fallback = name?.startsWith('--_frame-default-')
        ? defaults.get(name)
        : undefined;
      if (name && fallback !== undefined && !active.has(name)) {
        return valueParser(
          expandCssDefaults(fallback, defaults, new Set([...active, name]))
        ).nodes;
      }
      return [{...node, nodes: expand(node.nodes)}];
    });
  return valueParser.stringify(expand(valueParser(value).nodes));
}
