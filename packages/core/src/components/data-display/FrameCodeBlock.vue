<script setup lang="ts">
import {computed, ref, shallowRef, watch} from 'vue';
import FrameButton from '../actions/FrameButton.vue';
import OverlayScrollbars from '../layout/OverlayScrollbars.vue';
import {
  codeStartLine,
  plainCodeLines,
  type FrameCodeBlockProps,
} from './codeBlock';
import {CodeBlockTheme, codeBlockThemeOptions} from './codeThemes';
import type {CodeHighlight} from './codeHighlight';

const props = withDefaults(defineProps<FrameCodeBlockProps>(), {
  language: 'text',
  theme: CodeBlockTheme.DarkPlus,
  lineNumbers: false,
  highlightOnHover: true,
  highlightedLines: () => [],
  startLine: 1,
  wrap: false,
  copyable: true,
  label: 'Code block',
});
const emit = defineEmits<{
  /** Syntax highlighting failed; the code remains available as plain text. */
  error: [error: unknown];
}>();
const root = ref<HTMLElement>();
const result = shallowRef<CodeHighlight>();
const busy = ref(false),
  copied = ref('');
const lines = computed(() => result.value?.lines ?? plainCodeLines(props.code));
const first = computed(() => codeStartLine(props.startLine));
const highlighted = computed(() => new Set(props.highlightedLines));
const style = computed(() => {
  const light =
    codeBlockThemeOptions.find((theme) => theme.value === props.theme)?.type ===
    'light';
  return {
    backgroundColor: result.value?.background ?? (light ? '#fff' : '#1e1e1e'),
    color: result.value?.foreground ?? (light ? '#333' : '#d4d4d4'),
    '--frame-code-gutter': result.value?.gutter ?? (light ? '#666' : '#858585'),
    '--frame-code-digits': String(
      String(first.value + lines.value.length - 1).length
    ),
  };
});
watch(
  () => [props.code, props.language, props.theme] as const,
  async ([code, language, theme], _old, onCleanup) => {
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });
    result.value = undefined;
    copied.value = '';
    busy.value = true;
    try {
      const {highlightCode} = await import('./codeHighlight');
      const next = await highlightCode(code, language, theme);
      if (!cancelled) result.value = next;
    } catch (error) {
      if (!cancelled) emit('error', error);
    } finally {
      if (!cancelled) busy.value = false;
    }
  },
  {immediate: true}
);
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = 'Copied';
  } catch {
    copied.value = 'Select the code to copy it.';
  }
}
</script>
<template>
  <section
    ref="root"
    class="frame-code-block"
    :class="{
      'highlight-on-hover': highlightOnHover,
      'with-line-numbers': lineNumbers,
      'wrap-lines': wrap,
    }"
    :style="style"
    :aria-label="label"
    :aria-busy="busy"
    :data-theme="theme"
  >
    <header v-if="copyable" class="frame-code-toolbar"
      ><span>{{ language }}</span
      ><span class="frame-code-copy-status" role="status">{{ copied }}</span
      ><FrameButton aria-label="Copy code" @click="copy"
        >Copy code</FrameButton
      ></header
    >
    <pre
      ref="pre"
      class="frame-code-source"
      tabindex="0"
      :aria-label="`${label} source`"
    ><code><span v-for="(line, index) in lines" :key="index" class="frame-code-line" :class="{ 'is-highlighted': highlighted.has(first + index) }" :data-line="first + index"><span v-if="lineNumbers" class="frame-code-gutter" aria-hidden="true" :data-number="first + index"/><span class="frame-code-content"><span v-for="(token, tokenIndex) in line" :key="tokenIndex" class="frame-code-token" :style="'color' in token ? { color: token.color, fontStyle: (token.fontStyle ?? 0) & 1 ? 'italic' : undefined, fontWeight: (token.fontStyle ?? 0) & 2 ? 'bold' : undefined, textDecoration: (token.fontStyle ?? 0) & 4 ? 'underline' : undefined } : undefined">{{ token.content }}</span></span></span></code></pre>
    <OverlayScrollbars :root="root" />
  </section>
</template>
<style lang="scss" scoped>
.frame-code-block {
  display: flex;
  flex-direction: column;
  /* Minimum width for .frame-code-block. @token --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width */
  --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width-bce56793b9: 0;
  min-width: var(
    --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width,
    var(
      --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width-bce56793b9
    )
  );
  overflow: hidden;
  /* Border for .frame-code-block. @token --frame-line */
  --_frame-default-line-b8a143df52: #333;
  border: 1px solid var(--frame-line, var(--_frame-default-line-b8a143df52));
  /* Corner radius for .frame-code-block. @token --frame-panel-radius */
  --_frame-default-panel-radius-eda9823db5: 7px;
  /* Corner radius for .frame-code-block. @token --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius */
  --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius-e605194010: var(
    --frame-panel-radius,
    var(--_frame-default-panel-radius-eda9823db5)
  );
  border-radius: var(
    --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius,
    var(
      --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius-e605194010
    )
  );
  /* Value of font for .frame-code-block. @token --frame-font-size-body */
  --_frame-default-font-size-body-5e0c1e1e0a: 12px;
  /* Value of font for .frame-code-block. @token --frame-font-mono */
  --_frame-default-font-mono-4ab5cb5fd0: Consolas, monospace;
  /* Value of font for .frame-code-block. @token --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font */
  --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font-3c907872c4: var(
      --frame-font-size-body,
      var(--_frame-default-font-size-body-5e0c1e1e0a)
    )/1.7
    var(--frame-font-mono, var(--_frame-default-font-mono-4ab5cb5fd0));
  font: var(
    --frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font,
    var(
      --_frame-default-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font-3c907872c4
    )
  );
}
.frame-code-toolbar {
  display: flex;
  align-items: center;
  /* Space between children for .frame-code-toolbar. @token --frame-code-toolbar-gap */
  --_frame-default-code-toolbar-gap-9b4d64770d: 12px;
  gap: var(
    --frame-code-toolbar-gap,
    var(--_frame-default-code-toolbar-gap-9b4d64770d)
  );
  /* Internal spacing for .frame-code-toolbar. @token --frame-code-toolbar-padding */
  --_frame-default-code-toolbar-padding-7e003415a4: 4px 8px 4px 14px;
  padding: var(
    --frame-code-toolbar-padding,
    var(--_frame-default-code-toolbar-padding-7e003415a4)
  );
  /* Bottom border for .frame-code-toolbar. @token --frame-code-toolbar-border-bottom */
  --_frame-default-code-toolbar-border-bottom-b3690a3a18: 1px solid
    color-mix(in srgb, currentColor 16%, transparent);
  border-bottom: var(
    --frame-code-toolbar-border-bottom,
    var(--_frame-default-code-toolbar-border-bottom-b3690a3a18)
  );
  /* Value of font for .frame-code-toolbar. @token --frame-font-body */
  --_frame-default-font-body-1e270f4103: 'Segoe UI', sans-serif;
  /* Value of font for .frame-code-toolbar. @token --frame-code-toolbar-font */
  --_frame-default-code-toolbar-font-1ba6860a5d: 11px/1.5
    var(--frame-font-body, var(--_frame-default-font-body-1e270f4103));
  font: var(
    --frame-code-toolbar-font,
    var(--_frame-default-code-toolbar-font-1ba6860a5d)
  );
}
.frame-code-copy-status {
  margin-left: auto;
}
.frame-code-toolbar :deep(button) {
  color: inherit;
}
pre.frame-code-source {
  flex: 1;
  /* Minimum height for pre.frame-code-source. @token --frame-pre-frame-code-source-min-height */
  --_frame-default-pre-frame-code-source-min-height-9f534c4dad: 0;
  min-height: var(
    --frame-pre-frame-code-source-min-height,
    var(--_frame-default-pre-frame-code-source-min-height-9f534c4dad)
  );
  overflow: auto;
  /* Outer spacing for pre.frame-code-source. @token --frame-pre-frame-code-source-margin */
  --_frame-default-pre-frame-code-source-margin-3be73978ed: 0;
  margin: var(
    --frame-pre-frame-code-source-margin,
    var(--_frame-default-pre-frame-code-source-margin-3be73978ed)
  );
  /* Internal spacing for pre.frame-code-source. @token --frame-pre-frame-code-source-padding */
  --_frame-default-pre-frame-code-source-padding-41c845dd76: 12px 0;
  padding: var(
    --frame-pre-frame-code-source-padding,
    var(--_frame-default-pre-frame-code-source-padding-41c845dd76)
  );
  /* Border for pre.frame-code-source. @token --frame-pre-frame-code-source-border */
  --_frame-default-pre-frame-code-source-border-7b903a72e7: 0;
  border: var(
    --frame-pre-frame-code-source-border,
    var(--_frame-default-pre-frame-code-source-border-7b903a72e7)
  );
  /* Background for pre.frame-code-source. @token --frame-pre-frame-code-source-background */
  --_frame-default-pre-frame-code-source-background-885a3816e6: transparent;
  background: var(
    --frame-pre-frame-code-source-background,
    var(--_frame-default-pre-frame-code-source-background-885a3816e6)
  );
  color: inherit;
  font: inherit;
  tab-size: 2;
  /* Outline offset for pre.frame-code-source. @token --frame-pre-frame-code-source-outline-offset */
  --_frame-default-pre-frame-code-source-outline-offset-d9e6cb4788: -2px;
  outline-offset: var(
    --frame-pre-frame-code-source-outline-offset,
    var(--_frame-default-pre-frame-code-source-outline-offset-d9e6cb4788)
  );
  /* Corner radius for pre.frame-code-source. @token --frame-pre-frame-code-source-border-radius */
  --_frame-default-pre-frame-code-source-border-radius-82ddf5e6df: 0;
  border-radius: var(
    --frame-pre-frame-code-source-border-radius,
    var(--_frame-default-pre-frame-code-source-border-radius-82ddf5e6df)
  );
}
.frame-code-source code {
  display: block;
  /* Minimum width for .frame-code-source code. @token --frame-code-source-code-min-width */
  --_frame-default-code-source-code-min-width-83fe817d72: max-content;
  min-width: var(
    --frame-code-source-code-min-width,
    var(--_frame-default-code-source-code-min-width-83fe817d72)
  );
  font: inherit;
}
.frame-code-line {
  display: flex;
  /* Minimum height for .frame-code-line. @token --frame-code-line-min-height */
  --_frame-default-code-line-min-height-736fc8d9f5: 1.7em;
  min-height: var(
    --frame-code-line-min-height,
    var(--_frame-default-code-line-min-height-736fc8d9f5)
  );
  /* Internal spacing for .frame-code-line. @token --frame-code-line-padding */
  --_frame-default-code-line-padding-2cf8706cd1: 0 14px;
  padding: var(
    --frame-code-line-padding,
    var(--_frame-default-code-line-padding-2cf8706cd1)
  );
}
.frame-code-content {
  white-space: pre;
}
.frame-code-gutter {
  /* code digits used by code digits in .frame-code-gutter. @token --frame-code-digits @context */
  /* code gutter used by flex in .frame-code-gutter. @token --frame-code-gutter @context */
  flex: 0 0 calc((var(--frame-code-digits) + 1) * 1ch);
  /* Right outer spacing for .frame-code-gutter. @token --frame-code-gutter-margin-right */
  --_frame-default-code-gutter-margin-right-30c5e9e08c: 18px;
  margin-right: var(
    --frame-code-gutter-margin-right,
    var(--_frame-default-code-gutter-margin-right-30c5e9e08c)
  );
  color: var(--frame-code-gutter);
  /* Opacity for .frame-code-gutter. @token --frame-code-gutter-opacity */
  --_frame-default-code-gutter-opacity-1d235ff5d8: 0.8;
  opacity: var(
    --frame-code-gutter-opacity,
    var(--_frame-default-code-gutter-opacity-1d235ff5d8)
  );
  text-align: right;
  user-select: none;
}
.frame-code-gutter::before {
  content: attr(data-number);
}
.highlight-on-hover .frame-code-line:hover {
  /* Background for .highlight-on-hover .frame-code-line:hover. @token --frame-highlight-on-hover-frame-code-line-hover-background */
  --_frame-default-highlight-on-hover-frame-code-line-hover-background-2f8c11781c: color-mix(
    in srgb,
    currentColor 7%,
    transparent
  );
  background: var(
    --frame-highlight-on-hover-frame-code-line-hover-background,
    var(
      --_frame-default-highlight-on-hover-frame-code-line-hover-background-2f8c11781c
    )
  );
}
.frame-code-line.is-highlighted {
  /* Background for .frame-code-line.is-highlighted. @token --frame-code-line-is-highlighted-background */
  --_frame-default-code-line-is-highlighted-background-8305de248f: color-mix(
    in srgb,
    currentColor 12%,
    transparent
  );
  background: var(
    --frame-code-line-is-highlighted-background,
    var(--_frame-default-code-line-is-highlighted-background-8305de248f)
  );
  /* Elevation shadow for .frame-code-line.is-highlighted. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  box-shadow: inset 2px 0
    var(--frame-accent, var(--_frame-default-accent-1583861c13));
}
.wrap-lines .frame-code-source code {
  /* Minimum width for .wrap-lines .frame-code-source code. @token --frame-wrap-lines-frame-code-source-code-min-width */
  --_frame-default-wrap-lines-frame-code-source-code-min-width-90a8a777b5: 0;
  min-width: var(
    --frame-wrap-lines-frame-code-source-code-min-width,
    var(--_frame-default-wrap-lines-frame-code-source-code-min-width-90a8a777b5)
  );
}
.wrap-lines .frame-code-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  /* Minimum width for .wrap-lines .frame-code-content. @token --frame-wrap-lines-frame-code-content-min-width */
  --_frame-default-wrap-lines-frame-code-content-min-width-4c4228b4ac: 0;
  min-width: var(
    --frame-wrap-lines-frame-code-content-min-width,
    var(--_frame-default-wrap-lines-frame-code-content-min-width-4c4228b4ac)
  );
}
</style>
