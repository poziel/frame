import type {ThemeValueKind} from '../tokens/tokenCatalog';

/** Decimal grammar shared by dimensions, scalars, and angular values. */
const numberPattern = '[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
/** Matches a complete decimal scalar rather than a numeric prefix. */
const numeric = new RegExp(`^${numberPattern}$`);
/** Matches supported CSS length units and percentages. */
const dimension = new RegExp(
  `^(${numberPattern})(px|rem|em|ch|ex|lh|rlh|vw|vh|vi|vb|vmin|vmax|dvw|dvh|svw|svh|lvw|lvh|cm|mm|in|pt|pc|%)$`,
  'i'
);
/** Supported named colors; validation does not depend on browser CSS parsing. */
const names = new Set(
  'transparent currentcolor black white red green blue yellow cyan magenta gray grey silver maroon olive lime aqua teal navy fuchsia purple orange pink brown gold violet indigo coral tomato salmon crimson rebeccapurple whitesmoke lightgray lightgrey darkgray darkgrey slategray slategrey lightslategray darkslategray aliceblue antiquewhite beige bisque chocolate lavender ivory khaki linen mintcream orchid plum seashell sienna snow steelblue tan turquoise wheat'.split(
    ' '
  )
);
/** Splits top-level components while rejecting unbalanced or excessive nesting. */
function split(value: string, separator: ',' | ' '): string[] {
  let depth = 0,
    start = 0;
  const result: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    if (value[i] === ')') depth--;
    if (depth < 0 || depth > 12) return [];
    if (
      depth === 0 &&
      (separator === ',' ? value[i] === ',' : /\s/.test(value[i]!))
    ) {
      const part = value.slice(start, i).trim();
      if (separator === ',' || part) result.push(part);
      start = i + 1;
    }
  }
  if (depth) return [];
  const last = value.slice(start).trim();
  if (separator === ',' || last) result.push(last);
  return result;
}
/** Accepts finite decimal values within the supplied inclusive bounds. */
function scalar(value: string, min = -Infinity, max = Infinity): boolean {
  return (
    numeric.test(value) &&
    Number.isFinite(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max
  );
}
/** Checks lengths and bounded calc expressions with category-specific sign rules. */
function length(value: string, signed = false, allowPercent = true): boolean {
  if (value === '0') return true;
  const match = dimension.exec(value);
  if (match)
    return (
      Number.isFinite(Number(match[1])) &&
      (signed || Number(match[1]) >= 0) &&
      (allowPercent || match[2] !== '%')
    );
  // Deliberately bounded calc grammar: a length multiplied/divided by a scalar.
  const calculation = /^calc\((.*)\s+([*/])\s+([^() ]+)\)$/.exec(value);
  return (
    !!calculation &&
    length(calculation[1]!.trim(), signed, allowPercent) &&
    scalar(calculation[3]!, calculation[2] === '/' ? Number.MIN_VALUE : 0)
  );
}
/** Accepts percentages in the inclusive range from zero to one hundred. */
function percentage(value: string): boolean {
  return value.endsWith('%') && scalar(value.slice(0, -1), 0, 100);
}
/** Checks opacity expressed as a unit scalar or percentage. */
function alpha(value: string): boolean {
  return percentage(value) || scalar(value, 0, 1);
}
/** Accepts decimal hue values with an optional supported angle unit. */
function hue(value: string): boolean {
  return new RegExp(`^${numberPattern}(deg|rad|grad|turn)?$`, 'i').test(value);
}
/** Checks supported color functions, channels, and bounded sRGB color mixes. */
function color(value: string): boolean {
  if (
    /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value) ||
    names.has(value.toLowerCase())
  )
    return true;
  const fn = /^(rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\((.*)\)$/i.exec(value);
  if (!fn) return false;
  const name = fn[1]!.toLowerCase(),
    body = fn[2]!.trim();
  if (name === 'color-mix') {
    const parts = split(body, ',');
    if (parts.length !== 3 || parts[0] !== 'in srgb') return false;
    const weights = parts.slice(1).map((part) => {
      const components = split(part, ' '),
        last = components[components.length - 1]!;
      return percentage(last) ? Number(last.slice(0, -1)) : undefined;
    });
    if (weights.every((weight) => weight === 0)) return false;
    return parts.slice(1).every((part) => {
      const components = split(part, ' '),
        weight = components[components.length - 1]!;
      return percentage(weight)
        ? color(components.slice(0, -1).join(' '))
        : color(part);
    });
  }
  const comma = body.includes(',');
  let channels: string[], opacity: string | undefined;
  if (comma) {
    if (body.includes('/')) return false;
    channels = split(body, ',');
    if (channels.length === 4) opacity = channels.pop();
  } else {
    const sections = body.split('/');
    if (sections.length > 2) return false;
    channels = split(sections[0]!.trim(), ' ');
    opacity = sections[1]?.trim();
  }
  if (channels.length !== 3 || (opacity !== undefined && !alpha(opacity)))
    return false;
  if (name === 'rgb' || name === 'rgba')
    return (
      channels.every(
        (channel) => percentage(channel) || scalar(channel, 0, 255)
      ) &&
      (!comma ||
        channels.every(percentage) ||
        channels.every((channel) => scalar(channel, 0, 255)))
    );
  if (name === 'hsl' || name === 'hsla')
    return hue(channels[0]!) && channels.slice(1).every(percentage);
  if (comma) return false;
  return (
    (percentage(channels[0]!) || scalar(channels[0]!, 0, 1)) &&
    scalar(channels[1]!, name === 'oklch' ? 0 : -1, 1) &&
    (name === 'oklch' ? hue(channels[2]!) : scalar(channels[2]!, -1, 1))
  );
}
/** Checks comma-separated shadows with lengths and a supported terminal color. */
function shadow(value: string): boolean {
  if (value === 'none') return true;
  const shadows = split(value, ',');
  return (
    shadows.length > 0 &&
    shadows.every((part) => {
      let items = split(part, ' ');
      if (items[0] === 'inset') items = items.slice(1);
      const tint = items.pop();
      return (
        !!tint &&
        color(tint) &&
        items.length >= 2 &&
        items.length <= 4 &&
        items.every((item, i) => length(item, i !== 2, false))
      );
    })
  );
}
/**
 * Validates a reference-expanded value against the catalog category.
 *
 * This restricted, SSR-safe grammar accepts no resource loading or arbitrary
 * declarations. TokenNormalizer rejects unsafe source syntax before this stage;
 * ThemeTokenValidator resolves var() references before checking value kinds.
 *
 * @param value - Literal or expanded token value with references resolved.
 * @param kind - Grammar selected by the token catalog.
 * @returns Whether the value belongs to the supported subset of that grammar.
 */
export function validThemeValue(value: string, kind: ThemeValueKind): boolean {
  switch (kind) {
    // Contextual component values include shorthands, grid tracks and transforms.
    // Validate declaration syntax without imposing a misleading scalar grammar.
    case 'css': {
      let depth = 0,
        quote = '';
      for (const char of value) {
        if (quote) {
          if (char === quote) quote = '';
          continue;
        }
        if (char === '"' || char === "'") {
          quote = char;
          continue;
        }
        if (char === '(' && ++depth > 12) return false;
        if (char === ')' && --depth < 0) return false;
        if (!/[\w\s#.,%+*/:!()\[\]|=-]/.test(char)) return false;
      }
      return !quote && depth === 0 && !/\bvar\s*\(/i.test(value);
    }
    case 'color':
      return color(value);
    case 'length':
      return length(value);
    case 'tracking':
      return length(value, true, false);
    case 'lineHeight':
      return scalar(value, 0.01) || length(value);
    case 'weight':
      return scalar(value, 1, 1000);
    case 'duration': {
      const match = /^(.*?)(ms|s)$/.exec(value);
      return !!match && scalar(match[1]!, 0);
    }
    case 'family':
      return value
        .split(',')
        .every(
          (part) =>
            /^(?:"[^"\\]+"|'[^'\\]+'|[a-zA-Z][a-zA-Z0-9 -]*)$/.test(
              part.trim()
            ) &&
            !/^(inherit|initial|unset|revert|revert-layer)$/i.test(part.trim())
        );
    case 'shadow':
      return shadow(value);
    case 'filter': {
      if (value === 'none') return true;
      const parts = split(value, ' ');
      return (
        parts.length > 0 &&
        parts.every((part) => {
          const match = /^(blur|saturate|brightness)\((.*)\)$/.exec(part);
          return (
            !!match &&
            (match[1] === 'blur'
              ? length(match[2]!, false, false)
              : /%$/.test(match[2]!) && scalar(match[2]!.slice(0, -1), 0, 1000))
          );
        })
      );
    }
    case 'ease': {
      if (
        /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(
          value
        )
      )
        return true;
      const bezier = /^cubic-bezier\((.*)\)$/.exec(value);
      if (bezier) {
        const parts = split(bezier[1]!, ',');
        return (
          parts.length === 4 &&
          parts.every((part, i) =>
            scalar(
              part,
              i % 2 === 0 ? 0 : -Infinity,
              i % 2 === 0 ? 1 : Infinity
            )
          )
        );
      }
      return (
        /^steps\([1-9]\d{0,3},\s*(start|end|jump-start|jump-end|jump-none|jump-both)\)$/.test(
          value
        ) && !/^steps\(1,\s*jump-none\)$/.test(value)
      );
    }
  }
}
