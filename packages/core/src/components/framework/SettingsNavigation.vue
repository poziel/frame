<script setup lang="ts">
import { reactive } from "vue";
import type {SettingsSection} from '../../framework/settings/settings';
import FrameIcon from "../data-display/FrameIcon.vue";
defineProps<{ sections: readonly SettingsSection[]; selected: string }>();
const emit = defineEmits<{ select: [id: string] }>();
const expanded = reactive<Record<string, boolean>>({});
</script>
<template><ul class="settings-tree"><li v-for="section in sections" :key="section.id"><button class="settings-category" :class="{ selected: selected === section.id }" :aria-current="selected === section.id ? 'page' : undefined" :aria-expanded="section.children?.length ? !!expanded[section.id] : undefined" @click="emit('select', section.id); section.children?.length && (expanded[section.id] = !expanded[section.id])"><FrameIcon v-if="section.children?.length" :name="expanded[section.id] ? 'chevron-down' : 'chevron-right'"/><span v-else class="settings-disclosure-spacer"/><span>{{ section.title }}</span></button><SettingsNavigation v-if="section.children?.length" v-show="expanded[section.id]" :sections="section.children" :selected="selected" @select="emit('select', $event)"/></li></ul></template>
