<script setup lang="ts">
import { inject } from 'vue';
import { documentationTabKey } from './documentation/context';
import { useFrame } from "@frame/core";
import { openApiReference } from "./apiNavigation";
const props = defineProps<{ name: string; label?: string }>();
const frame = useFrame();
const currentTab=inject(documentationTabKey,undefined);
</script>
<template><a :href="`#/api/${name}`" @click.prevent="openApiReference(frame, name, true, currentTab ? { initialTab: currentTab() } : {})">{{ label ?? `${name} reference` }}</a></template>
