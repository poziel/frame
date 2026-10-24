<script setup lang="ts">
import { ref } from "vue";
import { ContextMenu } from "@frame/core";
import { useFrame } from "../../../core/src/frame/createFrame";
import logo from "../../../../assets/frame.svg";
const frame = useFrame(); const done = ref(false);
const menu = [{ id: 'inspect', label: 'Open inspector' }, { id: 'activity', label: 'Show activity' }];
function select(id: string) { if (id === 'inspect') frame.openSecondaryPanel('demo.inspector'); else frame.openBottomPanel('demo.primaryViewBar'); }
</script>
<template><div class="demo-canvas"><img :src="logo" class="demo-watermark" alt=""/><header><img :src="logo" alt="Frame" width="40" height="40"/><div><p class="demo-eyebrow">FRAME / INTERACTION STUDIO</p><h1>Launch workspace</h1></div><button class="sample-button" @click="frame.executeCommand('sample.quick-pick')">Switch view…</button></header><p class="demo-intro">A working space for the next release. Arrange the views around the work.</p><ContextMenu :items="menu" @select="select($event.id)"><article class="demo-document"><p class="demo-eyebrow">WORKING NOTE · 04</p><h2>Make room for the details.</h2><p>Keep collections nearby, review the inspector, and follow the activity below. Every view can travel with your workflow.</p><label class="demo-check"><input v-model="done" type="checkbox"/>Review the interaction checklist</label><div class="demo-note"><strong>Try the workbench</strong><p>Drag a view into another sidebar or panel. Resize the dotted dividers. Right-click this note for app-owned actions, or Customize layout to choose title bar buttons.</p></div><textarea aria-label="Working draft" placeholder="Add a thought to this workspace…" rows="4"/></article></ContextMenu><footer><span>{{ done ? 'Review complete' : 'Draft in progress' }}</span><button class="sample-button" @click="frame.record('Workspace saved'); frame.state.message = 'Workspace saved'">Save workspace</button></footer></div></template>
