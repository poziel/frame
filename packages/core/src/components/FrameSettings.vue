<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFrame } from "../frame/createFrame";
import ResizablePane from "./ResizablePane.vue";
import SettingControl from "./SettingControl.vue";
import SettingsNavigation from "./SettingsNavigation.vue";
const frame = useFrame();
const selected = ref("");
const navigationWidth = ref(210);
watch(frame.settings.allSections, sections => { if (!sections.some(section => section.id === selected.value)) selected.value = sections[0]?.id ?? ""; }, { immediate: true });
const section = computed(() => frame.settings.allSections.value.find(item => item.id === selected.value));
const error = ref("");
function update(id: string, value: string | boolean | number) { try { error.value = frame.settings.set(id, value) ? "" : "This value is not valid for the setting."; } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); } }
</script>
<template><ResizablePane v-model="navigationWidth" class="frame-settings" :min="140" :max="400" :min-second="180" label="Resize settings categories"><template #first><nav class="settings-navigation" aria-label="Settings categories"><SettingsNavigation :sections="frame.settings.sections" :selected="selected" @select="selected = $event; error = ''"/></nav></template><template #second><section class="settings-content" :aria-label="section?.title ?? 'Application settings'"><template v-if="section"><h2>{{ section.title }}</h2><p v-if="section.description" class="setting-description">{{ section.description }}</p><p v-if="error" role="alert">{{ error }}</p><SettingControl v-for="setting in section.settings" :key="setting.id" :setting="setting" :model-value="setting.getValue?.() ?? frame.settings.values[setting.id] ?? setting.default" @update:model-value="update(setting.id, $event)"/><p v-if="!section.settings?.length" class="setting-description">Choose a category to view its settings.</p></template><p v-else class="setting-description">No application settings are available.</p></section></template></ResizablePane></template>
