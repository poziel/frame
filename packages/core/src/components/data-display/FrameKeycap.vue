<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ shortcut?: string }>();
const keys = computed(() => {
  if (!props.shortcut) return [];
  const parts = props.shortcut.split('+');
  if (props.shortcut.endsWith('+')) { parts.splice(-2); parts.push('+'); }
  return parts.filter(Boolean);
});
</script>
<template><span v-if="keys.length" class="frame-keycap" role="group" :aria-label="shortcut"><template v-for="(key, index) in keys" :key="index"><span v-if="index" class="frame-keycap-join" aria-hidden="true">+</span><kbd aria-hidden="true">{{ key }}</kbd></template></span></template>
<style scoped>
.frame-keycap{display:inline-flex;align-items:center;gap:var(--frame-keycap-gap,4px);white-space:nowrap;font-size:var(--frame-keycap-font-size,11px);line-height:1.4}
.frame-keycap kbd{display:inline-block;min-width:1em;text-align:center;padding:var(--frame-keycap-padding,0 6px);border:1px solid var(--frame-keycap-border,#444444);border-radius:var(--frame-keycap-radius,3px);background:var(--frame-keycap-background,#2d2d2d);color:var(--frame-keycap-color,#cccccc);font-family:inherit;box-shadow:var(--frame-keycap-shadow,0 1px 0 var(--frame-border-color))}
.frame-keycap-join{color:var(--frame-muted)}
</style>
