<script setup lang="ts">
import {useFrame} from '../../../core/src/framework/useFrame';
const frame = useFrame();
withDefaults(defineProps<{ detail?: boolean }>(), { detail: false });
</script>
<template>
  <div class="sample-content">
    <template v-if="detail">
      <h3>An app-owned view</h3><p>This component was registered by the sample application. Frame supplies its container, selection, and collapse behavior.</p>
      <button class="sample-button" @click="frame.executeCommand('sample.remove-side')">Remove this panel</button>
    </template>
    <template v-else>
      <h3>Try the building blocks</h3><button class="sample-button" @click="frame.executeCommand('demo.properties')">Workspace properties…</button><button class="sample-button" @click="frame.splitWorkspace('right')">Split workspace right</button><button class="sample-button" @click="frame.openBanner()">Show banner</button><p>These actions come from the sample app.</p>
      <button class="sample-button" @click="frame.executeCommand('sample.add-side')">Add a primary view</button>
      <button class="sample-button" @click="frame.executeCommand('sample.add-tab')">Add a panel view</button>
      <button class="sample-button" @click="frame.executeCommand('sample.quick-pick')">Choose a view…</button>
      <button class="sample-button" @click="frame.executeCommand('sample.titlebar')">Toggle search or plain title</button>
      <p class="sample-note">The same actions are available in Quick actions. Close and reopen a panel to keep working.</p>
    </template>
  </div>
</template>

