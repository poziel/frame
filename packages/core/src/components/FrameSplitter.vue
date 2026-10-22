<script setup lang="ts">
import { computed } from 'vue';
import { SplitterGroup, SplitterPanel, SplitterResizeHandle, useForwardPropsEmits } from 'reka-ui';
import type { SplitterGroupProps, SplitterGroupEmits } from 'reka-ui';
import type { FrameSplitPanel } from '../general-types';
import '../general-b.css';
const props=defineProps<SplitterGroupProps & { panels?: FrameSplitPanel[]; label?: string }>();
const emit=defineEmits<SplitterGroupEmits>();
const root=computed(()=>{const {panels,label,...rest}=props;return rest;});
const forwarded=useForwardPropsEmits(root,emit);
function panelProps(panel:FrameSplitPanel){ const {label,content,...rest}=panel; return rest; }
</script>
<template><SplitterGroup v-bind="forwarded" class="frame-splitter" :aria-label="label"><slot><template v-for="(panel,index) in panels" :key="panel.id ?? index"><SplitterResizeHandle v-if="index" class="frame-splitter-handle" :aria-label="`Resize ${panel.label ?? 'panel'}`"/><SplitterPanel v-bind="panelProps(panel)" class="frame-splitter-panel"><slot name="panel" :panel="panel" :index="index">{{panel.content ?? panel.label}}</slot></SplitterPanel></template></slot></SplitterGroup></template>
