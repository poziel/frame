<script setup lang="ts">
import { useFrame } from "../frame/createFrame";
import TypeDocumentationPage from "./TypeDocumentationPage.vue";
const props = defineProps<{ name: string; label?: string }>();
const frame = useFrame();
function open() {
  const pane = frame.workspace.panes.value.find(pane => pane.id === frame.workspace.activePane.value);
  frame.setWorkspacePane(frame.workspace.activePane.value, { label: props.name, component: TypeDocumentationPage, props: { name: props.name, previous: pane ? { label: pane.label, component: pane.component, props: pane.props } : undefined } });
}
</script>
<template><a :href="`#/types/${name}`" @click.prevent="open">{{ label ?? `${name} reference` }}</a></template>
