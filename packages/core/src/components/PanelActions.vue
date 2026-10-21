<script setup lang="ts">
import type { PanelAction } from "../types";
import FrameIconButton from "./FrameIconButton.vue";
defineProps<{ actions?: readonly PanelAction[] }>();
</script>
<template><div class="panel-actions"><FrameIconButton v-for="action in actions" :key="action.id" :label="action.label" :icon="action.icon" :disabled="action.disabled" @click="action.run"><span v-if="!action.icon">{{ action.label }}</span></FrameIconButton><slot/></div></template>
