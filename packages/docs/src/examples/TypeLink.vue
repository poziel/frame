<script setup lang="ts">
import { useFrame } from "@frame/core";
import { openApiReference } from "./apiNavigation";
const props = defineProps<{ name: string; label?: string }>();
const frame = useFrame();
</script>
<template><a :href="`#/api/${name}`" @click.prevent="openApiReference(frame, name)">{{ label ?? `${name} reference` }}</a></template>
