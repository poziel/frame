<script setup lang="ts">
import { computed } from "vue";
import type { WorkspacePaneContent } from "../types";
import { useFrame } from "../frame/createFrame";
import FrameButton from "../components/FrameButton.vue";
import ComponentShowcase from "../components/ComponentShowcase.vue";
import ComponentExamplePage from "./ComponentExamplePage.vue";
import TypeLink from "./TypeLink.vue";
import { typeDocs } from "./typeDocs";
const props = defineProps<{ name: string; previous?: WorkspacePaneContent }>();
const frame = useFrame();
const doc = computed(() => typeDocs[props.name]);
function back() { frame.setWorkspacePane(frame.workspace.activePane.value, props.previous ?? { label: "Selects", component: ComponentExamplePage, props: { componentId: "select" } }); }
</script>
<template><ComponentShowcase v-if="doc" eyebrow="TYPE REFERENCE" :title="name" :description="doc.description" :usage="doc.usage ?? 'Import this contract from @frame/core.'" :code="doc.code" :properties="doc.properties" :show-preview="false"><template #navigation><FrameButton icon="arrow-left" @click="back">Back{{ previous ? ` to ${previous.label}` : ' to components' }}</FrameButton></template><template #property-type="{ property }"><TypeLink v-if="property.reference" :name="property.reference" :label="property.type"/><code v-else>{{ property.type }}</code></template></ComponentShowcase><p v-else>Unknown type: {{ name }}</p></template>
