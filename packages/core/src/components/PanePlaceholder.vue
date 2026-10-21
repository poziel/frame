<script setup lang="ts">
import logo from "../../../../assets/frame.svg";
defineProps<{ active: boolean }>();
</script>
<template><div class="pane-placeholder" :class="{ 'is-focused': active }"><img :src="logo" alt="" draggable="false"/></div></template>
