<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, ref } from 'vue';
import { createFrame, FrameShell, FrameButton, FrameTextField, FrameIcon, useFrame } from '@frame/core';
import '@frame/core/style.css';

const frame = createFrame({ settings: true, notifications: true });
const name = ref('External application');
const count = ref(0);
const nativeResult = ref('Browser application');
const Navigation = defineComponent({
  setup() {
    const injected = useFrame();
    return () => h('p', { 'data-testid': 'consumer-sidebar' }, injected === frame ? 'Host navigation: shared Frame instance' : 'Wrong Frame instance');
  },
});
const Output = defineComponent({ setup: () => () => h('p', { 'data-testid': 'consumer-output' }, 'Host output view') });
frame.registerSidePanel({ id: 'consumer.navigation', label: 'Host navigation', component: Navigation });
frame.registerBottomTab({ id: 'consumer.output', label: 'Host output', component: Output });
frame.openSidePanel('consumer.navigation');
frame.openBottomPanel('consumer.output');
frame.registerCommand({ id: 'consumer.increment', label: 'Consumer: Increment counter', shortcut: 'Ctrl+Alt+I', run: () => { count.value++; } });
frame.registerSettingsSection({ id: 'consumer', title: 'Host preferences', settings: [{ id: 'consumer.name', label: 'Project name', type: 'text', default: 'External application' }] });
function notify() { frame.notify({ title: 'Host notification', severity: 'success', details: 'Created by the external application', duration: 0 }); }
function openModal() { frame.openModal({ id: 'consumer.modal', title: 'Host dialog', component: defineComponent({ render: () => h('p', 'External modal content') }) }); }
onBeforeUnmount(() => frame.dispose());
</script>
<template>
  <FrameShell :frame="frame" title-text="External consumer">
    <main class="consumer-workspace">
      <h1>Independent host application</h1>
      <label>Project name <FrameTextField v-model="name" aria-label="Project name" /></label>
      <p data-testid="consumer-name">{{ name }}</p>
      <p data-testid="consumer-count">Counter: {{ count }}</p>
      <FrameButton label="Increment" variant="primary" @click="frame.executeCommand('consumer.increment')" />
      <FrameButton label="Notify" @click="notify" />
      <FrameButton label="Open host dialog" @click="openModal" />
      <FrameButton label="Open host settings" @click="frame.openSettings" />
      <FrameIcon name="check" />
      <p data-testid="native-result">{{ nativeResult }}</p>
    </main>
  </FrameShell>
</template>
<style>
html, body, #app { margin: 0; height: 100%; }
.consumer-workspace { padding: 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
</style>
