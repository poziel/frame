import {
  ChatController,
  ChatHistoryController,
  JsonLineAgentConnection,
  AgentChatSession,
  createAIChat,
  createAIChatHistory,
  type AIChatController,
  type ChatState,
} from '@frame/core/modules/chat';

const chat: AIChatController = new ChatController({
  respond(_request, response) {
    response.message('Ready');
  },
});
const factoryChat: AIChatController = createAIChat({respond() {}});
const facade = {...chat};
void facade.send;
const state: ChatState = chat.state;
state.draft = 'Hello';
const history = new ChatHistoryController({
  applicationId: 'app',
  createChat: () => factoryChat,
});
const compatibleHistory = createAIChatHistory({
  applicationId: 'app',
  createChat: () => chat,
});
void compatibleHistory.visible.value;
// @ts-expect-error Controllers hide response ownership from consumers.
void chat.active;
// @ts-expect-error Message roles are a closed set.
state.messages.push({role: 'system'});
const connection = new JsonLineAgentConnection({
  write(_line) {},
  subscribe(_listener) {
    return () => {};
  },
});
const startSession = (): Promise<AgentChatSession> =>
  AgentChatSession.create(connection, {
    provider: 'codex',
    applicationId: 'app',
    cwd: '.',
  });
void startSession;
connection.dispose();
history.dispose();
chat.dispose();
