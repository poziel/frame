<script setup lang="ts">
import type { Component } from 'vue';
import type { BarDisplay, ViewBadge } from '../../framework/layout/barTypes';
import FrameIcon from '../data-display/FrameIcon.vue';
defineProps<{label:string;icon?:Component;badge?:ViewBadge;display:BarDisplay}>();
</script>
<template><span v-if="display!=='text'" class="bar-icon-slot"><component v-if="icon" :is="icon"/><FrameIcon v-else name="window"/></span><span v-if="display!=='icons'" class="bar-item-label">{{label}}</span><span v-if="badge!==undefined&&badge!==''" class="bar-item-badge" aria-hidden="true">{{badge}}</span></template>
