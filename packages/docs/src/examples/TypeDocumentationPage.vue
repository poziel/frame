<script setup lang="ts">
import { showWorkspaceContent } from './workspaceContent';
import { computed } from "vue";
import type { WorkspacePaneContent } from "../../../core/src/types";
import { useFrame } from "../../../core/src/frame/createFrame";
import FrameButton from "../../../core/src/components/FrameButton.vue";
import ComponentShowcase from "../../../core/src/components/ComponentShowcase.vue";
import { apiEntries } from "./apiCatalog";
import { updateReferenceUrl } from "./apiNavigation";
import TypeLink from "./TypeLink.vue";
import { typeDocs } from "./typeDocs";
const props = defineProps<{ name: string; previous?: WorkspacePaneContent; previousView?: string }>();
const frame = useFrame();
const doc = computed(() => typeDocs[props.name]);
const entry = computed(() => apiEntries.find(entry => entry.name === props.name));
function back() {
  if (!props.previous) return;
  showWorkspaceContent(frame, props.previous);
  if (props.previousView) frame.openSidePanel(props.previousView);
  updateReferenceUrl(typeof props.previous.props?.name === "string" ? props.previous.props.name : undefined);
}
</script>
<template><ComponentShowcase v-if="doc" :eyebrow="`API · ${entry?.kind ?? 'Reference'} · ${entry?.package ?? '@frame/core'}`" :title="name" :description="doc.description" :usage="doc.usage ?? 'Import this contract from @frame/core.'" :code="doc.code" :properties="doc.properties" :show-preview="false"><template #navigation><FrameButton v-if="previous" icon="arrow-left" @click="back">Back{{ previous ? ` to ${previous.label}` : ' to components' }}</FrameButton></template><template #property-type="{ property }"><TypeLink v-if="property.reference" :name="property.reference" :label="property.type"/><code v-else>{{ property.type }}</code></template></ComponentShowcase><p v-else>Unknown type: {{ name }}</p></template>
