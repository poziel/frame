<script setup lang="ts">
import { reactive, useId } from "vue";
import type { Component } from "vue";
import type { PanelAction } from "../types";
import PanelActions from "./PanelActions.vue";
import ResizeHandle from "./ResizeHandle.vue";
defineProps<{ sections: readonly { id: string; title: string; component: Component; props?: Record<string, unknown>; actions?: readonly PanelAction[]; collapsed?: boolean; padded?: boolean }[] }>();
const uid = useId();
const closed = reactive<Record<string, boolean>>({}); const heights = reactive<Record<string, number>>({});
</script>
<template><div class="panel-sections"><section v-for="(section, index) in sections" :key="section.id" class="panel-section"><header><button class="section-toggle" :aria-expanded="!(closed[section.id] ?? section.collapsed)" :aria-controls="`${uid}-section-${section.id}`" @click="closed[section.id] = !(closed[section.id] ?? section.collapsed)"><span>{{ (closed[section.id] ?? section.collapsed) ? '›' : '⌄' }}</span>{{ section.title }}</button><PanelActions :actions="section.actions"/></header><div v-show="!(closed[section.id] ?? section.collapsed)" :id="`${uid}-section-${section.id}`" class="accordion-content" :class="{ unpadded: section.padded === false }" :style="{ height: `${heights[section.id] ?? 180}px` }"><component :is="section.component" v-bind="section.props"/></div><ResizeHandle v-if="index < sections.length - 1 && !(closed[section.id] ?? section.collapsed)" axis="y" :label="`Resize ${section.title}`" :value="heights[section.id] ?? 180" :min="60" :max="800" @change="heights[section.id] = $event" @reset="heights[section.id] = 180"/></section></div></template>
