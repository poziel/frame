import type { DocumentationOverview, FeatureExample } from './types';
const code = (
  id: string,
  title: string,
  description: string,
  source: string,
  preview = false
): FeatureExample => ({ id, title, description, code: source, variant: id, preview });
export const aiGuides: Record<string, { overview: DocumentationOverview; features: FeatureExample[] }> = {
  'ai-prompt': {
    overview: {
      purpose: 'AIPrompt is the message-entry control: a multiline field, attachment menu, Send button, and optional Stop and voice actions. It contains no transcript, conversation store, or AI connection.',
      usage: 'Use it in a conversation, beneath a history list to start a new conversation, or inside your own application flow. The host owns text, attachments, submission, and the working state.',
      notes: ['Enter submits a non-empty message; Shift+Enter adds a line. IME confirmation does not submit.', 'Submitting emits text and attachments without clearing either model. Clear them after your application accepts the message.', 'busy replaces Send with Stop while keeping the next draft editable. disabled prevents editing and actions.', 'The preferred minimum width is 280px. It adapts to smaller hosts without forcing horizontal overflow; override --frame-ai-prompt-min-width to change it.'],
    },
    features: [
      code('basic', 'Write and submit a message', 'Bind the draft with v-model and handle submit. This complete example displays the submitted text and clears the accepted draft.', `<script setup lang="ts">
import { ref } from 'vue';
import { AIPrompt } from '@frame/core/modules/chat';

const draft = ref('');
const sent = ref('');
function send(value: { text: string }) {
  sent.value = value.text;
  draft.value = '';
}
</script>
<template>
  <AIPrompt v-model="draft" placeholder="Describe your idea…" @submit="send" />
  <p v-if="sent">Submitted: {{ sent }}</p>
</template>`, true),
      code('attachments', 'Keep attachments under application ownership', 'v-model:attachments holds local files, folders, and context items. A custom menu action is reported to the host; choosing it below adds an application context chip. File selection does not upload anything.', `<script setup lang="ts">
import { ref } from 'vue';
import { AIPrompt, type ChatAttachment } from '@frame/core/modules/chat';
const draft = ref('');
const attachments = ref<ChatAttachment[]>([]);
function addContext() {
  attachments.value.push({ id: crypto.randomUUID(), kind: 'context', name: 'Current document' });
}
function send() { draft.value = ''; attachments.value = []; }
</script>
<template>
  <AIPrompt v-model="draft" v-model:attachments="attachments"
    :attachment-actions="[{ id: 'document', label: 'Current document' }]"
    @attachment-action="addContext" @submit="send" />
</template>`),
      code('working', 'Show working and unavailable states', 'The host controls busy and disabled independently. This local example starts a working state on submit, supports Stop, and provides an explicit Finish action. A real responder would finish when its request settles.', `<script setup lang="ts">
import { ref } from 'vue';
import { FrameButton } from '@frame/core';
import { AIPrompt } from '@frame/core/modules/chat';
const draft = ref('');
const busy = ref(false);
function send() { draft.value = ''; busy.value = true; }
</script>
<template>
  <AIPrompt v-model="draft" :busy="busy" @submit="send" @stop="busy = false" />
  <FrameButton v-if="busy" @click="busy = false">Finish simulated work</FrameButton>
  <AIPrompt model-value="Unavailable while the document is closed" disabled />
</template>`),
    ],
  },
  'ai-conversation': {
    overview: {
      purpose: 'AIConversation displays one conversation: user messages, streamed answers, progress commentary, activity groups and outputs, requests for input, delivered files, and the shared AIPrompt composer.',
      usage: 'Choose it when your application already decides which conversation is active. Use AIHistory to list conversations, or AIChat to connect history and conversation navigation for you.',
      notes: ['createAIChat owns one conversation’s state. Supply a responder; rendering the component starts no request.', 'Work stays expanded during a turn and collapses after successful completion. The final answer and delivered files remain visible.', 'Stop aborts the current request. Rewind preserves the original transcript until the edited prompt is submitted; forge emits a snapshot for the host.', 'Give the component a bounded height. Its transcript scrolls while the composer remains at the bottom. Dispose the controller when its owner is done.'],
    },
    features: [
      code('basic', 'Display one conversation', 'This complete local responder echoes a prompt. The controller is created in application setup and disposed with its owner; no Frame shell is required.', `<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIConversation, createAIChat } from '@frame/core/modules/chat';

const chat = createAIChat({
  respond(request, writer) { writer.message('You asked: ' + request.prompt); },
});
onBeforeUnmount(() => chat.dispose());
</script>
<template><AIConversation :chat="chat" style="height: 520px" /></template>`, true),
      code('events', 'Publish work before the final answer', 'The responder writes ordered events. Commentary separates activity groups; the current thought is transient. Completing the turn leaves the final answer outside the collapsed work section.', `<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIConversation, createAIChat } from '@frame/core/modules/chat';
const chat = createAIChat({
  respond(request, writer) {
    writer.commentary('I will inspect your request.');
    const group = writer.activityGroup({ label: 'Inspect the request' });
    const activity = writer.activity({ label: 'Read prompt', groupId: group });
    writer.finishActivity(activity, 'completed');
    writer.message('Ready to work on: ' + request.prompt);
    writer.complete();
  },
});
onBeforeUnmount(() => chat.dispose());
</script>
<template>
  <AIConversation :chat="chat" user-alignment="left" assistant-alignment="right"
    placeholder="Ask about this document…" style="height: 520px" />
</template>`),
    ],
  },
  'ai-history': {
    overview: {
      purpose: 'AIHistory lists the conversations in an application-owned history store and places AIPrompt below them. Submitting that prompt creates and sends the first message in a new conversation; selecting a row reports the chosen conversation.',
      usage: 'Use it for a dedicated history page or a sidebar in your own layout. AIChat supplies the combined navigation if you also want to display the selected conversation.',
      notes: ['Right-click a row or press Shift+F10 to rename, pin, archive, restore, or delete it. Pinned conversations appear first.', 'Archived conversations stay in memory and are available through the quiet link below the list. Deleting disposes that conversation’s controller.', 'Application scope shows this application’s conversations; all scope includes every host-created conversation already in this store. It does not import external agent sessions.', 'The store owns chats created by its factory. Dispose the history once its application owner is done. Persistence and provider discovery belong to the host.'],
    },
    features: [
      code('basic', 'List conversations and start a new one', 'The history starts empty. Each submitted prompt calls createChat once and starts that conversation. select and create let the host open a separate conversation surface.', `<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { AIHistory, createAIChat, createAIChatHistory } from '@frame/core/modules/chat';
const selected = ref('');
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond(request, writer) { writer.message(request.prompt); } }),
});
onBeforeUnmount(() => history.dispose());
</script>
<template>
  <AIHistory :history="history" style="height: 520px"
    @select="selected = $event" @create="selected = $event.id" />
  <p v-if="selected">Selected: {{ selected }}</p>
</template>`, true),
      code('actions', 'Manage history from application code', 'The API and context menu share the same state. Add custom row actions with contextActions and handle the action event in your application. showPrompt=false renders a list without a composer.', `<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { AIHistory, createAIChat, createAIChatHistory } from '@frame/core/modules/chat';
const result = ref('');
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond() {} }),
});
const item = history.create('Palette exploration');
history.pin(item.id);
history.rename(item.id, 'Forest palette');
onBeforeUnmount(() => history.dispose());
</script>
<template>
  <AIHistory :history="history" :show-prompt="false"
    :context-actions="() => [{ id: 'export', label: 'Export conversation' }]"
    @action="(_, item) => result = 'Export requested: ' + item.title" />
  <p>{{ result }}</p>
</template>`),
    ],
  },
  'ai-chat': {
    overview: {
      purpose: 'AIChat is the complete assistant surface. It combines AIHistory, AIConversation, and their shared AIPrompt, coordinates selection and keyboard focus, and adapts to its container.',
      usage: 'Use it when you want the full experience rather than composing each piece yourself. Mount it in application content, or use createAIChatView to register that same surface in a Frame sidebar or panel.',
      notes: ['Below 720px, a small floating back button returns to history. Wider containers show history beside the conversation.', 'With history, the prompt under the list starts a new conversation. With only a chat controller, AIChat displays that conversation without history.', 'View definitions do not register, open, authenticate, or start a request. The application explicitly registers and opens them.', 'Removing a view preserves caller-owned conversations. Dispose the history separately when its owner is done.'],
    },
    features: [
      code('basic', 'Combine conversation and history', 'One history store supplies the complete assistant. The same components shown on the Prompt, Conversation, and History pages are composed here.', `<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIChat, createAIChat, createAIChatHistory } from '@frame/core/modules/chat';
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond(request, writer) { writer.message(request.prompt); } }),
});
onBeforeUnmount(() => history.dispose());
</script>
<template><AIChat :history="history" style="height: 600px" /></template>`, true),
      code('view', 'Add the assistant directly to a Frame view', 'Use this inside a FrameShell descendant. createAIChatView returns the same AIChat composition as a normal ViewDefinition. Registration, opening, removal, and controller disposal remain explicit.', `<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useFrame } from '@frame/core';
import { createAIChat, createAIChatHistory, createAIChatView } from '@frame/core/modules/chat';
const frame = useFrame();
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond(request, writer) { writer.message(request.prompt); } }),
});
frame.secondarySidebar.enable();
const remove = frame.secondarySidebar.register(createAIChatView({ id: 'pixloom.assistant', history }));
frame.secondarySidebar.open('pixloom.assistant');
onBeforeUnmount(() => {
  remove();
  if (!frame.secondarySidebar.views.value.length) frame.secondarySidebar.close();
  history.dispose();
});
</script>`),
    ],
  },
};
