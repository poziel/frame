<script setup lang="ts">
import { Label } from "reka-ui";
import "./shared/controls.css";

defineProps<{for?:string}>();
</script>
<template><Label class="frame-label" :for="for"><slot/></Label></template>
