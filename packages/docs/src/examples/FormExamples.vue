<script setup lang="ts">
import { computed, ref, watch, useId, type Component } from 'vue';
import * as Frame from '@frame/core';
import { formFamilies } from './formCatalog';
const props = defineProps<{ id: string }>();
const emit = defineEmits<{ feedback: [value: string] }>();
const disabled = ref(false), nameId = useId();
const options = [{ value: 'vue', label: 'Vue', description: 'Reactive views' }, { value: 'typescript', label: 'TypeScript' }, { value: 'legacy', label: 'Unavailable', disabled: true }];
const tagItems = ref([...options]);
function removeTags(values: unknown[]) { tagItems.value = tagItems.value.filter(item => !values.includes(item.value)); }
const date = () => new Frame.CalendarDate(2026, 10, 21);
const value = ref<unknown>(props.id.includes('time') ? (props.id.includes('range') ? { start: new Frame.Time(9, 30), end: new Frame.Time(17) } : new Frame.Time(9, 30)) : /calendar|date|month|year/.test(props.id) ? (props.id.includes('range') ? { start: date(), end: new Frame.CalendarDate(2026, 10, 26) } : date()) : ['switch','toggle'].includes(props.id) ? false : props.id.startsWith('color') ? '#0078d4' : ['number-field','rating'].includes(props.id) ? 3 : ['pin-input','checkbox-group'].includes(props.id) ? [] : props.id === 'tags-input' ? ['design', 'review'] : props.id === 'editable' ? 'Frame project' : 'vue');
const control = computed(() => (Frame as unknown as Record<string, Component>)[`Frame${formFamilies.find((
  [id]
) => id === props.id)?.[1]}`]);
const extra = computed(() => props.id === 'autocomplete' ? { options: ['Vue', 'TypeScript', 'Rust'] } : props.id === 'tag-group' ? { items: tagItems.value, selectionMode: 'single', onRemove: removeTags } : props.id === 'checkbox-group' ? { options } : props.id === 'color-slider' ? { channel: 'hue' } : props.id === 'color-swatch' ? { color: '#0078d4' } : props.id === 'color-swatch-picker' ? { colors: ['#0078d4', '#16a34a', '#e05252'] } : ['combobox','listbox','radio-group','toggle-group'].includes(props.id) ? { options } : props.id === 'number-field' ? { min: 0, max: 20 } : props.id === 'pin-input' ? { length: 4 } : {});
watch(value, next => emit('feedback', JSON.stringify(next)), { deep: true });
</script>
<template><div class="form-example" :data-form-example="id"><Frame.FrameField v-if="id === 'field'" label="Project name" description="Name shown in the workspace" error="A project name is required" :invalid="true"><Frame.FrameTextField placeholder="Project name" aria-label="Project name" /></Frame.FrameField><Frame.FrameForm v-else-if="id === 'form'" @submit.prevent="emit('feedback', 'Form submitted')"><Frame.FrameField label="Project name"><Frame.FrameTextField aria-label="Project name" required /></Frame.FrameField><Frame.FrameButton type="submit">Save project</Frame.FrameButton></Frame.FrameForm><template v-else-if="id === 'label'"><Frame.FrameLabel :for="nameId">Project name</Frame.FrameLabel><Frame.FrameTextField :id="nameId" placeholder="Enter a name" /></template><component :is="control" v-else-if="id === 'toggle'" v-model="value" v-bind="extra" label="Example" aria-label="Example" :disabled="disabled">Bold</component><component :is="control" v-else v-model="value" v-bind="extra" label="Example" aria-label="Example" :disabled="disabled" /><Frame.FrameCheckbox v-if="!['field','form','label','color-swatch'].includes(id)" v-model="disabled" label="Disable example" /></div></template>
<style scoped>.form-example { display: flex; flex-direction: column; align-items: flex-start; gap: calc(var(--frame-gap) * 2); min-width: 260px; }</style>
