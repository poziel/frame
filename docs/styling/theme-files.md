# Theme files and token paths

Frame accepts **JSON, JSONC, JSON5, YAML, TOML and INI** theme files using Confbox. YAML also accepts the `.yml` extension. The syntax changes; the tokens and their behavior do not. CSS stylesheets continue to work through normal stylesheet imports.

## Import files or text

```ts
import { parseTheme, parseThemeFile, themeFormats } from '@frame/core';

// A browser File from your upload/drop handler, or a host adapter with name/size/text().
async function importTheme(file: File) {
  frame.theme.set(await parseThemeFile(file, {
    id: 'application', name: 'Application theme', appearance: 'dark',
  }));
}

// For text supplied by a native backend, fetch(), or an editor:
frame.theme.set(parseTheme(text, { format: 'toml', id: 'application' }));
console.log(themeFormats); // json, jsonc, json5, yaml, toml, ini
```

`parseThemeFile` chooses the format from the filename extension (case-insensitive), or an explicit `format` option. `parseTheme` defaults to JSON; supply `format` for other formats. Neither API applies a theme, opens a picker, downloads a resource, or saves preferences. Native hosts read paths themselves and pass the text or a file adapter. Unsupported extensions fail with the supported-format list. XML, executable JS/TS and arbitrary markup are not accepted by this importer.

## One token, several spellings

The CSS variable `--frame-text-input-padding` is the token path `frame.text.input.padding`. Remove `--` and replace each hyphen with a dot. Case is preserved for compatibility with existing CSS names. Every Frame CSS variable in Core and Features has a token, including variables with contextual fallbacks. `themeTokens` exposes the complete catalog; `FrameTokenPath` provides the corresponding dotted-path type.

These bare JSON documents all mean the same thing:

```json
{ "frame": { "text": { "input": { "padding": "24px" } } } }
```

```json
{ "frame.text": { "input.padding": "24px" } }
```

```json
{ "frame.text.input.padding": "24px" }
```

Existing CSS variable keys also remain valid: `{ "--frame-text-input-padding": "24px" }`. `defineTheme({ version: 1, id, name, appearance: 'dark', tokens })` accepts the same nested/mixed/dotted token tree when authoring TypeScript.

## Equivalent file formats

JSONC supports comments and trailing commas:

```jsonc
{
  // More room inside text inputs.
  "frame.text.input.padding": "24px",
}
```

JSON5 also permits single-quoted strings and unquoted identifiers:

```json5
{ frame: { text: { input: { padding: '24px' } } } }
```

YAML:

```yaml
frame:
  text:
    input:
      padding: 24px
```

TOML:

```toml
[frame.text.input]
padding = "24px"
```

INI:

```ini
[frame.text.input]
padding = 24px
```

Quote color values and values such as `0`, `true` or `1.5` when the format would otherwise parse them as non-string values. Token leaves are CSS strings in every format. Objects group paths; arrays do not represent token paths and are rejected.

## Metadata and compatibility

Bare token documents use `id: 'custom'`, `name: 'Custom'`, and `appearance: 'dark'`. Supply metadata in the parser options, or use a version-1 envelope in any supported format. An envelope's metadata takes precedence over caller defaults:

```json
{
  "version": 1,
  "id": "spacious",
  "name": "Spacious",
  "appearance": "dark",
  "tokens": { "frame.text.input.padding": "24px" }
}
```

The equivalent TOML envelope uses root metadata followed by `[tokens.frame.text.input]`. INI uses the same section and normalizes `version = 1` to schema version 1. Existing version-1 files with `--frame-*` keys need no migration. The validated runtime `FrameTheme.tokens` remains a flat CSS-variable map so existing consumers continue to work.

Two keys that normalize to the same variable are rejected, even when their values match. This catches accidental combinations of nested, dotted and CSS spellings. Duplicate identical source keys may already be collapsed or rejected by the underlying format parser; do not rely on source-key repetition. Unknown tokens and cyclic trees are rejected. Imports are bounded to 128 KiB, 48 nested object levels and 8192 entries; YAML aliases are bounded too.

Shared tokens retain their typed color/length/font/etc. validation. Component-specific tokens accept resource-free CSS declaration values, including multi-value padding, grid tracks and transforms; the browser decides whether a value is valid for its property. No theme file can load a font or execute code. Supply fonts through host-controlled assets/FontFace or a CSS stylesheet. See [validation and precedence](theme-variables.md#import-contract-and-validation).

## Defaults and maintenance

Shared defaults are generated into `themes/generated/default.css`. Component tokens deliberately retain their defaults at the point of use in CSS (or in runtime layout state), so an omitted component token does not change inheritance or appearance. Selecting a replacement theme removes prior component overrides; reset restores inherited styling and previous host-owned inline values. Theme overrides do not supersede props or layout measurements that are written directly on a descendant element.

The build inventories token names from Core and Features sources. Run `bun run --cwd packages/core tokens:generate` after adding a variable; `tokens:check` and the coverage test detect catalog drift. Do not edit generated `componentTokens.ts` directly. Exposing token names for optional Features adds no Features implementation or runtime dependency to Core.
