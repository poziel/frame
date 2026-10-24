<script setup lang="ts">
import { useFrame } from "../../../core/src/frame/createFrame";
withDefaults(defineProps<{ view?: "workspace" | "activity" | "preferences" | "session" }>(), { view: "workspace" });
const frame = useFrame();
</script>
<template>
  <template v-if="view === 'workspace'">
    <div class="side-group-label">PERSONAL WORKSPACE</div>
    <p class="side-description">Choose a view from the activity rail or search for an action.</p>
    <button class="side-action" @click="frame.openCommands()">Show all commands</button>
  </template>
  <template v-else-if="view === 'preferences'">
    <div class="side-group-label">LAYOUT</div>
    <div class="preference">
      <div><strong>Panel</strong><p>Show session output.</p></div>
      <button class="switch" :class="{ on: frame.state.panelVisible }" role="switch" :aria-checked="frame.state.panelVisible"
        aria-label="Show panel" @click="frame.executeCommand('frame.panel.toggle')"><span /></button>
    </div>
    <p class="side-description">Layout changes apply to this session.</p>
  </template>
  <div v-else class="panel-log" :class="{ 'side-log': view === 'activity' }" role="log" aria-label="Session events">
    <div v-for="entry in frame.state.entries" :key="entry.id"><time>{{ entry.time }}</time><span>{{ entry.message }}</span></div>
  </div>
</template>
