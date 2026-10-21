<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>
<template>
  <div class="sample-content">
    <h3>Workspace activity</h3><p>Local session · Interaction studio</p>
    <button class="sample-button" @click="count++">Click count: {{ count }}</button>
    <p v-for="row in 6" :key="row" class="sample-row">Workspace event {{ String(row).padStart(2, '0') }} <span>Ready</span></p>
  </div>
</template>
