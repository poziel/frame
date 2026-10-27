# Third-party notices

## Confbox

Confbox (https://github.com/unjs/confbox) parses JSON, JSONC, JSON5, YAML, TOML and INI theme files. Its MIT license and bundled parser notices are collected in confbox.txt. Retain that file when distributing Frame. Regenerate it with `bun packages/core/scripts/collect-confbox-licenses.ts` after dependency updates.

## Shiki

Shiki (https://github.com/shikijs/shiki) provides code syntax highlighting, language grammars, and themes. The viewer uses its JavaScript regular expression engine. Retain shiki.txt, which includes the installed dependency licenses, when distributing Frame. Regenerate it with `bun packages/core/scripts/collect-shiki-licenses.ts` after dependency updates.

## Microsoft Codicons

The Codicons artwork is by Microsoft Corporation, from https://github.com/microsoft/vscode-codicons, distributed through @iconify-json/codicon. Licensed under Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/ . Original artwork is used without path modifications; size and color are controlled by Frame. No Microsoft endorsement is implied.

Retain this attribution and the accompanying license when distributing Frame or applications containing these icons. This license does not grant trademark or patent rights. It does not require your application source code to be open source.

## Iconify for Vue

@iconify/vue is MIT licensed. See its bundled license. Additional icon packs are separately licensed; check the selected collection before distributing its artwork.

## LDRS

LDRS by Griffin Johnston (https://github.com/GriffinJohnston/ldrs) is MIT licensed. Frame uses its unmodified web components for loading animations. Retain the accompanying ldrs.txt license when distributing Frame.
## Reka UI

Reka UI (https://github.com/unovue/reka-ui) supplies Frame's accessible form interaction primitives. Its MIT license and the installed dependency licenses, including the internationalized date/number packages, are collected in reka-ui.txt. Retain that file when distributing Frame. Regenerate with `bun packages/core/scripts/collect-reka-licenses.ts` after dependency updates.

## Core modules

Core modules integrate Monaco Editor (`monaco-editor.txt`, `monaco-third-party.txt`), Shiki Monaco (`shiki-monaco.txt`), and xterm with its fit, search, and web-links addons (`xterm.txt`, `xterm-fit.txt`, `xterm-search.txt`, `xterm-web-links.txt`). Retain these notices when distributing applications using those modules. PDF.js and Markdown-it are Apache-2.0 and MIT licensed respectively; their license texts accompany Core as `pdfjs.txt` and `markdown-it.txt`.
