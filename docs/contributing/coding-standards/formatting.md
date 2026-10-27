# Formatting and checks

Use the project commands as the complete formatter. The pinned Prettier version
handles TypeScript, JavaScript, Vue, HTML, CSS/SCSS, JSON, YAML, and Markdown.
Project syntax-aware passes then restore the agreed class/interface spacing
and parameter layout in TypeScript, JavaScript, and Vue scripts.

The pipeline is deliberately layered rather than a new language printer:

1. Read `.prettierrc.json`, including language-specific overrides.
2. Apply baseline language-aware formatting.
3. Restore blank lines around class/interface members and declarations.
4. Apply the six-parameter/80-column signature rule.
5. Compare the final result or write it, depending on the command.

Write and check modes use exactly the same pipeline. Running it twice must
produce the same result. The parameter pass also verifies that its changes
preserve syntax-tree structure and literal tokens.

## Commands

```sh
# Format changed staged, unstaged, and untracked files.
bun run format

# Check the same files without writing.
bun run check:format

# Check formatting and Core TypeScript correctness.
bun run check

# Explicit files or directories.
bun run format -- scripts/sourceFormatter.ts docs/contributing/coding-standards

# Whole maintained workspace, including the companion when available.
bun run format -- --all
bun run check:format -- --all
```

The root commands include active frame-native sources when the companion is
available. Explicit paths replace automatic workspace selection. A workspace
without its own Git metadata uses its maintained files
as the default scope. Archives and extracted recovery trees are always excluded.
For CI, use `bun run check:format -- --all` rather than relying on a clean Git
checkout to identify changed files.

`bun run check:types` only checks Core types. Tests, documentation builds,
module boundaries, and built-package consumers remain separate checks. Build
the library before `bun run check:consumer`. A formatting check does not prove
runtime behavior or that every documented review convention has been followed.

## Configuration and editors

`.editorconfig` defines basic text conventions. `.prettierrc.json` defines the
baseline formatter options; `.prettierignore` excludes generated and external
artifacts. The command also skips generated-file headers, dependency trees,
build outputs, lockfiles, vendored licenses, archives, and recovery copies.
Handwritten declaration files are editable; generated declarations under build
output directories are not.

Use the project command or a chained editor task for final formatting. A stock
Prettier editor extension reads the baseline options but cannot apply the
project's additional passes. Do not use its output as the final authority or
configure an unrelated formatter to overwrite the agreed layout on save.

Vue scripts and styles are formatted as part of their SFC. Markdown code blocks
are deliberately left untouched by embedded formatting so documentation
examples do not acquire a conflicting style. Authors still write examples
according to the language guides. CSS declaration order is preserved.

## Migration scope

Change formatter behavior through the shared pipeline and its tests, not by
adding another public command for each individual rule. The old parameter-only
commands have been replaced by `format` and `check:format`; their implementation
remains an internal stage. Use explicit paths for a focused change and `--all`
for an intentional repository-wide style migration.

Do not mix a whole-repository formatting migration with an unrelated behavior
change. Formatting rules are in effect for new and edited code; inherited style
debt should be migrated deliberately. Changes to component sources may require
`bun run docs:contracts` to refresh source-derived documentation snapshots.
