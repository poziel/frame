<script setup lang="ts">
import type { FrameMenuItem } from '../types';
import FrameIcon from './FrameIcon.vue';
import VisibilityIndicator from './VisibilityIndicator.vue';
defineProps<{ item: Exclude<FrameMenuItem, { type: 'separator' }> }>();
</script>
<template>
  <span class="menu-check"><FrameIcon v-if="item.checked && !item.visibility" name="check" :size="14" /></span>
  <span class="menu-label">{{ item.label }}</span>
  <VisibilityIndicator v-if="item.visibility" :visible="!!item.checked" /><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
  <FrameIcon v-if="item.children?.length" name="chevron-right" :size="13" class="menu-chevron" /><span v-else class="menu-chevron" />
</template>
