<script setup lang="ts">
import FrameIcon from "./FrameIcon.vue";
defineProps<{ visible: boolean }>();
</script>
<template><FrameIcon class="visibility-indicator" :name="visible ? 'eye' : 'eye-closed'" :size="15"/></template>
