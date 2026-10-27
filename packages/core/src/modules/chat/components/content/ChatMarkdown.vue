<script setup lang="ts">
import '../../styles/index.css';
import {computed} from 'vue';
import {renderChatMarkdown} from '../../services/content/chatMarkdown';

const props = defineProps<{text: string}>();
const html = computed(() => renderChatMarkdown(props.text));
</script>
<template><div class="frame-chat-markdown" v-html="html" /></template>
