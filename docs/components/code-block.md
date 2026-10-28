# Code Block

Read-only syntax highlighting powered by Shiki with 65 selectable themes.

## Features

### Compare syntax themes

Languages and themes load on demand. Highlighted lines use displayed numbers, including the startLine offset. Unknown languages fall back to plain text. Copy preserves the original source. This component displays code; the host owns the source text.

<!-- frame:example id="code-block.original-playground" -->

```vue
import { FrameCodeBlock, CodeBlockTheme } from '@frame/core';

<FrameCodeBlock :code="source" language="typescript"
  :theme="CodeBlockTheme.DarkPlus" :line-numbers="true"
  :highlight-on-hover="true" :highlighted-lines="[12]" :start-line="10" />
```

### Read a source example

Syntax highlighting and displayed line numbers make a read-only source excerpt easier to inspect.

<!-- frame:example id="code-block.read-source" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCodeBlock } from '@frame/core';
const demoLineNumbers = true;
</script>
<template>
<FrameCodeBlock :code="&quot;export function greet(name: string) {\n  return `Hello, ${name}`;\n}&quot;" :language="&quot;typescript&quot;" :line-numbers="demoLineNumbers" :label="&quot;Greeting source&quot;" />
</template>
```

### Emphasize lines in a review

Highlighted lines use displayed numbers, including a start-line offset from a larger source file.

<!-- frame:example id="code-block.review-lines" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCodeBlock } from '@frame/core';
const demoLineNumbers = true;
const demoStartLine = 40;
const demoHighlightedLines = [
  41
];
</script>
<template>
<FrameCodeBlock :code="&quot;const enabled = true;\nconst retries = 3;\nstart({ enabled, retries });&quot;" :language="&quot;typescript&quot;" :line-numbers="demoLineNumbers" :start-line="demoStartLine" :highlighted-lines="demoHighlightedLines" :label="&quot;Configuration excerpt&quot;" />
</template>
```

### Fit a long configuration value

Wrapping keeps a long example within its content region without altering the source copied by the toolbar.

<!-- frame:example id="code-block.wrap-config" -->

```vue
<script setup lang="ts">
import { h, ref, shallowRef, onBeforeUnmount } from 'vue';
import { FrameCodeBlock } from '@frame/core';
const demoWrap = true;
const demoCopyable = true;
</script>
<template>
<FrameCodeBlock :code="&quot;{\&quot;workspace\&quot;:\&quot;design-system\&quot;,\&quot;description\&quot;:\&quot;A workspace shared by the interface and application teams\&quot;}&quot;" :language="&quot;json&quot;" :wrap="demoWrap" :copyable="demoCopyable" :label="&quot;Workspace configuration&quot;" />
</template>
```

## APIs

<!-- frame:generated api="code-block" -->

### FrameCodeBlock

Source: `packages/core/src/components/data-display/FrameCodeBlock.vue`

#### Properties

| Name               | Type                             | Default                 | Description                                                                       |
| ------------------ | -------------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `code`             | `string`                         | Required                | Source text rendered without modification and used by the copy action.            |
| `language`         | `string \| undefined`            | "text"                  | A Shiki language name or alias. Unknown languages are displayed as plain text.    |
| `theme`            | `CodeBlockTheme \| undefined`    | CodeBlockTheme.DarkPlus | Syntax-highlighting theme applied to the code block.                              |
| `lineNumbers`      | `boolean \| undefined`           | false                   | Displays a gutter with line numbers.                                              |
| `highlightOnHover` | `boolean \| undefined`           | true                    | Highlights the code line under the pointer.                                       |
| `highlightedLines` | `readonly number[] \| undefined` | []                      | Displayed line numbers, including the startLine offset.                           |
| `startLine`        | `number \| undefined`            | 1                       | Displayed first line number; invalid values are normalized to a positive integer. |
| `wrap`             | `boolean \| undefined`           | false                   | Wraps long source lines within the available width.                               |
| `copyable`         | `boolean \| undefined`           | true                    | Displays the copy-code toolbar.                                                   |
| `label`            | `string \| undefined`            | "Code block"            | Accessible name of the code block and its source region.                          |

#### Events

| Name    | Parameters       | Return type | Description                                                           |
| ------- | ---------------- | ----------- | --------------------------------------------------------------------- |
| `error` | `error: unknown` | `void`      | Syntax highlighting failed; the code remains available as plain text. |

#### Slots

No declared entries.

#### Exposed API

No declared entries.

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="code-block" -->

| CSS variable                                                                                                               | Theme path                                                                                                               | Default expression                                                                                        | Purpose                                                                                                                                                                           | Context                                      |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width`     | `frame.span.span.span.code.pre.OverlayScrollbars.root.root.section.template.style.scoped.frame.code.block.min.width`     | `0`                                                                                                       | Minimum width for .frame-code-block.                                                                                                                                              | `.frame-code-block`                          |
| `--frame-line`                                                                                                             | `frame.line`                                                                                                             | `#333`                                                                                                    | Border for .frame-code-block.                                                                                                                                                     | `.frame-code-block`                          |
| `--frame-panel-radius`                                                                                                     | `frame.panel.radius`                                                                                                     | `7px`                                                                                                     | Corner radius for .frame-code-block. Used when --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius is unset. | `.frame-code-block`                          |
| `--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius` | `frame.span.span.span.code.pre.OverlayScrollbars.root.root.section.template.style.scoped.frame.code.block.border.radius` | `var(     --frame-panel-radius,     7px   )`                                                              | Corner radius for .frame-code-block.                                                                                                                                              | `.frame-code-block`                          |
| `--frame-font-size-body`                                                                                                   | `frame.font.size.body`                                                                                                   | `12px`                                                                                                    | Value of font for .frame-code-block. Used when --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font is unset.          | `.frame-code-block`                          |
| `--frame-font-mono`                                                                                                        | `frame.font.mono`                                                                                                        | `Consolas, monospace`                                                                                     | Value of font for .frame-code-block. Used when --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font is unset.          | `.frame-code-block`                          |
| `--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font`          | `frame.span.span.span.code.pre.OverlayScrollbars.root.root.section.template.style.scoped.frame.code.block.font`          | `var(       --frame-font-size-body,       12px     )/1.7     var(--frame-font-mono, Consolas, monospace)` | Value of font for .frame-code-block.                                                                                                                                              | `.frame-code-block`                          |
| `--frame-code-toolbar-gap`                                                                                                 | `frame.code.toolbar.gap`                                                                                                 | `12px`                                                                                                    | Space between children for .frame-code-toolbar.                                                                                                                                   | `.frame-code-toolbar`                        |
| `--frame-code-toolbar-padding`                                                                                             | `frame.code.toolbar.padding`                                                                                             | `4px 8px 4px 14px`                                                                                        | Internal spacing for .frame-code-toolbar.                                                                                                                                         | `.frame-code-toolbar`                        |
| `--frame-code-toolbar-border-bottom`                                                                                       | `frame.code.toolbar.border.bottom`                                                                                       | `1px solid     color-mix(in srgb, currentColor 16%, transparent)`                                         | Bottom border for .frame-code-toolbar.                                                                                                                                            | `.frame-code-toolbar`                        |
| `--frame-font-body`                                                                                                        | `frame.font.body`                                                                                                        | `'Segoe UI', sans-serif`                                                                                  | Value of font for .frame-code-toolbar. Used when --frame-code-toolbar-font is unset.                                                                                              | `.frame-code-toolbar`                        |
| `--frame-code-toolbar-font`                                                                                                | `frame.code.toolbar.font`                                                                                                | `11px/1.5     var(--frame-font-body, 'Segoe UI', sans-serif)`                                             | Value of font for .frame-code-toolbar.                                                                                                                                            | `.frame-code-toolbar`                        |
| `--frame-pre-frame-code-source-min-height`                                                                                 | `frame.pre.frame.code.source.min.height`                                                                                 | `0`                                                                                                       | Minimum height for pre.frame-code-source.                                                                                                                                         | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-margin`                                                                                     | `frame.pre.frame.code.source.margin`                                                                                     | `0`                                                                                                       | Outer spacing for pre.frame-code-source.                                                                                                                                          | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-padding`                                                                                    | `frame.pre.frame.code.source.padding`                                                                                    | `12px 0`                                                                                                  | Internal spacing for pre.frame-code-source.                                                                                                                                       | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-border`                                                                                     | `frame.pre.frame.code.source.border`                                                                                     | `0`                                                                                                       | Border for pre.frame-code-source.                                                                                                                                                 | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-background`                                                                                 | `frame.pre.frame.code.source.background`                                                                                 | `transparent`                                                                                             | Background for pre.frame-code-source.                                                                                                                                             | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-outline-offset`                                                                             | `frame.pre.frame.code.source.outline.offset`                                                                             | `-2px`                                                                                                    | Outline offset for pre.frame-code-source.                                                                                                                                         | `pre.frame-code-source`                      |
| `--frame-pre-frame-code-source-border-radius`                                                                              | `frame.pre.frame.code.source.border.radius`                                                                              | `0`                                                                                                       | Corner radius for pre.frame-code-source.                                                                                                                                          | `pre.frame-code-source`                      |
| `--frame-code-source-code-min-width`                                                                                       | `frame.code.source.code.min.width`                                                                                       | `max-content`                                                                                             | Minimum width for .frame-code-source code.                                                                                                                                        | `.frame-code-source code`                    |
| `--frame-code-line-min-height`                                                                                             | `frame.code.line.min.height`                                                                                             | `1.7em`                                                                                                   | Minimum height for .frame-code-line.                                                                                                                                              | `.frame-code-line`                           |
| `--frame-code-line-padding`                                                                                                | `frame.code.line.padding`                                                                                                | `0 14px`                                                                                                  | Internal spacing for .frame-code-line.                                                                                                                                            | `.frame-code-line`                           |
| `--frame-code-gutter-margin-right`                                                                                         | `frame.code.gutter.margin.right`                                                                                         | `18px`                                                                                                    | Right outer spacing for .frame-code-gutter.                                                                                                                                       | `.frame-code-gutter`                         |
| `--frame-code-gutter-opacity`                                                                                              | `frame.code.gutter.opacity`                                                                                              | `0.8`                                                                                                     | Opacity for .frame-code-gutter.                                                                                                                                                   | `.frame-code-gutter`                         |
| `--frame-code-digits`                                                                                                      | `frame.code.digits`                                                                                                      | No declared default; supplied by context.                                                                 | Digit count of the final displayed line number, computed from the starting line and highlighted or plain code lines.                                                              | `.frame-code-gutter`                         |
| `--frame-code-gutter`                                                                                                      | `frame.code.gutter`                                                                                                      | No declared default; supplied by context.                                                                 | Line-number foreground supplied by the active code highlight result, with the component choosing a light or dark fallback.                                                        | `.frame-code-gutter`                         |
| `--frame-highlight-on-hover-frame-code-line-hover-background`                                                              | `frame.highlight.on.hover.frame.code.line.hover.background`                                                              | `color-mix(     in srgb,     currentColor 7%,     transparent   )`                                        | Background for .highlight-on-hover .frame-code-line:hover.                                                                                                                        | `.highlight-on-hover .frame-code-line:hover` |
| `--frame-code-line-is-highlighted-background`                                                                              | `frame.code.line.is.highlighted.background`                                                                              | `color-mix(     in srgb,     currentColor 12%,     transparent   )`                                       | Background for .frame-code-line.is-highlighted.                                                                                                                                   | `.frame-code-line.is-highlighted`            |
| `--frame-accent`                                                                                                           | `frame.accent`                                                                                                           | `#0078d4`                                                                                                 | Elevation shadow for .frame-code-line.is-highlighted.                                                                                                                             | `.frame-code-line.is-highlighted`            |
| `--frame-wrap-lines-frame-code-source-code-min-width`                                                                      | `frame.wrap.lines.frame.code.source.code.min.width`                                                                      | `0`                                                                                                       | Minimum width for .wrap-lines .frame-code-source code.                                                                                                                            | `.wrap-lines .frame-code-source code`        |
| `--frame-wrap-lines-frame-code-content-min-width`                                                                          | `frame.wrap.lines.frame.code.content.min.width`                                                                          | `0`                                                                                                       | Minimum width for .wrap-lines .frame-code-content.                                                                                                                                | `.wrap-lines .frame-code-content`            |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
