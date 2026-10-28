# History

Optional in-memory conversations with an application scope and responsive chat navigation.

## Features

### What it does

AIHistory lists the conversations in an application-owned history store and places AIPrompt below them. Submitting that prompt creates and sends the first message in a new conversation; selecting a row reports the chosen conversation.

### When to use it

Use it for a dedicated history page or a sidebar in your own layout. AIChat supplies the combined navigation if you also want to display the selected conversation.

- Right-click a row or press Shift+F10 to rename, pin, archive, restore, or delete it. Pinned conversations appear first.
- Archived conversations stay in memory and are available through the quiet link below the list. Deleting disposes that conversation’s controller.
- Application scope shows this application’s conversations; all scope includes every host-created conversation already in this store. It does not import external agent sessions.
- The store owns chats created by its factory. Dispose the history once its application owner is done. Persistence and provider discovery belong to the host.

### List conversations and start a new one

The history starts empty. Each submitted prompt calls createChat once and starts that conversation. select and create let the host open a separate conversation surface.

<!-- frame:example id="ai-history.basic" -->

```vue
<script setup lang="ts">
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
</template>
```

### Manage history from application code

The API and context menu share the same state. Add custom row actions with contextActions and handle the action event in your application. showPrompt=false renders a list without a composer.

<!-- frame:example id="ai-history.actions" -->

```vue
<script setup lang="ts">
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
</template>
```

## APIs

<!-- frame:generated api="ai-history" -->

### AIHistory

Source: `packages/core/src/modules/chat/components/AIHistory.vue`

#### Properties

| Name                | Type                                                                            | Default                 | Description                                                                |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------- |
| `history`           | `AIChatHistoryController`                                                       | Required                | Caller-owned conversation store. Unmounting this list does not dispose it. |
| `showPrompt`        | `boolean \| undefined`                                                          | true                    | Includes the shared prompt for creating and sending a new conversation.    |
| `placeholder`       | `string \| undefined`                                                           | "Start a conversation…" | Prompt shown when the input is empty.                                      |
| `contextActions`    | `((conversation: AIChatConversation) => readonly FrameMenuItem[]) \| undefined` | Omitted                 | Adds row menu entries; selected host actions are emitted through action.   |
| `attachmentActions` | `readonly FrameMenuItem[] \| undefined`                                         | Omitted                 | Additional host actions offered by the attachment menu.                    |
| `speechEnabled`     | `boolean \| undefined`                                                          | false                   | Shows the speech action; the host handles the emitted speech request.      |

#### Events

| Name               | Parameters                                              | Return type | Description                                                              |
| ------------------ | ------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `select`           | `id: string`                                            | `void`      | Requests activation of the selected registered item ID.                  |
| `create`           | `conversation: AIChatConversation`                      | `void`      | Reports the newly created conversation.                                  |
| `attachmentAction` | `item: FrameMenuItem`                                   | `void`      | Reports selection of an application attachment-menu action.              |
| `speech`           | `None`                                                  | `void`      | Requests host-managed speech input.                                      |
| `action`           | `item: FrameMenuItem, conversation: AIChatConversation` | `void`      | Reports a selected application history-menu action and its conversation. |

#### Slots

| Name               | Parameters | Return type  | Description                                          |
| ------------------ | ---------- | ------------ | ---------------------------------------------------- |
| `composer-actions` | `None`     | `VNodeChild` | Additional actions in the new-conversation composer. |

#### Exposed API

| Name    | Parameters | Return type         | Description                                                                                       |
| ------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `focus` | `None`     | `void \| undefined` | Focuses the active input or terminal surface without creating or disposing its owning controller. |

### createAIChatHistory

Source: `packages/core/src/modules/chat/controllers/aiChatHistory.ts`

#### Properties

| Name            | Type                                  | Default  | Description                                                             |
| --------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `createChat`    | `() => AIChatController`              | Required | Creates a new owned controller only when create() is explicitly called. |
| `applicationId` | `string \| undefined`                 | Omitted  | Application scope identity, independent of the native provider session. |
| `scope`         | `"application" \| "all" \| undefined` | Omitted  | Initial application-only or all-in-memory-conversations filter.         |

#### Events

No declared entries.

#### Slots

No declared entries.

#### Exposed API

| Name                  | Parameters                                          | Return type                                                                                                                                                               | Description                                                                         |
| --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `createAIChatHistory` | `options: AIChatHistoryOptions`                     | `AIChatHistoryController`                                                                                                                                                 | Creates a class-backed history store through the existing public factory.           |
| `active`              | `None`                                              | `ComputedRef<AIChatConversation \| undefined>`                                                                                                                            | Selected conversation in scope, including its retained chat state.                  |
| `dispose`             | `None`                                              | `void`                                                                                                                                                                    | Disposes every owned chat exactly once and empties history.                         |
| `visible`             | `None`                                              | `ComputedRef<AIChatConversation[]>`                                                                                                                                       | Unarchived conversations, with pinned entries ordered first.                        |
| `archived`            | `None`                                              | `ComputedRef<AIChatConversation[]>`                                                                                                                                       | Archived conversations retained in the current scope.                               |
| `conversations`       | `None`                                              | `ComputedRef<AIChatConversation[]>`                                                                                                                                       | Snapshot of metadata entries; each entry retains its chat controller identity.      |
| `activeId`            | `None`                                              | `ComputedRef<string \| undefined>`                                                                                                                                        | Readonly reactive identity of the selected conversation.                            |
| `scope`               | `None`                                              | `ComputedRef<"application" \| "all">`                                                                                                                                     | Readonly reactive filter controlled through setScope.                               |
| `create`              | `title: string, applicationId: string \| undefined` | `ShallowReactive<{ id: string; title: string; applicationId: string \| undefined; createdAt: number; pinned: boolean; archived: boolean; chat: Raw<AIChatController>; }>` | Creates and owns a chat only on explicit request, then selects its conversation.    |
| `select`              | `id: string`                                        | `boolean`                                                                                                                                                                 | Selects an existing in-scope conversation without replacing its controller.         |
| `rename`              | `id: string, title: string`                         | `boolean`                                                                                                                                                                 | Updates a conversation title after trimming and validating it.                      |
| `pin`                 | `id: string, value: boolean`                        | `boolean`                                                                                                                                                                 | Changes history ordering without replacing the conversation or chat.                |
| `archive`             | `id: string, value: boolean`                        | `boolean`                                                                                                                                                                 | Changes archive status and clears selection when archiving the active conversation. |
| `remove`              | `id: string`                                        | `boolean`                                                                                                                                                                 | Removes one conversation and disposes its owned chat.                               |
| `setScope`            | `value: "application" \| "all"`                     | `void`                                                                                                                                                                    | Changes discovery scope without fetching external provider conversations.           |

<!-- /frame:generated -->

## Styling

Use the shared theme variables in application content. Component-specific declarations and their defaults are listed below.

<!-- frame:generated styles="ai-history" -->

| CSS variable                           | Theme path                           | Default expression | Purpose                                                                         | Context                                              |
| -------------------------------------- | ------------------------------------ | ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `--frame-ai-history-padding`           | `frame.ai.history.padding`           | `12px`             | Internal spacing for .frame-chat-history.                                       | `.frame-chat-history`                                |
| `--frame-font-size`                    | `frame.font.size`                    | `13px`             | Text size for .frame-chat-history.                                              | `.frame-chat-history`                                |
| `--frame-muted`                        | `frame.muted`                        | `#8e9496`          | Secondary foreground for descriptions, hints, and visually subordinate content. | `.frame-chat-history-empty`                          |
| `--frame-ai-history-prompt-padding`    | `frame.ai.history.prompt.padding`    | `12px`             | Internal spacing for .frame-ai-history-prompt.                                  | `.frame-ai-history-prompt`                           |
| `--frame-ai-history-footer-padding`    | `frame.ai.history.footer.padding`    | `0 12px`           | Internal spacing for .frame-ai-history-footer.                                  | `.frame-ai-history-footer`                           |
| `--frame-ai-history-archive-font-size` | `frame.ai.history.archive.font.size` | `11px`             | Text size for .frame-ai-history-footer .frame-ai-history-archive.               | `.frame-ai-history-footer .frame-ai-history-archive` |
| `--frame-muted`                        | `frame.muted`                        | `#8e9496`          | Secondary foreground for descriptions, hints, and visually subordinate content. | `.frame-ai-history-footer .frame-ai-history-archive` |
| `--frame-ai-history-row-gap`           | `frame.ai.history.row.gap`           | `6px`              | Space between children for .frame-chat-history .frame-chat-history-row.         | `.frame-chat-history .frame-chat-history-row`        |
| `--frame-list-selection-background`    | `frame.list.selection.background`    | `#ffffff12`        | Background for .frame-chat-history-row[aria-current='page'].                    | `.frame-chat-history-row[aria-current='page']`       |

Expressions are preserved as written; their computed values depend on the active theme and component state.

<!-- /frame:generated -->
