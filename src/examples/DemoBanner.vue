<script setup lang="ts">
import { useFrame } from "../frame";
const frame = useFrame();
</script>
<template><div class="demo-banner"><div><strong>Review workspace</strong><p>This custom banner can span either sidebar or stay above the canvas.</p></div><button class="sample-button" @click="frame.layout.bannerAlignment = frame.layout.bannerAlignment === 'justify' ? 'center' : 'justify'">Change alignment</button><button class="sample-button" @click="frame.closeBanner()">Dismiss</button></div></template>
