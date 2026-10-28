# Prompt

A standalone message composer with attachments, Send, Stop, and host voice hooks.

## Features

### What it does

AIPrompt is the message-entry control: a multiline field, attachment menu, Send button, and optional Stop and voice actions. It contains no transcript, conversation store, or AI connection.

### When to use it

Use it in a conversation, beneath a history list to start a new conversation, or inside your own application flow. The host owns text, attachments, submission, and the working state.

- Enter submits a non-empty message; Shift+Enter adds a line. IME confirmation does not submit.
- Submitting emits text and attachments without clearing either model. Clear them after your application accepts the message.
- busy replaces Send with Stop while keeping the next draft editable. disabled prevents editing and actions.
- The preferred minimum width is 280px. It adapts to smaller hosts without forcing horizontal overflow; override --frame-ai-prompt-min-width to change it.

### Write and submit a message

Bind the draft with v-model and handle submit. This complete example displays the submitted text and clears the accepted draft.

<!-- frame:example id="ai-prompt.basic" -->

```vue
<script setup lang="ts">
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
</template>
```

### Keep attachments under application ownership

v-model:attachments holds local files, folders, and context items. A custom menu action is reported to the host; choosing it below adds an application context chip. File selection does not upload anything.

<!-- frame:example id="ai-prompt.attachments" -->

```vue
<script setup lang="ts">
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
</template>
```

### Show working and unavailable states

The host controls busy and disabled independently. This local example starts a working state on submit, supports Stop, and provides an explicit Finish action. A real responder would finish when its request settles.

<!-- frame:example id="ai-prompt.working" -->

```vue
<script setup lang="ts">
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
</template>
```

## APIs

<!-- frame:generated api="ai-prompt" -->

### AIPrompt

Source: `packages/core/src/modules/chat/components/AIPrompt.vue`

#### Properties

| Name                | Type                                    | Default            | Description                                                                          |
| ------------------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `modelValue`        | `string \| undefined`                   | ""                 | Host-owned draft. Submission does not clear it automatically.                        |
| `attachments`       | `ChatAttachment[] \| undefined`         | []                 | Local files, folders, and context chips; never uploaded by the component.            |
| `busy`              | `boolean \| undefined`                  | false              | Shows Stop instead of Send while allowing the next draft to be edited.               |
| `disabled`          | `boolean \| undefined`                  | false              | Prevents editing, attachment selection, submission, and Stop.                        |
| `placeholder`       | `string \| undefined`                   | "Write a message…" | Prompt shown when the input is empty.                                                |
| `label`             | `string \| undefined`                   | "Message"          | Accessible name or visible label for the rendered control.                           |
| `attachmentActions` | `readonly FrameMenuItem[] \| undefined` | []                 | Extra context-menu choices reported through attachmentAction.                        |
| `speechEnabled`     | `boolean \| undefined`                  | false              | Enables the voice button; the host handles the speech event.                         |
| `allowAttachments`  | `boolean \| undefined`                  | true               | Offers file and folder attachment controls; files remain host-owned until submitted. |

#### Events

| Name                 | Parameters                                                | Return type | Description                                                            |
| -------------------- | --------------------------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `update:modelValue`  | `value: string`                                           | `void`      | Requests a new controlled value after input interaction.               |
| `submit`             | `value: { text: string; attachments: ChatAttachment[]; }` | `void`      | Reports the draft text and attachments for host-controlled submission. |
| `stop`               | `None`                                                    | `void`      | Requests cancellation of the current response.                         |
| `attachmentAction`   | `item: FrameMenuItem`                                     | `void`      | Reports selection of an application attachment-menu action.            |
| `speech`             | `None`                                                    | `void`      | Requests host-managed speech input.                                    |
| `update:attachments` | `value: ChatAttachment[]`                                 | `void`      | Requests an updated attachment collection after selection or removal.  |
| `cancel`             | `None`                                                    | `void`      | Requests cancellation of the current prompt interaction.               |

#### Slots

| Name           | Parameters | Return type  | Description                                                |
| -------------- | ---------- | ------------ | ---------------------------------------------------------- |
| `before-input` | `None`     | `VNodeChild` | Content before the draft input, such as context chips.     |
| `actions`      | `None`     | `VNodeChild` | Additional composer actions before the send/stop controls. |

#### Exposed API

| Name      | Parameters | Return type | Description                                                                                       |
| --------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `focus`   | `None`     | `void`      | Focuses the active input or terminal surface without creating or disposing its owning controller. |
| `measure` | `None`     | `void`      | Recalculates the draft input height after host content or layout changes.                         |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="ai-prompt" -->

| CSS variable                                   | Theme path                                   | Default expression                                                                                                                                             | Purpose                                                                                                                                         | Context                                                                                             |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `--frame-ai-prompt-min-width`                  | `frame.ai.prompt.min.width`                  | `280px`                                                                                                                                                        | Minimum width for .frame-ai-prompt.                                                                                                             | `.frame-ai-prompt`                                                                                  |
| `--frame-text`                                 | `frame.text`                                 | `#ccc`                                                                                                                                                         | Foreground for .frame-ai-prompt.                                                                                                                | `.frame-ai-prompt`                                                                                  |
| `--frame-font-body`                            | `frame.font.body`                            | `sans-serif`                                                                                                                                                   | Value of font for .frame-ai-prompt. Used when --frame-ai-prompt-font is unset.                                                                  | `.frame-ai-prompt`                                                                                  |
| `--frame-ai-prompt-font`                       | `frame.ai.prompt.font`                       | `13px/1.6     var(--frame-font-body, sans-serif)`                                                                                                              | Value of font for .frame-ai-prompt.                                                                                                             | `.frame-ai-prompt`                                                                                  |
| `--frame-chat-composer-border`                 | `frame.chat.composer.border`                 | `1px solid #ffffff24`                                                                                                                                          | Border for .frame-chat-composer.                                                                                                                | `.frame-chat-composer`                                                                              |
| `--frame-chat-composer-border-radius`          | `frame.chat.composer.border.radius`          | `7px`                                                                                                                                                          | Corner radius for .frame-chat-composer.                                                                                                         | `.frame-chat-composer`                                                                              |
| `--frame-surface`                              | `frame.surface`                              | `#181818`                                                                                                                                                      | Background for .frame-chat-composer.                                                                                                            | `.frame-chat-composer`                                                                              |
| `--frame-chat-composer-padding`                | `frame.chat.composer.padding`                | `8px`                                                                                                                                                          | Internal spacing for .frame-chat-composer.                                                                                                      | `.frame-chat-composer`                                                                              |
| `--frame-accent`                               | `frame.accent`                               | `#0078d4`                                                                                                                                                      | Border color for .frame-chat-composer.populated, .frame-chat-composer:focus-within, .frame-chat-composer.rewinding.                             | `.frame-chat-composer.populated, .frame-chat-composer:focus-within, .frame-chat-composer.rewinding` |
| `--frame-chat-composer-textarea-width`         | `frame.chat.composer.textarea.width`         | `100%`                                                                                                                                                         | Width for .frame-chat-composer textarea.                                                                                                        | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-min-height`    | `frame.chat.composer.textarea.min.height`    | `42px`                                                                                                                                                         | Minimum height for .frame-chat-composer textarea.                                                                                               | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-max-height`    | `frame.chat.composer.textarea.max.height`    | `180px`                                                                                                                                                        | Maximum height for .frame-chat-composer textarea.                                                                                               | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-padding`       | `frame.chat.composer.textarea.padding`       | `2px`                                                                                                                                                          | Internal spacing for .frame-chat-composer textarea.                                                                                             | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-border`        | `frame.chat.composer.textarea.border`        | `0`                                                                                                                                                            | Border for .frame-chat-composer textarea.                                                                                                       | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-outline`       | `frame.chat.composer.textarea.outline`       | `none`                                                                                                                                                         | Outline for .frame-chat-composer textarea.                                                                                                      | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-box-shadow`    | `frame.chat.composer.textarea.box.shadow`    | `none`                                                                                                                                                         | Elevation shadow for .frame-chat-composer textarea.                                                                                             | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-background`    | `frame.chat.composer.textarea.background`    | `transparent`                                                                                                                                                  | Background for .frame-chat-composer textarea.                                                                                                   | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-line-height`   | `frame.chat.composer.textarea.line.height`   | `1.6`                                                                                                                                                          | Text line height for .frame-chat-composer textarea.                                                                                             | `.frame-chat-composer textarea`                                                                     |
| `--frame-chat-composer-textarea-border`        | `frame.chat.composer.textarea.border`        | `0`                                                                                                                                                            | Default used by --frame-text-area-focus-border on .frame-chat-composer textarea.frame-text-area.                                                | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-text-area-border`                     | `frame.text.area.border`                     | `var(     --frame-chat-composer-textarea-border,     0   )`                                                                                                    | Resting text-area border within the chat composer.                                                                                              | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-text-area-hover-border`               | `frame.text.area.hover.border`               | `var(     --frame-chat-composer-textarea-border,     0   )`                                                                                                    | Hovered text-area border within the chat composer.                                                                                              | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-text-area-focus-border`               | `frame.text.area.focus.border`               | `var(     --frame-chat-composer-textarea-border,     0   )`                                                                                                    | Focused text-area border within the chat composer.                                                                                              | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-chat-composer-textarea-outline`       | `frame.chat.composer.textarea.outline`       | `none`                                                                                                                                                         | Default used by --frame-text-area-focus-outline on .frame-chat-composer textarea.frame-text-area.                                               | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-text-area-hover-outline`              | `frame.text.area.hover.outline`              | `var(     --frame-chat-composer-textarea-outline,     none   )`                                                                                                | Hovered text-area outline within the chat composer.                                                                                             | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-text-area-focus-outline`              | `frame.text.area.focus.outline`              | `var(     --frame-chat-composer-textarea-outline,     none   )`                                                                                                | Focused text-area outline within the chat composer.                                                                                             | `.frame-chat-composer textarea.frame-text-area`                                                     |
| `--frame-muted`                                | `frame.muted`                                | `#999`                                                                                                                                                         | Foreground for .frame-chat-composer textarea::placeholder.                                                                                      | `.frame-chat-composer textarea::placeholder`                                                        |
| `--frame-chat-composer-actions-gap`            | `frame.chat.composer.actions.gap`            | `4px`                                                                                                                                                          | Space between children for .frame-chat-composer-actions.                                                                                        | `.frame-chat-composer-actions`                                                                      |
| `--frame-chat-composer-actions-padding-top`    | `frame.chat.composer.actions.padding.top`    | `5px`                                                                                                                                                          | Top internal spacing for .frame-chat-composer-actions.                                                                                          | `.frame-chat-composer-actions`                                                                      |
| `--frame-chat-send-not-disabled-border-radius` | `frame.chat.send.not.disabled.border.radius` | `50%`                                                                                                                                                          | Corner radius for .frame-chat-send:not(:disabled).                                                                                              | `.frame-chat-send:not(:disabled)`                                                                   |
| `--frame-accent`                               | `frame.accent`                               | `#0078d4`                                                                                                                                                      | Background for .frame-chat-send:not(:disabled).                                                                                                 | `.frame-chat-send:not(:disabled)`                                                                   |
| `--frame-chat-send-not-disabled-color`         | `frame.chat.send.not.disabled.color`         | `white`                                                                                                                                                        | Foreground for .frame-chat-send:not(:disabled).                                                                                                 | `.frame-chat-send:not(:disabled)`                                                                   |
| `--frame-chat-attachments-gap`                 | `frame.chat.attachments.gap`                 | `5px`                                                                                                                                                          | Space between children for .frame-chat-attachments.                                                                                             | `.frame-chat-attachments`                                                                           |
| `--frame-chat-attachments-margin-bottom`       | `frame.chat.attachments.margin.bottom`       | `6px`                                                                                                                                                          | Bottom outer spacing for .frame-chat-attachments.                                                                                               | `.frame-chat-attachments`                                                                           |
| `--frame-chat-attachments-max-width`           | `frame.chat.attachments.max.width`           | `100%`                                                                                                                                                         | Maximum width for .frame-chat-attachments.                                                                                                      | `.frame-chat-attachments`                                                                           |
| `--frame-chat-chip-gap`                        | `frame.chat.chip.gap`                        | `5px`                                                                                                                                                          | Space between children for .frame-chat-chip.                                                                                                    | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-border-radius`              | `frame.chat.chip.border.radius`              | `4px`                                                                                                                                                          | Corner radius for .frame-chat-chip.                                                                                                             | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-background`                 | `frame.chat.chip.background`                 | `#ffffff0b`                                                                                                                                                    | Background for .frame-chat-chip.                                                                                                                | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-border`                     | `frame.chat.chip.border`                     | `1px solid #ffffff16`                                                                                                                                          | Border for .frame-chat-chip.                                                                                                                    | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-padding`                    | `frame.chat.chip.padding`                    | `2px 6px`                                                                                                                                                      | Internal spacing for .frame-chat-chip.                                                                                                          | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-font-size`                  | `frame.chat.chip.font.size`                  | `11px`                                                                                                                                                         | Text size for .frame-chat-chip.                                                                                                                 | `.frame-chat-chip`                                                                                  |
| `--frame-chat-chip-max-width`                  | `frame.chat.chip.max.width`                  | `100%`                                                                                                                                                         | Maximum width for .frame-chat-chip.                                                                                                             | `.frame-chat-chip`                                                                                  |
| `--frame-chat-composer-busy-before-padding`    | `frame.chat.composer.busy.before.padding`    | `1px`                                                                                                                                                          | Internal spacing for .frame-chat-composer.busy::before.                                                                                         | `.frame-chat-composer.busy::before`                                                                 |
| `--frame-accent`                               | `frame.accent`                               | `#0078d4`                                                                                                                                                      | Background for .frame-chat-composer.busy::before. Used when --frame-chat-composer-busy-highlight and --frame-chat-composer-busy-color is unset. | `.frame-chat-composer.busy::before`                                                                 |
| `--frame-chat-composer-busy-color`             | `frame.chat.composer.busy.color`             | `var(     --frame-accent,     #0078d4   )`                                                                                                                     | Background for .frame-chat-composer.busy::before. Used when --frame-chat-composer-busy-highlight is unset.                                      | `.frame-chat-composer.busy::before`                                                                 |
| `--frame-chat-composer-busy-highlight`         | `frame.chat.composer.busy.highlight`         | `color-mix(     in srgb,     var(         --frame-chat-composer-busy-color,         var(     --frame-accent,     #0078d4   )       )       65%,     white   )` | Background for .frame-chat-composer.busy::before.                                                                                               | `.frame-chat-composer.busy::before`                                                                 |
| `--frame-chat-angle`                           | `frame.chat.angle`                           | No declared default; supplied by context.                                                                                                                      | Rotation angle supplied by the busy composer orbit animation, starting at its registered zero angle.                                            | `.frame-chat-composer.busy::before`                                                                 |
| `--frame-accent`                               | `frame.accent`                               | `#0078d4`                                                                                                                                                      | Background for .frame-chat-composer.busy::before. Used when --frame-chat-composer-busy-color is unset.                                          | `@media (prefers-reduced-motion: reduce) { .frame-chat-composer.busy::before }`                     |
| `--frame-chat-composer-busy-color`             | `frame.chat.composer.busy.color`             | `var(       --frame-accent,       #0078d4     )`                                                                                                               | Background for .frame-chat-composer.busy::before.                                                                                               | `@media (prefers-reduced-motion: reduce) { .frame-chat-composer.busy::before }`                     |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
