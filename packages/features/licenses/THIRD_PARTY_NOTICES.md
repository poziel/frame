# Third-party notices

The Features bundle and its optional editor include these dependencies:

| Dependency | License | Included notice |
| --- | --- | --- |
| @xterm/xterm | MIT | xterm.txt |
| @xterm/addon-fit | MIT | xterm-fit.txt |
| @xterm/addon-search | MIT | xterm-search.txt |
| @xterm/addon-web-links | MIT | xterm-web-links.txt |
| @tauri-apps/api | MIT OR Apache-2.0 | tauri-mit.txt, tauri-apache.txt, tauri-api.spdx |
| @tauri-apps/plugin-opener | MIT OR Apache-2.0 | tauri-mit.txt, tauri-apache.txt, tauri-opener.spdx |
| monaco-editor | MIT | monaco-editor.txt, monaco-third-party.txt |
| @shikijs/monaco | MIT | shiki-monaco.txt |
| Shiki integration dependencies | MIT | shiki.txt |

Vue and Frame Core are peer dependencies. The optional Rust crate's native dependencies are declared in `tauri/Cargo.toml` and resolved by the consuming application.
