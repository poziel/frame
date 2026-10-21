<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { createFrame, FrameShell, FrameButton, FrameTextInput, FrameIcon, useFrame } from '@frame/core';
import '@frame/core/style.css';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

const frame = createFrame({ settings: true, notifications: true });
const name = ref('External application');
const count = ref(0);
const nativeResult = ref('Browser preview');
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
onMounted(async () => {
  if (!isTauri()) return;
  const checks: string[] = [];
  try {
    nativeResult.value = await invoke<string>('consumer_ping');
    if (nativeResult.value !== 'External Rust host connected') throw new Error('Rust command response mismatch');
    checks.push('host Rust command');
    const win = getCurrentWindow();
    await win.isMaximized();
    await win.isFullscreen();
    checks.push('native window state');
    await win.toggleMaximize();
    await win.toggleMaximize();
    await win.setFullscreen(true);
    await win.setFullscreen(false);
    await win.minimize();
    await win.unminimize();
    checks.push('maximize/fullscreen/minimize permissions');
    await frame.executeCommand('consumer.increment');
    if (count.value !== 1) throw new Error('Host command did not run');
    checks.push('host command');
    if (!document.querySelector('[data-testid="consumer-sidebar"]')) throw new Error('Host sidebar missing');
    if (!document.querySelector('.frame-button')) throw new Error('Frame controls missing');
    const background = getComputedStyle(document.querySelector('.workbench')!).backgroundColor;
    if (background === 'rgba(0, 0, 0, 0)') throw new Error('Frame stylesheet missing');
    checks.push('mounted shell, host view, controls and stylesheet');
    if (new URLSearchParams(location.search).has('nativeTest')) {
      await invoke('consumer_complete', { result: { ok: true, checks } });
    }
  } catch (error) {
    nativeResult.value = String(error);
    if (new URLSearchParams(location.search).has('nativeTest')) await invoke('consumer_complete', { result: { ok: false, checks, error: String(error) } });
  }
});
</script>
<template>
  <FrameShell :frame="frame" title-text="External consumer">
    <main class="consumer-workspace">
      <h1>Independent host application</h1>
      <label>Project name <FrameTextInput v-model="name" aria-label="Project name" /></label>
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
