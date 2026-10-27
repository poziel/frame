<script setup lang="ts">
import PreferencesHeaderActions from './PreferencesHeaderActions.vue';

defineProps<{inModal?: boolean}>();
</script>
<template>
  <PreferencesHeaderActions kind="settings" :in-modal="inModal" />
</template>
