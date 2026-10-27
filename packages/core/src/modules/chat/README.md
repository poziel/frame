# Chat module

Public entry: `@frame/core/modules/chat`. The root `index.ts` preserves component,
controller, agent-adapter, and compatibility-alias exports and imports the shared
stylesheet.

- `components/`: the assistant, prompt, conversation, and history surfaces.
  `conversation/` holds turn, activity, interaction, artifact, and event rows;
  `content/` holds Markdown rendering.
- `controllers/`: conversation state, conversation history, and approval/question
  interaction lifecycle.
- `services/agents/`: agent sessions and JSON-line connections.
- `services/content/`: Markdown rendering, message snapshots, and part processing.
- `integrations/`: the explicit Frame view definition helper.
- `types/`: data-only chat and agent contracts with documented members and
  discriminated event variants.
- `styles/index.css`: shared chat presentation.

The application owns providers, adapters, persistence, and explicit creation.
Creating a view definition does not register a sidebar or dispose caller-owned
conversation state. See the [shared module structure](../README.md#shared-module-structure)
for the root conventions used by every module.

## Class ownership

| Class                     | Responsibility                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `ChatController`          | One conversation's reactive messages, draft, rewind preview, and active response            |
| `ChatTurn`                | One response writer, abort controller, completion promise, and generation ownership checks  |
| `ChatInteractions`        | Pending approvals/questions for one response, including resolver cleanup                    |
| `ChatHistoryController`   | Lazy in-memory conversations, selection, scope, and disposal of owned chats                 |
| `AgentChatController`     | Conversation behavior that rejects local rewrites of provider-owned history                 |
| `JsonLineAgentConnection` | Host transport subscription, bounded JSON-line framing, RPC correlation, and request timers |
| `AgentChatTurn`           | One native turn's filtered events, subscriptions, artifact jobs, and interaction replies    |
| `AgentChatSession`        | Explicit native session metadata, its conversation controller, and session closure          |

Each class lives in its own file. Properties precede the constructor, public
operations precede private helpers, and members use the shared TSDoc and spacing
standards. Components remain presentation surfaces; snapshots, metadata, and
message parts remain typed data. Pure validation, copying, rendering, grouping,
and view-definition helpers remain functions.

## Existing factories and new constructors

Public factories remain available and return the new class instances:

```ts
import {ChatController, createAIChat, createAIChatHistory} from '@frame/core/modules/chat';

const chat = new ChatController({respond: (_request, writer) => {
  writer.message('Hello');
}});
const equivalent = createAIChat({respond: (_request, writer) => {
  writer.message('Hello');
}});
const history = createAIChatHistory({applicationId: 'app', createChat: () =>
  createAIChat({respond: (_request, writer) => {writer.message('Hello');}}),
});
```

In an application, the history factory should supply a fresh owned chat on each
call. Both conversation construction forms start no request. History creates no
chat until `create()` is called. `AIChatController` and
`AIChatHistoryController` remain structural public contracts, so host-provided
implementations and existing component props do not require class inheritance.

Public conversation, history, response-writer, connection, and session cleanup
operations retain callback binding where existing consumers can pass them
independently. A responder may retain a writer, but completed or cancelled turns
reject later writes. Approval/question resolvers belong to that turn and settle
once. Pending input prevents successful completion until answered or cancelled.

`createJsonLineAgentConnection` returns `JsonLineAgentConnection`. Construction
subscribes to the supplied transport without starting a process or sending an
RPC. Disposing the adapter releases its subscription and request timers; the
host retains ownership of the transport/process.

`createAgentChatSession` delegates to `AgentChatSession.create`, which explicitly
requests a native session. The session constructor can wrap already-created
session metadata without making a request. Its chat rejects local clear/rewind
before mutating history. Disposal stops its chat and requests session closure,
while leaving a shared connection caller-owned. Host attachment preparation and
artifact authorization callbacks retain their existing responsibilities.

## Contracts and snapshots

`types/chatTypes.ts` describes conversation data, ordered response parts,
interaction schemas/results, and the host responder/writer boundary.
`types/agentTypes.ts` describes provider capabilities, session configuration,
normalized events, host callbacks, and transport/framing contracts. Interfaces
and discriminated unions remain plain data; their lifecycle belongs to the
existing controllers and agent services rather than new type-wrapper classes.

`copyChatPart()` and `copyChatMessages()` live in `services/content/chatParts.ts`
with the presentation helpers that consume them. Snapshot copying recreates
message/attachment containers and nested question, choice, and answer arrays.
Browser File objects and artifact URLs retain their original identities and
host-owned resource lifetimes. Copying starts no request and loads no resource.
Public chat and agent contract names and their property shapes are unchanged.
