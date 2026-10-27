<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { FrameButton, FrameTextField } from '@frame/core';
const colors = [
  ['Frame blue', '#0078D4'], ['Iris purple', '#8066CC'], ['Periwinkle', '#7485D6'],
  ['Muted violet', '#996AC7'], ['Amethyst', '#9163CB'], ['Indigo', '#6469C4'],
  ['Lavender', '#9B83D0'], ['Orchid', '#AD70AD'], ['Rosewood', '#B56D86'],
  ['Dusty rose', '#B87378'], ['Terracotta', '#B8735B'], ['Copper', '#B87550'],
  ['Ochre', '#B28D43'], ['Olive gold', '#99904C'], ['Sage', '#7D9970'],
  ['Jade', '#479478'], ['Muted teal', '#368F87'], ['Deep turquoise', '#328D99'],
  ['Slate cyan', '#528FA6'], ['Steel blue', '#6587B5'],
] as const;
const root = document.documentElement;
const original = ['--frame-accent', '--frame-accent-foreground', '--frame-quick-selection'].map(name => ({ name, value: root.style.getPropertyValue(name), priority: root.style.getPropertyPriority(name) }));
const initial = getComputedStyle(root).getPropertyValue('--frame-accent').trim();
const selected = ref(/^#[\da-f]{6}$/i.test(initial) ? initial.toUpperCase() : '#0078D4');
function luminance(hex: string) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
}
const foreground = computed(() => { const l = luminance(selected.value); return (l + .05) / (luminance('#181818') + .05) > 1.05 / (l + .05) ? '#181818' : '#FFFFFF'; });
const contrast = computed(() => {
  const a = luminance(selected.value), b = luminance(foreground.value);
  return ((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2);
});
function apply(color: string) {
  if (!/^#[\da-f]{6}$/i.test(color)) return;
  selected.value = color.toUpperCase();
  root.style.setProperty('--frame-accent', selected.value);
  root.style.setProperty('--frame-accent-foreground', foreground.value);
  root.style.setProperty('--frame-quick-selection', 'var(--frame-accent)');
}
function reset() {
  for (const { name, value, priority } of original) {
    if (value) root.style.setProperty(name, value, priority); else root.style.removeProperty(name);
  }
  selected.value = /^#[\da-f]{6}$/i.test(initial) ? initial.toUpperCase() : '#0078D4';
}
onBeforeUnmount(reset);
</script>
<template>
  <section class="accent-palette" aria-label="Theming">
    <h2>Accent palette</h2>
    <p>Try an accent across Frame's controls, selection, focus outlines, and top-left logo. Your choice stays while you explore this session.</p>
    <div class="accent-palette-current" aria-live="polite"><span :style="{ background: selected }" aria-hidden="true"/><strong>{{ selected }}</strong></div>
    <div class="accent-palette-colors">
      <button v-for="[name, color] in colors" :key="name" type="button" :aria-pressed="selected === color.toUpperCase()" :aria-label="`${name} ${color}`" @click="apply(color)">
        <span class="accent-palette-chip" :style="{ background: color }" aria-hidden="true"/>
        <span>{{ name }}<small>{{ color }}</small></span><span v-if="selected === color.toUpperCase()" aria-hidden="true">✓</span>
      </button>
    </div>
    <label class="accent-palette-custom">Custom accent<input type="color" :value="selected" @input="apply(($event.target as HTMLInputElement).value)"/></label>
    <FrameButton @click="reset">Reset accent</FrameButton>
    <div class="accent-palette-sample"><FrameButton variant="primary">Example action</FrameButton><FrameTextField aria-label="Accent preview input" placeholder="Focus to preview the outline"/></div>
    <p>Button text adapts for contrast ({{ contrast }}:1 against the accent). This is a palette preview; other accent uses still need review.</p>
    <p>Native window and installed app icons keep their packaged artwork. This preview changes the logo inside Frame.</p>
    <pre>:root {
  --frame-accent: {{ selected }};
  --frame-accent-foreground: {{ foreground }};
}</pre>
  </section>
</template>
<style scoped>
.accent-palette{padding:12px;display:flex;flex-direction:column;gap:14px;font-size:var(--frame-font-size-body);color:var(--frame-text)}
h2,p{margin:0}h2{font-size:15px}p{color:var(--frame-muted);line-height:1.55}
.accent-palette-current{display:flex;align-items:center;gap:8px}.accent-palette-current>span{width:18px;height:18px;border-radius:4px}
.accent-palette-colors{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:5px}
.accent-palette-colors button{display:flex;align-items:center;gap:9px;text-align:left;padding:8px;border:1px solid var(--frame-line);border-radius:var(--frame-control-radius);color:var(--frame-text);background:var(--frame-surface);font:inherit;cursor:pointer;min-width:0}
.accent-palette-colors button:hover{background:var(--frame-menu-hover)}.accent-palette-colors button[aria-pressed=true]{border-color:var(--frame-accent)}
.accent-palette-colors button:focus-visible{outline:2px solid var(--frame-accent);outline-offset:1px}
.accent-palette-chip{width:22px;height:22px;flex:none;border-radius:4px}.accent-palette-colors small{display:block;color:var(--frame-muted);font-size:10px;margin-top:3px}
.accent-palette-custom{display:flex;align-items:center;justify-content:space-between;gap:12px}.accent-palette-sample{display:flex;flex-direction:column;gap:10px;padding-block:8px}
pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.6 var(--frame-font-mono);padding:10px;background:var(--frame-canvas);border-radius:var(--frame-control-radius)}
</style>
