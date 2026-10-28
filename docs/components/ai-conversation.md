# Conversation

One conversation with ordered thoughts, answers, commentary, activities, approvals, questions and artifacts.

## Features

### What it does

AIConversation displays one conversation: user messages, streamed answers, progress commentary, activity groups and outputs, requests for input, delivered files, and the shared AIPrompt composer.

### When to use it

Choose it when your application already decides which conversation is active. Use AIHistory to list conversations, or AIChat to connect history and conversation navigation for you.

- createAIChat owns one conversation’s state. Supply a responder; rendering the component starts no request.
- Work stays expanded during a turn and collapses after successful completion. The final answer and delivered files remain visible.
- Stop aborts the current request. Rewind preserves the original transcript until the edited prompt is submitted; forge emits a snapshot for the host.
- Give the component a bounded height. Its transcript scrolls while the composer remains at the bottom. Dispose the controller when its owner is done.

### Display one conversation

This complete local responder echoes a prompt. The controller is created in application setup and disposed with its owner; no Frame shell is required.

<!-- frame:example id="ai-conversation.basic" -->

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { AIConversation, createAIChat } from '@frame/core/modules/chat';

const chat = createAIChat({
  respond(request, writer) { writer.message('You asked: ' + request.prompt); },
});
onBeforeUnmount(() => chat.dispose());
</script>
<template><AIConversation :chat="chat" style="height: 520px" /></template>
```

### Publish work before the final answer

The responder writes ordered events. Commentary separates activity groups; the current thought is transient. Completing the turn leaves the final answer outside the collapsed work section.

<!-- frame:example id="ai-conversation.events" -->

```vue
<script setup lang="ts">
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
</template>
```

## APIs

<!-- frame:generated api="ai-conversation" -->

### AIConversation

Source: `packages/core/src/modules/chat/components/AIConversation.vue`

#### Properties

| Name                 | Type                                    | Default                 | Description                                                                             |
| -------------------- | --------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `chat`               | `AIChatController`                      | Required                | Caller-owned conversation controller; unmounting this presentation does not dispose it. |
| `label`              | `string \| undefined`                   | "AI conversation"       | Accessible name or visible label for the rendered control.                              |
| `placeholder`        | `string \| undefined`                   | "Write a message…"      | Prompt shown when the input is empty.                                                   |
| `emptyMessage`       | `string \| undefined`                   | "Start a conversation." | Empty-conversation text; the empty slot takes precedence.                               |
| `userAlignment`      | `"left" \| "right" \| undefined`        | "right"                 | Horizontal alignment of user messages in the transcript.                                |
| `assistantAlignment` | `"left" \| "right" \| undefined`        | "left"                  | Horizontal alignment of assistant messages in the transcript.                           |
| `attachmentActions`  | `readonly FrameMenuItem[] \| undefined` | []                      | Additional host actions offered by the attachment menu.                                 |
| `speechEnabled`      | `boolean \| undefined`                  | false                   | Shows the speech action; the host handles the emitted speech request.                   |
| `allowRewind`        | `boolean \| undefined`                  | true                    | Hide unsupported actions for native provider sessions.                                  |
| `allowFork`          | `boolean \| undefined`                  | true                    | Offers conversation branching controls when supported.                                  |
| `allowAttachments`   | `boolean \| undefined`                  | true                    | Offers file and folder attachment controls; files remain host-owned until submitted.    |

#### Events

| Name               | Parameters                                     | Return type | Description                                                                    |
| ------------------ | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `forge`            | `messages: ChatMessage[], source: ChatMessage` | `void`      | Requests a conversation branch with its source message and preceding messages. |
| `attachmentAction` | `item: FrameMenuItem`                          | `void`      | Reports selection of an application attachment-menu action.                    |
| `speech`           | `None`                                         | `void`      | Requests host-managed speech input.                                            |
| `copy`             | `message: ChatMessage`                         | `void`      | Reports copying a transcript message.                                          |

#### Slots

| Name               | Parameters                  | Return type  | Description                                      |
| ------------------ | --------------------------- | ------------ | ------------------------------------------------ |
| `empty`            | `None`                      | `VNodeChild` | Empty transcript content replacing emptyMessage. |
| `message-actions`  | `{ message: ChatMessage; }` | `VNodeChild` | Additional actions for one transcript message.   |
| `composer-actions` | `None`                      | `VNodeChild` | Additional composer actions passed to AIPrompt.  |

#### Exposed API

| Name    | Parameters | Return type         | Description                                                                                       |
| ------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `focus` | `None`     | `void \| undefined` | Focuses the active input or terminal surface without creating or disposing its owning controller. |

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

<!-- frame:generated styles="ai-conversation" -->

| CSS variable                                                    | Theme path                                                    | Default expression          | Purpose                                                                                                                                                                                 | Context                                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--frame-ai-history-back-clearance`                             | `frame.ai.history.back.clearance`                             | `24px`                      | Padding top for .frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript; ai history back clearance.                                                                    | `.frame-ai-view.has-history .frame-ai-conversation .frame-chat-transcript`                                            |
| `--frame-chat-text-max-width`                                   | `frame.chat.text.max.width`                                   | `100%`                      | Max width for .frame-chat-text; chat text max width.                                                                                                                                    | `.frame-chat-text`                                                                                                    |
| `--frame-chat-text-margin-bottom`                               | `frame.chat.text.margin.bottom`                               | `8px`                       | Margin bottom for .frame-chat-text; chat text margin bottom.                                                                                                                            | `.frame-chat-text`                                                                                                    |
| `--frame-chat-error-color`                                      | `frame.chat.error.color`                                      | `#f48771`                   | Color for .frame-chat-error; chat error color.                                                                                                                                          | `.frame-chat-error`                                                                                                   |
| `--frame-chat-attachments-gap`                                  | `frame.chat.attachments.gap`                                  | `5px`                       | Gap for .frame-chat-attachments; chat attachments gap.                                                                                                                                  | `.frame-chat-attachments`                                                                                             |
| `--frame-chat-attachments-margin-bottom`                        | `frame.chat.attachments.margin.bottom`                        | `6px`                       | Margin bottom for .frame-chat-attachments; chat attachments margin bottom.                                                                                                              | `.frame-chat-attachments`                                                                                             |
| `--frame-chat-attachments-max-width`                            | `frame.chat.attachments.max.width`                            | `100%`                      | Max width for .frame-chat-attachments; chat attachments max width.                                                                                                                      | `.frame-chat-attachments`                                                                                             |
| `--frame-chat-chip-gap`                                         | `frame.chat.chip.gap`                                         | `5px`                       | Gap for .frame-chat-chip; chat chip gap.                                                                                                                                                | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-border-radius`                               | `frame.chat.chip.border.radius`                               | `4px`                       | Border radius for .frame-chat-chip; chat chip border radius.                                                                                                                            | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-background`                                  | `frame.chat.chip.background`                                  | `#ffffff0b`                 | Background for .frame-chat-chip; chat chip background.                                                                                                                                  | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-border`                                      | `frame.chat.chip.border`                                      | `1px solid #ffffff16`       | Border for .frame-chat-chip; chat chip border.                                                                                                                                          | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-padding`                                     | `frame.chat.chip.padding`                                     | `2px 6px`                   | Padding for .frame-chat-chip; chat chip padding.                                                                                                                                        | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-font-size`                                   | `frame.chat.chip.font.size`                                   | `11px`                      | Font size for .frame-chat-chip; chat chip font size.                                                                                                                                    | `.frame-chat-chip`                                                                                                    |
| `--frame-chat-chip-max-width`                                   | `frame.chat.chip.max.width`                                   | `100%`                      | Max width for .frame-chat-chip; chat chip max width.                                                                                                                                    | `.frame-chat-chip`                                                                                                    |
| `--frame-sr-only-width`                                         | `frame.sr.only.width`                                         | `1px`                       | Width for .sr-only.                                                                                                                                                                     | `.sr-only`                                                                                                            |
| `--frame-sr-only-height`                                        | `frame.sr.only.height`                                        | `1px`                       | Height for .sr-only.                                                                                                                                                                    | `.sr-only`                                                                                                            |
| `--frame-ai-chat-min-width`                                     | `frame.ai.chat.min.width`                                     | `0`                         | Min width for .frame-ai-chat; ai chat min width.                                                                                                                                        | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-min-height`                                    | `frame.ai.chat.min.height`                                    | `240px`                     | Min height for .frame-ai-chat; ai chat min height.                                                                                                                                      | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-height`                                        | `frame.ai.chat.height`                                        | `100%`                      | Height for .frame-ai-chat; ai chat height.                                                                                                                                              | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-gap`                                           | `frame.ai.chat.gap`                                           | `12px`                      | Gap for .frame-ai-chat; ai chat gap.                                                                                                                                                    | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-padding`                                       | `frame.ai.chat.padding`                                       | `12px`                      | Padding for .frame-ai-chat; ai chat padding.                                                                                                                                            | `.frame-ai-chat`                                                                                                      |
| `--frame-surface`                                               | `frame.surface`                                               | `#181818`                   | Background for .frame-ai-chat; surface.                                                                                                                                                 | `.frame-ai-chat`                                                                                                      |
| `--frame-text`                                                  | `frame.text`                                                  | `#ccc`                      | Color for .frame-ai-chat; text.                                                                                                                                                         | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-font-size`                                     | `frame.ai.chat.font.size`                                     | `13px`                      | Font size for .frame-ai-chat; ai chat font size.                                                                                                                                        | `.frame-ai-chat`                                                                                                      |
| `--frame-ai-chat-line-height`                                   | `frame.ai.chat.line.height`                                   | `1.6`                       | Line height for .frame-ai-chat; ai chat line height.                                                                                                                                    | `.frame-ai-chat`                                                                                                      |
| `--frame-chat-transcript-min-height`                            | `frame.chat.transcript.min.height`                            | `0`                         | Min height for .frame-chat-transcript; chat transcript min height.                                                                                                                      | `.frame-chat-transcript`                                                                                              |
| `--frame-chat-transcript-padding`                               | `frame.chat.transcript.padding`                               | `16px 2px 0`                | Padding for .frame-chat-transcript; chat transcript padding.                                                                                                                            | `.frame-chat-transcript`                                                                                              |
| `--frame-muted`                                                 | `frame.muted`                                                 | `#999`                      | Color for .frame-chat-empty; muted.                                                                                                                                                     | `.frame-chat-empty`                                                                                                   |
| `--frame-chat-empty-padding`                                    | `frame.chat.empty.padding`                                    | `20px 4px`                  | Padding for .frame-chat-empty; chat empty padding.                                                                                                                                      | `.frame-chat-empty`                                                                                                   |
| `--frame-chat-message-margin`                                   | `frame.chat.message.margin`                                   | `0 0 24px`                  | Margin for .frame-chat-message; chat message margin.                                                                                                                                    | `.frame-chat-message`                                                                                                 |
| `--frame-chat-message-padding`                                  | `frame.chat.message.padding`                                  | `0 4px`                     | Padding for .frame-chat-message; chat message padding.                                                                                                                                  | `.frame-chat-message`                                                                                                 |
| `--frame-chat-message-min-width`                                | `frame.chat.message.min.width`                                | `0`                         | Min width for .frame-chat-message; chat message min width.                                                                                                                              | `.frame-chat-message`                                                                                                 |
| `--frame-chat-message-user-frame-chat-text-max-width`           | `frame.chat.message.user.frame.chat.text.max.width`           | `90%`                       | Max width for .frame-chat-message.user .frame-chat-text; chat message user frame chat text max width.                                                                                   | `.frame-chat-message.user .frame-chat-text`                                                                           |
| `--frame-chat-message-user-frame-chat-text-border`              | `frame.chat.message.user.frame.chat.text.border`              | `1px     solid transparent` | Border for .frame-chat-message.user .frame-chat-text; chat message user frame chat text border.                                                                                         | `.frame-chat-message.user .frame-chat-text`                                                                           |
| `--frame-chat-message-user-frame-chat-text-border-radius`       | `frame.chat.message.user.frame.chat.text.border.radius`       | `7px`                       | Border radius for .frame-chat-message.user .frame-chat-text; chat message user frame chat text border radius.                                                                           | `.frame-chat-message.user .frame-chat-text`                                                                           |
| `--frame-chat-message-user-frame-chat-text-padding`             | `frame.chat.message.user.frame.chat.text.padding`             | `7px     12px`              | Padding for .frame-chat-message.user .frame-chat-text; chat message user frame chat text padding.                                                                                       | `.frame-chat-message.user .frame-chat-text`                                                                           |
| `--frame-chat-user-background`                                  | `frame.chat.user.background`                                  | `#ffffff0b`                 | Background for .frame-chat-message.user .frame-chat-text; chat user background.                                                                                                         | `.frame-chat-message.user .frame-chat-text`                                                                           |
| `--frame-accent`                                                | `frame.accent`                                                | `#0078d4`                   | Border color for .frame-chat-message.editing .frame-chat-text; accent.                                                                                                                  | `.frame-chat-message.editing .frame-chat-text`                                                                        |
| `--frame-muted`                                                 | `frame.muted`                                                 | `#999`                      | Color for .frame-chat-edit-label; muted.                                                                                                                                                | `.frame-chat-edit-label`                                                                                              |
| `--frame-chat-edit-label-font-size`                             | `frame.chat.edit.label.font.size`                             | `11px`                      | Font size for .frame-chat-edit-label; chat edit label font size.                                                                                                                        | `.frame-chat-edit-label`                                                                                              |
| `--frame-chat-edit-label-margin-bottom`                         | `frame.chat.edit.label.margin.bottom`                         | `5px`                       | Margin bottom for .frame-chat-edit-label; chat edit label margin bottom.                                                                                                                | `.frame-chat-edit-label`                                                                                              |
| `--frame-chat-message-after-rewind-opacity`                     | `frame.chat.message.after.rewind.opacity`                     | `0.4`                       | Opacity for .frame-chat-message.after-rewind; chat message after rewind opacity.                                                                                                        | `.frame-chat-message.after-rewind`                                                                                    |
| `--frame-chat-message-footer-gap`                               | `frame.chat.message.footer.gap`                               | `8px`                       | Gap for .frame-chat-message-footer; chat message footer gap.                                                                                                                            | `.frame-chat-message-footer`                                                                                          |
| `--frame-chat-message-footer-min-height`                        | `frame.chat.message.footer.min.height`                        | `26px`                      | Min height for .frame-chat-message-footer; chat message footer min height.                                                                                                              | `.frame-chat-message-footer`                                                                                          |
| `--frame-chat-message-footer-max-width`                         | `frame.chat.message.footer.max.width`                         | `100%`                      | Max width for .frame-chat-message-footer; chat message footer max width.                                                                                                                | `.frame-chat-message-footer`                                                                                          |
| `--frame-muted`                                                 | `frame.muted`                                                 | `#999`                      | Color for .frame-chat-message-footer; muted.                                                                                                                                            | `.frame-chat-message-footer`                                                                                          |
| `--frame-chat-message-footer-font-size`                         | `frame.chat.message.footer.font.size`                         | `10px`                      | Font size for .frame-chat-message-footer; chat message footer font size.                                                                                                                | `.frame-chat-message-footer`                                                                                          |
| `--frame-chat-message-actions-opacity`                          | `frame.chat.message.actions.opacity`                          | `0`                         | Opacity for .frame-chat-message-actions; chat message actions opacity.                                                                                                                  | `.frame-chat-message-actions`                                                                                         |
| `--frame-chat-message-actions-transition`                       | `frame.chat.message.actions.transition`                       | `opacity 0.12s`             | Transition for .frame-chat-message-actions; chat message actions transition.                                                                                                            | `.frame-chat-message-actions`                                                                                         |
| `--frame-chat-message-hover-frame-chat-message-actions-opacity` | `frame.chat.message.hover.frame.chat.message.actions.opacity` | `1`                         | Opacity for .frame-chat-message:hover .frame-chat-message-actions, .frame-chat-message:focus-within .frame-chat-message-actions; chat message hover frame chat message actions opacity. | `.frame-chat-message:hover .frame-chat-message-actions, .frame-chat-message:focus-within .frame-chat-message-actions` |
| `--frame-chat-message-meta-opacity`                             | `frame.chat.message.meta.opacity`                             | `0`                         | Opacity for .frame-chat-message-meta; chat message meta opacity.                                                                                                                        | `.frame-chat-message-meta`                                                                                            |
| `--frame-chat-message-meta-transition`                          | `frame.chat.message.meta.transition`                          | `opacity 0.12s`             | Transition for .frame-chat-message-meta; chat message meta transition.                                                                                                                  | `.frame-chat-message-meta`                                                                                            |
| `--frame-chat-message-hover-frame-chat-message-meta-opacity`    | `frame.chat.message.hover.frame.chat.message.meta.opacity`    | `1`                         | Opacity for .frame-chat-message:hover .frame-chat-message-meta, .frame-chat-message:focus-within .frame-chat-message-meta; chat message hover frame chat message meta opacity.          | `.frame-chat-message:hover .frame-chat-message-meta, .frame-chat-message:focus-within .frame-chat-message-meta`       |
| `--frame-chat-rewind-notice-gap`                                | `frame.chat.rewind.notice.gap`                                | `6px`                       | Gap for .frame-chat-rewind-notice; chat rewind notice gap.                                                                                                                              | `.frame-chat-rewind-notice`                                                                                           |
| `--frame-chat-rewind-notice-margin-bottom`                      | `frame.chat.rewind.notice.margin.bottom`                      | `6px`                       | Margin bottom for .frame-chat-rewind-notice; chat rewind notice margin bottom.                                                                                                          | `.frame-chat-rewind-notice`                                                                                           |
| `--frame-muted`                                                 | `frame.muted`                                                 | `#999`                      | Color for .frame-chat-rewind-notice; muted.                                                                                                                                             | `.frame-chat-rewind-notice`                                                                                           |
| `--frame-chat-rewind-notice-font-size`                          | `frame.chat.rewind.notice.font.size`                          | `11px`                      | Font size for .frame-chat-rewind-notice; chat rewind notice font size.                                                                                                                  | `.frame-chat-rewind-notice`                                                                                           |
| `--frame-chat-original-prompt-min-width`                        | `frame.chat.original.prompt.min.width`                        | `0`                         | Min width for .frame-chat-original-prompt; chat original prompt min width.                                                                                                              | `.frame-chat-original-prompt`                                                                                         |
| `--frame-chat-original-prompt-padding`                          | `frame.chat.original.prompt.padding`                          | `2px`                       | Padding for .frame-chat-original-prompt; chat original prompt padding.                                                                                                                  | `.frame-chat-original-prompt`                                                                                         |
| `--frame-chat-original-prompt-border`                           | `frame.chat.original.prompt.border`                           | `0`                         | Border for .frame-chat-original-prompt; chat original prompt border.                                                                                                                    | `.frame-chat-original-prompt`                                                                                         |
| `--frame-chat-original-prompt-background`                       | `frame.chat.original.prompt.background`                       | `transparent`               | Background for .frame-chat-original-prompt; chat original prompt background.                                                                                                            | `.frame-chat-original-prompt`                                                                                         |
| `--frame-text`                                                  | `frame.text`                                                  | `#ccc`                      | Color for .frame-chat-original-prompt; text.                                                                                                                                            | `.frame-chat-original-prompt`                                                                                         |
| `--frame-chat-latest-width`                                     | `frame.chat.latest.width`                                     | `30px`                      | Width for .frame-chat-latest; chat latest width.                                                                                                                                        | `.frame-chat-latest`                                                                                                  |
| `--frame-chat-latest-height`                                    | `frame.chat.latest.height`                                    | `30px`                      | Height for .frame-chat-latest; chat latest height.                                                                                                                                      | `.frame-chat-latest`                                                                                                  |
| `--frame-accent`                                                | `frame.accent`                                                | `#0078d4`                   | Border for .frame-chat-latest; accent.                                                                                                                                                  | `.frame-chat-latest`                                                                                                  |
| `--frame-chat-latest-border-radius`                             | `frame.chat.latest.border.radius`                             | `50%`                       | Border radius for .frame-chat-latest; chat latest border radius.                                                                                                                        | `.frame-chat-latest`                                                                                                  |
| `--frame-surface`                                               | `frame.surface`                                               | `#181818`                   | Background for .frame-chat-latest; surface.                                                                                                                                             | `.frame-chat-latest`                                                                                                  |
| `--frame-chat-latest-padding`                                   | `frame.chat.latest.padding`                                   | `0`                         | Padding for .frame-chat-latest; chat latest padding.                                                                                                                                    | `.frame-chat-latest`                                                                                                  |
| `--frame-chat-message-meta-transition-2`                        | `frame.chat.message.meta.transition.2`                        | `none`                      | Transition for .frame-chat-message-meta, .frame-chat-message-actions; chat message meta transition 2.                                                                                   | `@media (prefers-reduced-motion: reduce) { .frame-chat-message-meta,   .frame-chat-message-actions }`                 |
| `--frame-chat-message-meta-opacity-2`                           | `frame.chat.message.meta.opacity.2`                           | `1`                         | Opacity for .frame-chat-message-meta, .frame-chat-message-actions; chat message meta opacity 2.                                                                                         | `@media (hover: none) { .frame-chat-message-meta,   .frame-chat-message-actions }`                                    |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
