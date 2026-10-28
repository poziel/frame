<script setup lang="ts">
const {label = 'Hello', count = 2} = defineProps<{
  /** Heading fallback. */
  label?: string;
  /** Initial count. */
  count?: number;
}>();
</script>
<template>
  <span>{{ label }} {{ count }}</span>
</template>
