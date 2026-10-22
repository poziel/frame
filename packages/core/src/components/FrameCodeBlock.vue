<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import FrameButton from "./FrameButton.vue";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import { codeStartLine, plainCodeLines, type FrameCodeBlockProps } from "../frame/codeBlock";
import { CodeBlockTheme, codeBlockThemeOptions } from "../frame/codeThemes";
import type { CodeHighlight } from "../frame/codeHighlight";

const props = withDefaults(defineProps<FrameCodeBlockProps>(), { language: "text", theme: CodeBlockTheme.DarkPlus, lineNumbers: false, highlightOnHover: true, highlightedLines: () => [], startLine: 1, wrap: false, copyable: true, label: "Code block" });
const emit = defineEmits<{ error: [error: unknown] }>();
const root = ref<HTMLElement>();
const result = shallowRef<CodeHighlight>();
const busy = ref(false), copied = ref("");
const lines = computed(() => result.value?.lines ?? plainCodeLines(props.code));
const first = computed(() => codeStartLine(props.startLine));
const highlighted = computed(() => new Set(props.highlightedLines));
const style = computed(() => {
  const light = codeBlockThemeOptions.find(theme => theme.value === props.theme)?.type === "light";
  return { backgroundColor: result.value?.background ?? (light ? "#fff" : "#1e1e1e"), color: result.value?.foreground ?? (light ? "#333" : "#d4d4d4"), "--frame-code-gutter": result.value?.gutter ?? (light ? "#666" : "#858585"), "--frame-code-digits": String(String(first.value + lines.value.length - 1).length) };
});
watch(() => [props.code, props.language, props.theme] as const, async ([code, language, theme], _old, onCleanup) => {
  let cancelled = false;
  onCleanup(() => { cancelled = true; });
  result.value = undefined; copied.value = ""; busy.value = true;
  try {
    const { highlightCode } = await import("../frame/codeHighlight");
    const next = await highlightCode(code, language, theme);
    if (!cancelled) result.value = next;
  } catch (error) { if (!cancelled) emit("error", error); }
  finally { if (!cancelled) busy.value = false; }
}, { immediate: true });
async function copy() {
  try { await navigator.clipboard.writeText(props.code); copied.value = "Copied"; }
  catch { copied.value = "Select the code to copy it."; }
}
</script>
<template>
  <section ref="root" class="frame-code-block" :class="{ 'highlight-on-hover': highlightOnHover, 'with-line-numbers': lineNumbers, 'wrap-lines': wrap }" :style="style" :aria-label="label" :aria-busy="busy" :data-theme="theme">
    <header v-if="copyable" class="frame-code-toolbar"><span>{{ language }}</span><span class="frame-code-copy-status" role="status">{{ copied }}</span><FrameButton aria-label="Copy code" @click="copy">Copy code</FrameButton></header>
    <pre ref="pre" class="frame-code-source" tabindex="0" :aria-label="`${label} source`"><code><span v-for="(line, index) in lines" :key="index" class="frame-code-line" :class="{ 'is-highlighted': highlighted.has(first + index) }" :data-line="first + index"><span v-if="lineNumbers" class="frame-code-gutter" aria-hidden="true" :data-number="first + index"/><span class="frame-code-content"><span v-for="(token, tokenIndex) in line" :key="tokenIndex" class="frame-code-token" :style="'color' in token ? { color: token.color, fontStyle: (token.fontStyle ?? 0) & 1 ? 'italic' : undefined, fontWeight: (token.fontStyle ?? 0) & 2 ? 'bold' : undefined, textDecoration: (token.fontStyle ?? 0) & 4 ? 'underline' : undefined } : undefined">{{ token.content }}</span></span></span></code></pre>
    <OverlayScrollbars :root="root"/>
  </section>
</template>
<style scoped>
.frame-code-block { display: flex; flex-direction: column; min-width: var(--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-min-width, 0); overflow: hidden; border: 1px solid var(--frame-line, #333); border-radius: var(--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-border-radius, var(--frame-panel-radius, 7px)); font: var(--frame-span-span-span-code-pre-OverlayScrollbars-root-root-section-template-style-scoped-frame-code-block-font, var(--frame-font-size-body, 12px)/1.7 var(--frame-font-mono, Consolas, monospace)); }
.frame-code-toolbar { display: flex; align-items: center; gap: var(--frame-code-toolbar-gap, 12px); padding: var(--frame-code-toolbar-padding, 4px 8px 4px 14px); border-bottom: var(--frame-code-toolbar-border-bottom, 1px solid color-mix(in srgb, currentColor 16%, transparent)); font: var(--frame-code-toolbar-font, 11px/1.5 var(--frame-font-body, "Segoe UI", sans-serif)); }
.frame-code-copy-status { margin-left: auto; }
.frame-code-toolbar :deep(button) { color: inherit; }
pre.frame-code-source { flex: 1; min-height: var(--frame-pre-frame-code-source-min-height, 0); overflow: auto; margin: var(--frame-pre-frame-code-source-margin, 0); padding: var(--frame-pre-frame-code-source-padding, 12px 0); border: var(--frame-pre-frame-code-source-border, 0); background: var(--frame-pre-frame-code-source-background, transparent); color: inherit; font: inherit; tab-size: 2; outline-offset: var(--frame-pre-frame-code-source-outline-offset, -2px); border-radius: var(--frame-pre-frame-code-source-border-radius, 0); }
.frame-code-source code { display: block; min-width: var(--frame-code-source-code-min-width, max-content); font: inherit; }
.frame-code-line { display: flex; min-height: var(--frame-code-line-min-height, 1.7em); padding: var(--frame-code-line-padding, 0 14px); }
.frame-code-content { white-space: pre; }
.frame-code-gutter { flex: 0 0 calc((var(--frame-code-digits) + 1) * 1ch); margin-right: var(--frame-code-gutter-margin-right, 18px); color: var(--frame-code-gutter); opacity: var(--frame-code-gutter-opacity, .8); text-align: right; user-select: none; }
.frame-code-gutter::before { content: attr(data-number); }
.highlight-on-hover .frame-code-line:hover { background: var(--frame-highlight-on-hover-frame-code-line-hover-background, color-mix(in srgb, currentColor 7%, transparent)); }
.frame-code-line.is-highlighted { background: var(--frame-code-line-is-highlighted-background, color-mix(in srgb, currentColor 12%, transparent)); box-shadow: inset 2px 0 var(--frame-accent, #0078d4); }
.wrap-lines .frame-code-source code { min-width: var(--frame-wrap-lines-frame-code-source-code-min-width, 0); }
.wrap-lines .frame-code-content { white-space: pre-wrap; overflow-wrap: anywhere; min-width: var(--frame-wrap-lines-frame-code-content-min-width, 0); }
</style>
