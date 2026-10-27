<script setup lang="ts">
import { computed } from "vue";
import {useFrame} from '../../framework/useFrame';
import StatusBarItem from './StatusBarItem.vue';
const frame = useFrame();
const item = computed(() => frame.status.items.value.find(item => item.id === 'frame.manage'));
</script>
<template>
  <StatusBarItem v-if="item?.available && item.visible" :item="item" placement="title" />
</template>
