<script setup lang="ts">
import '../../styles/index.scss';
import {computed} from 'vue';
import {renderChatMarkdown} from '../../services/content/chatMarkdown';

const props = defineProps<{text: string}>();
const html = computed(() => renderChatMarkdown(props.text));
</script>
<template><div class="frame-chat-markdown" v-html="html" /></template>

<style lang="scss">
.frame-chat-markdown {
  white-space: normal;
  overflow-wrap: anywhere;
  min-width: 0;
  overflow-x: auto;
}

.frame-chat-markdown > :first-child {
  margin-top: 0;
}

.frame-chat-markdown > :last-child {
  margin-bottom: 0;
}

.frame-chat-markdown p {
  margin: 0 0 0.75em;
}

.frame-chat-markdown pre {
  white-space: pre;
  overflow-x: auto;
  padding: 8px;
  background: var(--frame-surface, #181818);
  border-radius: 4px;
}

.frame-chat-markdown code {
  font-family: monospace;
}

.frame-chat-markdown table {
  border-collapse: collapse;
  font-size: inherit;
}

.frame-chat-markdown th,
.frame-chat-markdown td {
  border: 1px solid var(--frame-line, #444);
  padding: 4px 6px;
  text-align: left;
}

.frame-chat-markdown blockquote {
  margin: 0 0 0.75em;
  padding-left: 10px;
  border-left: 2px solid var(--frame-line, #444);
}

.frame-chat-markdown ul,
.frame-chat-markdown ol {
  padding-left: 22px;
}
</style>
