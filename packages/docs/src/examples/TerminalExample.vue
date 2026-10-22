<script setup lang="ts">
import { FrameButton, useFrame } from '@frame/core';
const frame = useFrame();
</script>
<template><div><p>The terminal runs local shells in the desktop app. Sessions stay alive when you hide this view. Use the profile arrow to choose an installed shell, or split the active session side by side. Drag pane and sidebar dividers to resize them. The options menu switches between sidebar and top tabs; both hide automatically with one terminal.</p><FrameButton variant="secondary" icon="terminal" @click="frame.openView('extras.terminal')">Open terminal view</FrameButton><p>Copy selection: Ctrl+Shift+C. Paste: Ctrl+Shift+V or Ctrl+V. Ctrl+C interrupts the shell. Find: Ctrl+F. Ctrl+click opens HTTP links.</p></div></template>
