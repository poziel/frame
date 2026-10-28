<script setup lang="ts">
import '../styles/index.scss';
import {computed, nextTick, ref, useId} from 'vue';
import {
  FrameButton,
  FrameContextMenu,
  FrameDialog,
  FrameIcon,
  FrameTextField,
  type FrameMenuItem,
} from '../../../index';
import AIPrompt from './AIPrompt.vue';
import type {ChatAttachment} from '../types/chatTypes';
import type {
  AIChatHistoryController,
  AIChatConversation,
} from '../controllers/aiChatHistory';

const props = withDefaults(
  defineProps<{
    /** Caller-owned conversation store. Unmounting this list does not dispose it. */
    history: AIChatHistoryController;
    /** Includes the shared prompt for creating and sending a new conversation. */
    showPrompt?: boolean;
    /** Prompt shown when the input is empty. */
    placeholder?: string;
    /** Adds row menu entries; selected host actions are emitted through action. */
    contextActions?: (
      conversation: AIChatConversation
    ) => readonly FrameMenuItem[];
    /** Additional host actions offered by the attachment menu. */
    attachmentActions?: readonly FrameMenuItem[];
    /** Shows the speech action; the host handles the emitted speech request. */
    speechEnabled?: boolean;
  }>(),
  {showPrompt: true, placeholder: 'Start a conversation…'}
);
const emit = defineEmits<{
  /** Requests activation of the selected registered item ID. */
  select: [id: string];
  /** Reports the newly created conversation. */
  create: [conversation: AIChatConversation];
  /** Reports a selected application history-menu action and its conversation. */
  action: [item: FrameMenuItem, conversation: AIChatConversation];
  /** Reports selection of an application attachment-menu action. */
  attachmentAction: [item: FrameMenuItem];
  /** Requests host-managed speech input. */
  speech: [];
}>();
const draft = ref(''),
  attachments = ref<ChatAttachment[]>([]),
  showArchived = ref(false);
const prompt = ref<{focus: () => void}>();
defineExpose({
  /** Focuses the active input or terminal surface without creating or disposing its owning controller. */
  focus: () => prompt.value?.focus(),
});
const renameOpen = ref(false),
  renameTitle = ref(''),
  renameId = ref<string>();
const renameInput = ref<{focus: () => void}>();
const renameForm = useId();
let anchor: HTMLElement | undefined;
const rows = computed(() =>
  showArchived.value
    ? props.history.archived.value
    : props.history.visible.value
);
function title(item: AIChatConversation) {
  return item.title !== 'New conversation'
    ? item.title
    : item.chat.state.messages
        .find((message) => message.role === 'user')
        ?.parts.find((part) => part.type === 'message')?.text || item.title;
}
function items(item: AIChatConversation): readonly FrameMenuItem[] {
  return [
    {id: 'ai-history.rename', label: 'Rename'},
    {id: 'ai-history.pin', label: item.pinned ? 'Unpin' : 'Pin'},
    {id: 'ai-history.archive', label: item.archived ? 'Restore' : 'Archive'},
    ...(props.contextActions?.(item) ?? []),
    {id: 'ai-history.separator', type: 'separator'},
    {id: 'ai-history.delete', label: 'Delete'},
  ];
}
async function action(item: FrameMenuItem, conversation: AIChatConversation) {
  if (item.id === 'ai-history.rename') {
    renameId.value = conversation.id;
    renameTitle.value = title(conversation);
    renameOpen.value = true;
    await nextTick();
    renameInput.value?.focus();
  } else if (item.id === 'ai-history.pin')
    props.history.pin(conversation.id, !conversation.pinned);
  else if (item.id === 'ai-history.archive')
    props.history.archive(conversation.id, !conversation.archived);
  else if (item.id === 'ai-history.delete')
    props.history.remove(conversation.id);
  else emit('action', item, conversation);
}
function rename() {
  if (renameId.value && props.history.rename(renameId.value, renameTitle.value))
    renameOpen.value = false;
}
function select(id: string) {
  if (props.history.select(id)) emit('select', id);
}
function send(value: {text: string; attachments: ChatAttachment[]}) {
  const conversation = props.history.create(
    value.text.trim().slice(0, 80) ||
      value.attachments[0]?.name ||
      'New conversation'
  );
  conversation.chat.state.draft = value.text;
  conversation.chat.state.attachments = value.attachments;
  draft.value = '';
  attachments.value = [];
  showArchived.value = false;
  emit('create', conversation);
  void conversation.chat.send();
}
defineSlots<{
  /** Additional actions in the new-conversation composer. */ 'composer-actions'?(): unknown;
}>();
</script>
<template>
  <section class="frame-ai-history" aria-label="AI history">
    <nav class="frame-chat-history" aria-label="Conversation history">
      <p v-if="!rows.length" class="frame-chat-history-empty">{{
        showArchived
          ? 'No archived conversations.'
          : 'No conversations yet. Send a message to start one.'
      }}</p>
      <ul
        ><li v-for="conversation in rows" :key="conversation.id">
          <FrameContextMenu
            :items="items(conversation)"
            :label="`Actions for ${title(conversation)}`"
            @select="action($event, conversation)"
          >
            <template #trigger
              ><FrameButton
                class="frame-chat-history-row"
                :aria-current="
                  history.activeId.value === conversation.id
                    ? 'page'
                    : undefined
                "
                @click="select(conversation.id)"
                @focus="anchor = $event.currentTarget as HTMLElement"
                @contextmenu="anchor = $event.currentTarget as HTMLElement"
                ><FrameIcon
                  v-if="conversation.pinned"
                  name="pinned"
                  :size="14"
                /><span>{{ title(conversation) }}</span></FrameButton
              ></template
            >
          </FrameContextMenu>
        </li></ul
      >
    </nav>
    <div
      v-if="history.archived.value.length || showArchived"
      class="frame-ai-history-footer"
      ><FrameButton
        class="frame-ai-history-archive"
        :aria-pressed="showArchived"
        @click="showArchived = !showArchived"
        >{{
          showArchived ? 'Back to conversations' : 'View archived conversations'
        }}</FrameButton
      ></div
    >
    <div v-if="showPrompt" class="frame-ai-history-prompt"
      ><AIPrompt
        ref="prompt"
        v-model="draft"
        v-model:attachments="attachments"
        :placeholder="placeholder"
        :attachment-actions="attachmentActions"
        :speech-enabled="speechEnabled"
        label="New conversation message"
        @submit="send"
        @speech="emit('speech')"
        @attachment-action="emit('attachmentAction', $event)"
        ><template #actions
          ><slot name="composer-actions" /></template></AIPrompt
    ></div>
    <FrameDialog
      v-model:open="renameOpen"
      title="Rename conversation"
      :footer="true"
      description="Choose a name for this conversation."
      @close-auto-focus="
        $event.preventDefault();
        anchor?.focus();
      "
    >
      <template #trigger><span hidden /></template>
      <form :id="renameForm" @submit.prevent="rename"
        ><FrameTextField
          ref="renameInput"
          v-model="renameTitle"
          aria-label="Conversation name"
      /></form>
      <template #actions
        ><FrameButton @click="renameOpen = false">Cancel</FrameButton
        ><FrameButton
          type="submit"
          variant="primary"
          :form="renameForm"
          :disabled="!renameTitle.trim()"
          >Save name</FrameButton
        ></template
      >
    </FrameDialog>
  </section>
</template>

<style lang="scss">
.frame-chat-history {
  /* Padding for .frame-chat-history; ai history padding. @token --frame-ai-history-padding */
  --_frame-default-ai-history-padding-5e5582b299: 12px;
  padding: var(
    --frame-ai-history-padding,
    var(--_frame-default-ai-history-padding-5e5582b299)
  );
  /* Font size for .frame-chat-history; font size. @token --frame-font-size */
  --_frame-default-font-size-7873e21aaa: 13px;
  font-size: var(--frame-font-size, var(--_frame-default-font-size-7873e21aaa));
}

.frame-chat-history ul {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.frame-chat-history li {
  display: flex;
  align-items: center;
  min-width: 0;
}

.frame-chat-history li > .frame-button {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-content: flex-start;
}

.frame-chat-history-empty {
  /* Color for .frame-chat-history-empty; muted. @token --frame-muted @context */
  color: var(--frame-muted);
  line-height: 1.6;
}

.frame-ai-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.frame-ai-history > .frame-chat-history {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.frame-ai-history-prompt {
  flex: none;
  min-width: 0;
  /* Padding for .frame-ai-history-prompt; ai history prompt padding. @token --frame-ai-history-prompt-padding */
  --_frame-default-ai-history-prompt-padding-0b4f45061a: 12px;
  padding: var(
    --frame-ai-history-prompt-padding,
    var(--_frame-default-ai-history-prompt-padding-0b4f45061a)
  );
}

.frame-ai-history-footer {
  flex: none;
  /* Padding for .frame-ai-history-footer; ai history footer padding. @token --frame-ai-history-footer-padding */
  --_frame-default-ai-history-footer-padding-75840b621c: 0 12px;
  padding: var(
    --frame-ai-history-footer-padding,
    var(--_frame-default-ai-history-footer-padding-75840b621c)
  );
}

.frame-ai-history-footer .frame-ai-history-archive {
  /* Color for .frame-ai-history-footer .frame-ai-history-archive; muted. @token --frame-muted @context */
  color: var(--frame-muted);
  /* Font size for .frame-ai-history-footer .frame-ai-history-archive; ai history archive font size. @token --frame-ai-history-archive-font-size */
  --_frame-default-ai-history-archive-font-size-0e574c2cde: 11px;
  font-size: var(
    --frame-ai-history-archive-font-size,
    var(--_frame-default-ai-history-archive-font-size-0e574c2cde)
  );
}

.frame-chat-history li > .frame-general-anchor {
  display: block;
  min-width: 0;
  width: 100%;
}

.frame-chat-history .frame-chat-history-row {
  display: flex;
  align-items: center;
  /* Gap for .frame-chat-history .frame-chat-history-row; ai history row gap. @token --frame-ai-history-row-gap */
  --_frame-default-ai-history-row-gap-bb84d03d10: 6px;
  gap: var(
    --frame-ai-history-row-gap,
    var(--_frame-default-ai-history-row-gap-bb84d03d10)
  );
  width: 100%;
  min-width: 0;
  text-align: left;
  justify-content: flex-start;
}

.frame-chat-history-row > span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.frame-chat-history-row[aria-current='page'] {
  /* Background for .frame-chat-history-row[aria-current='page']; list selection background. @token --frame-list-selection-background */
  --_frame-default-list-selection-background-057ac04bb5: #ffffff12;
  background: var(
    --frame-list-selection-background,
    var(--_frame-default-list-selection-background-057ac04bb5)
  );
}
</style>
