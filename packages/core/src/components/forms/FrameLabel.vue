<script setup lang="ts">
import {Label} from 'reka-ui';
import './shared/controls.css';

defineProps<{
  /** Id of the form control associated with this label. */
  for?: string;
}>();

defineSlots<{
  /** Visible label content. */
  default?(): unknown;
}>();
</script>
<template>
  <Label class="frame-label" :for="for"><slot /></Label>
</template>
