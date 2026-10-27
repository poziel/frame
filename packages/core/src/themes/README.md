# Theme infrastructure

Theme selection is instance-owned. Parsing uses operation-local state, while
token catalogs are shared immutable data. Hosts own import UI and persistence; presets live in
`packages/themes` and component styles stay beside their components.

```text
themes/
  theme.ts                         Public contracts and definition/import helpers
  runtime/
    frameThemeController.ts        Selection, registrations, and owned surfaces
    themeAttachment.ts             One DOM scope and reversible style writes
  parsing/
    documentFormats.ts             JSON/JSONC/JSON5/YAML/TOML/INI readers
    tokenNormalizer.ts             Nested/dotted paths and input bounds
    themeTokenValidator.ts         Reference expansion, cycle checks, value validation
    cssValues.ts                   Restricted CSS grammar by token category
    frameThemeError.ts             Path-aware errors and shared input guards
  tokens/
    tokenCatalog.ts                Combined catalog, types, and CSS generation
    shellDefaults.ts               Hand-maintained shell default definitions
  generated/
    componentTokens.ts             Component variable inventory
    default.css                    Shared default declarations
```

## Why these boundaries exist

`theme.ts` coordinates definition validation and imports. `TokenNormalizer` owns
per-document traversal bounds and ancestor tracking. `ThemeTokenValidator` owns
reference-expansion caches and cycle detection. Their state is isolated to each
validation operation, with properties declared before documented methods. The parsing
stages remain separate because document syntax, token paths, and CSS grammar
have different responsibilities. CSS validation is a substantial grammar, not a
small helper suitable for inlining. Error guards live beside `FrameThemeError`
rather than in a separate two-function file.

`tokenCatalog.ts` combines foundation defaults, shell defaults, and generated
component names. It also owns the public token-name types and CSS rendering.
`shellDefaults.ts` is curated source data, not generated output. Keeping this
large dataset separate makes the catalog's composition and type logic readable.
Neither file needs a static-only class or per-instance state.

`FrameThemeController` owns runtime selection, registrations, and disposal.
`ThemeAttachment` owns reversible writes to one element. Their lifetimes differ,
so they remain separate classes. Selection validates before replacement; detach
preserves later host writes and disposal releases every owned attachment.
Construction and parsing are SSR-safe; DOM work starts with explicit attachment.

## Generation and public imports

From `packages/core`, run `bun run tokens:generate`. The component inventory
script scans maintained component and module sources; the CSS generator renders
the hand-maintained catalog. Never edit `generated/` directly. The inventory can
be checked with `bun scripts/generate-component-tokens.ts --check`.

Core still exports the stylesheet as `@frame/core/tokens.css`; its package export
points into `generated/`. Public TypeScript exports remain in `../index.ts`.
Internal imports, docs extraction, packaging checks, and fixtures use the new
source paths directly; no compatibility files duplicate the old layout.
