import './styles/index.scss';

export {default as AIChat} from './components/AIChat.vue';
export {createAIChat} from './controllers/aiChat';
export {default as AIPrompt} from './components/AIPrompt.vue';
export {default as AIConversation} from './components/AIConversation.vue';
export {default as AIHistory} from './components/AIHistory.vue';
export {default as AIView} from './components/AIChat.vue';
export {default as AIChatHistory} from './components/AIHistory.vue';
export {createAIChatView} from './integrations/aiChatView';
export type {AIChatViewOptions} from './integrations/aiChatView';
export {createAIChatHistory} from './controllers/aiChatHistory';
export type {
  AIChatHistoryController,
  AIChatHistoryOptions,
  AIChatConversation,
} from './controllers/aiChatHistory';
export type {AIChatController} from './controllers/aiChat';
export type * from './types/chatTypes';
export {
  AgentChatSession,
  createAgentChatSession,
} from './services/agents/agentChatSession';
export type {AgentChatSessionController} from './services/agents/agentChatSession';
export {
  JsonLineAgentConnection,
  createJsonLineAgentConnection,
} from './services/agents/jsonLineAgentConnection';
export {ChatController} from './controllers/aiChat';
export {ChatHistoryController} from './controllers/aiChatHistory';
export type * from './types/agentTypes';
