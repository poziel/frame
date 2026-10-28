<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{text: string; query: string}>();
const segments = computed(() => {
  const needle = props.query.trim().toLowerCase();
  if (!needle) return [{text: props.text, match: false}];
  const text = props.text.toLowerCase(),
    parts: {text: string; match: boolean}[] = [];
  let offset = 0,
    index: number;
  while ((index = text.indexOf(needle, offset)) !== -1) {
    if (index > offset)
      parts.push({text: props.text.slice(offset, index), match: false});
    parts.push({
      text: props.text.slice(index, index + needle.length),
      match: true,
    });
    offset = index + needle.length;
  }
  if (offset < props.text.length)
    parts.push({text: props.text.slice(offset), match: false});
  return parts;
});
</script>
<template>
  <template v-for="(segment, index) in segments" :key="index"
    ><strong v-if="segment.match" class="quick-input-match">{{
      segment.text
    }}</strong
    ><template v-else>{{ segment.text }}</template></template
  >
</template>

<style lang="scss">
/* Literal search matches stay legible on keyboard and pointer selections. */
.quick-input-match {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  color: var(--frame-accent);
  font-weight: 700;
}

.command-result:is(.active, :hover, [data-highlighted]) .quick-input-match {
  color: inherit;
}
</style>
