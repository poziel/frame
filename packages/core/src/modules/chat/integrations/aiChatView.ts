import {markRaw} from 'vue';
import type {ViewDefinition} from '../../../index';
import AIChat from '../components/AIChat.vue';
import type {AIChatController} from '../controllers/aiChat';
import type {AIChatHistoryController} from '../controllers/aiChatHistory';

export interface AIChatViewOptions {

  id: string;

  label?: string;

  chat?: AIChatController;

  history?: AIChatHistoryController;
}

/** Returns a definition only. The host explicitly registers, opens, and removes it. Controllers remain caller-owned. */
export function createAIChatView(options: AIChatViewOptions): ViewDefinition {
  if (!options.chat && !options.history)
    throw new Error('AI view requires a chat or history');
  return {
    id: options.id,
    label: options.label ?? 'AI chat',
    padded: false,
    component: markRaw(AIChat),
    props: {chat: options.chat, history: options.history},
  };
}
