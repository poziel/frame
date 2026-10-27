<script setup lang="ts">
import { onBeforeUnmount, useId } from 'vue';
import { useFrame } from '@frame/core';
import { createAIChatView } from '@frame/core/modules/chat';
import AIChatPlayground from './AIChatPlayground.vue';
import type { ChatPlayground } from './chatPlayground';
const props = defineProps<{ session: ChatPlayground }>();
const frame = useFrame(), id = `docs-chat-playground-${useId()}`;
frame.secondarySidebar.enable();
const remove = frame.secondarySidebar.register(createAIChatView({ id, chat: props.session.chat, label: 'AI chat' }));
frame.secondarySidebar.open(id);
onBeforeUnmount(() => { remove(); if (!frame.secondarySidebar.views.value.length) frame.secondarySidebar.close(); });
</script>
<template><AIChatPlayground :session="session" /></template>
