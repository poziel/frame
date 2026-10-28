# Assistant

The complete chat experience: conversation, history, and their shared prompt composer.

## Features

### What it does

AIChat is the complete assistant surface. It combines AIHistory, AIConversation, and their shared AIPrompt, coordinates selection and keyboard focus, and adapts to its container.

### When to use it

Use it when you want the full experience rather than composing each piece yourself. Mount it in application content, or use createAIChatView to register that same surface in a Frame sidebar or panel.

- Below 720px, a small floating back button returns to history. Wider containers show history beside the conversation.
- With history, the prompt under the list starts a new conversation. With only a chat controller, AIChat displays that conversation without history.
- View definitions do not register, open, authenticate, or start a request. The application explicitly registers and opens them.
- Removing a view preserves caller-owned conversations. Dispose the history separately when its owner is done.

### Combine conversation and history

One history store supplies the complete assistant. The same components shown on the Prompt, Conversation, and History pages are composed here.

<!-- frame:example id="ai-chat.basic" -->

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIChat, createAIChat, createAIChatHistory } from '@frame/core/modules/chat';
const history = createAIChatHistory({
  applicationId: 'pixloom',
  createChat: () => createAIChat({ respond(request, writer) { writer.message(request.prompt); } }),
});
onBeforeUnmount(() => history.dispose());
</script>
<template><AIChat :history="history" style="height: 600px" /></template>
```

### Add the assistant directly to a Frame view

Use this inside a FrameShell descendant. createAIChatView returns the same AIChat composition as a normal ViewDefinition. Registration, opening, removal, and controller disposal remain explicit.

<!-- frame:example id="ai-chat.view" -->

```vue
<script setup lang="ts">
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
</script>
```

## APIs

<!-- frame:generated api="ai-chat" -->

### AIChat

Source: `packages/core/src/modules/chat/components/AIChat.vue`

#### Properties

| Name                 | Type                                                                            | Default   | Description                                                                                           |
| -------------------- | ------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `chat`               | `AIChatController \| undefined`                                                 | Omitted   | One caller-owned conversation when history is omitted.                                                |
| `history`            | `AIChatHistoryController \| undefined`                                          | Omitted   | Adds conversation selection, creation, and responsive history navigation. Takes precedence over chat. |
| `label`              | `string \| undefined`                                                           | "AI chat" | Accessible name or visible label for the rendered control.                                            |
| `placeholder`        | `string \| undefined`                                                           | Omitted   | Prompt shown when the input is empty.                                                                 |
| `emptyMessage`       | `string \| undefined`                                                           | Omitted   | Empty-conversation text; the empty slot takes precedence.                                             |
| `userAlignment`      | `"left" \| "right" \| undefined`                                                | Omitted   | Horizontal alignment of user messages in the transcript.                                              |
| `assistantAlignment` | `"left" \| "right" \| undefined`                                                | Omitted   | Horizontal alignment of assistant messages in the transcript.                                         |
| `attachmentActions`  | `readonly FrameMenuItem[] \| undefined`                                         | Omitted   | Additional host actions offered by the attachment menu.                                               |
| `speechEnabled`      | `boolean \| undefined`                                                          | false     | Shows the speech action; the host handles the emitted speech request.                                 |
| `allowRewind`        | `boolean \| undefined`                                                          | true      | Hide unsupported actions for native provider sessions.                                                |
| `allowFork`          | `boolean \| undefined`                                                          | true      | Offers conversation branching controls when supported.                                                |
| `allowAttachments`   | `boolean \| undefined`                                                          | true      | Offers file and folder attachment controls; files remain host-owned until submitted.                  |
| `historyActions`     | `((conversation: AIChatConversation) => readonly FrameMenuItem[]) \| undefined` | Omitted   | Adds application actions to the history row menu; emits historyAction.                                |

#### Events

| Name               | Parameters                                              | Return type | Description                                                                    |
| ------------------ | ------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `forge`            | `messages: ChatMessage[], source: ChatMessage`          | `void`      | Requests a conversation branch with its source message and preceding messages. |
| `attachmentAction` | `item: FrameMenuItem`                                   | `void`      | Reports selection of an application attachment-menu action.                    |
| `speech`           | `None`                                                  | `void`      | Requests host-managed speech input.                                            |
| `copy`             | `message: ChatMessage`                                  | `void`      | Reports copying a transcript message.                                          |
| `historyAction`    | `item: FrameMenuItem, conversation: AIChatConversation` | `void`      | Reports a host history-menu action and its conversation.                       |

#### Slots

| Name               | Parameters                  | Return type  | Description                                                               |
| ------------------ | --------------------------- | ------------ | ------------------------------------------------------------------------- |
| `empty`            | `None`                      | `VNodeChild` | Empty transcript content passed to the active conversation.               |
| `message-actions`  | `{ message: ChatMessage; }` | `VNodeChild` | Additional actions for one active transcript message.                     |
| `composer-actions` | `None`                      | `VNodeChild` | Additional actions shared by conversation and new-conversation composers. |

#### Exposed API

| Name    | Parameters | Return type | Description                                                                                       |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `focus` | `None`     | `void`      | Focuses the active input or terminal surface without creating or disposing its owning controller. |

### createAIChat

Source: `packages/core/src/modules/chat/controllers/aiChat.ts`

#### Properties

| Name       | Type                         | Default  | Description                                                                   |
| ---------- | ---------------------------- | -------- | ----------------------------------------------------------------------------- |
| `respond`  | `ChatResponder`              | Required | Host callback that produces responses when the conversation explicitly sends. |
| `messages` | `ChatMessage[] \| undefined` | Omitted  | Ordered conversation snapshots supplied by the owner.                         |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name                | Parameters                                   | Return type        | Description                                                                         |
| ------------------- | -------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------- |
| `createAIChat`      | `options: ChatOptions`                       | `AIChatController` | Creates a class-backed conversation through the existing public factory.            |
| `clear`             | `None`                                       | `void`             | Stops the response and clears local history, draft, attachments, and rewind state.  |
| `state`             | `None`                                       | `ChatState`        | Reactive conversation state shared by its visual presentations.                     |
| `cancelRewind`      | `None`                                       | `void`             | Restores the saved draft and attachments without changing message history.          |
| `rewind`            | `messageId: string`                          | `void`             | Previews replacement of a user message while retaining the prior unsent draft.      |
| `stop`              | `None`                                       | `void`             | Stops the active response without waiting for the host responder.                   |
| `fork`              | `messageId: string`                          | `ChatMessage[]`    | Returns an independent conversation prefix ending at a completed assistant message. |
| `send`              | `None`                                       | `Promise<boolean>` | Sends the draft once and resolves when its owned response completes or stops.       |
| `resolveApproval`   | `id: string, decision: ChatApprovalDecision` | `boolean`          | Resolves an approval only in the active generation.                                 |
| `answerQuestions`   | `id: string, answers: ChatQuestionAnswer[]`  | `boolean`          | Submits validated answers only to the active generation.                            |
| `cancelInteraction` | `id: string`                                 | `boolean`          | Cancels one interaction only in the active generation.                              |
| `dispose`           | `None`                                       | `void`             | Permanently stops this conversation while leaving host services caller-owned.       |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="ai-chat" -->

| CSS variable                        | Theme path                        | Default expression                        | Purpose                                                                                                              | Context                                                                    |
| ----------------------------------- | --------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `--frame-text`                      | `frame.text`                      | No declared default; supplied by context. | Color for .frame-ai-view; text.                                                                                      | `.frame-ai-view`                                                           |
| `--frame-ai-history-back-top`       | `frame.ai.history.back.top`       | `6px`                                     | Top for .frame-ai-view .frame-ai-view-back; ai history back top.                                                     | `.frame-ai-view .frame-ai-view-back`                                       |
| `--frame-ai-history-back-left`      | `frame.ai.history.back.left`      | `8px`                                     | Left for .frame-ai-view .frame-ai-view-back; ai history back left.                                                   | `.frame-ai-view .frame-ai-view-back`                                       |
| `--frame-muted`                     | `frame.muted`                     | No declared default; supplied by context. | Color for .frame-ai-view .frame-ai-view-back; muted.                                                                 | `.frame-ai-view .frame-ai-view-back`                                       |
| `--frame-ai-history-back-clearance` | `frame.ai.history.back.clearance` | `24px`                                    | Padding top for .frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript; ai history back clearance. | `.frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript` |
| `--frame-ai-history-width`          | `frame.ai.history.width`          | `280px`                                   | Flex for .frame-ai-view .frame-ai-view-history; ai history width.                                                    | `@container (min-width: 720px) { .frame-ai-view .frame-ai-view-history }`  |
| `--frame-line`                      | `frame.line`                      | No declared default; supplied by context. | Border right for .frame-ai-view .frame-ai-view-history; line.                                                        | `@container (min-width: 720px) { .frame-ai-view .frame-ai-view-history }`  |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
