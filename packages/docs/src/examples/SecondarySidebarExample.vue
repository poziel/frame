<script setup lang="ts">
import {FrameTextArea} from '@frame/core';
defineProps<{label:string;description:string;state:{draft:string;feedback:string}}>();
</script>
<template><section class="secondary-sidebar-example"><h3>{{label}}</h3><p>{{description}}</p><FrameTextArea v-model="state.draft" :aria-label="label+' draft'" placeholder="Type here to test retained view state…"/><p v-if="state.feedback" role="status">{{state.feedback}}</p></section></template>
<style scoped>
.secondary-sidebar-example { display:flex; flex-direction:column; gap:12px; }
h3,p { margin:0; }
p { color:var(--frame-muted); line-height:1.5; }
.frame-text-area { width:100%; box-sizing:border-box; }
</style>
