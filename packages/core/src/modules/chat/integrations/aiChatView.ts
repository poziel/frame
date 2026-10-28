import {markRaw} from 'vue';
import type {ViewDefinition} from '../../../index';
import AIChat from '../components/AIChat.vue';
import type {AIChatController} from '../controllers/aiChat';
import type {AIChatHistoryController} from '../controllers/aiChatHistory';

/** Caller-owned controllers presented by an explicitly registered chat view. */
export interface AIChatViewOptions {

  /** Unique view registration ID within the receiving Frame instance. */
  id: string;

  /** View selector label; defaults to AI chat when omitted. */
  label?: string;

  /** Existing caller-owned chat; supply this or a conversation history. */
  chat?: AIChatController;

  /** Existing caller-owned history; registration does not create conversations. */
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
