import { createApp, h } from 'vue';
import { createAIChat, type AIChatController, type ChatResponseWriter } from '../../../packages/features/src/aiChat';
import AIChat from '../../../packages/features/src/AIChat.vue';
import '../../../packages/core/src/style.css';
import '../../../packages/features/src/style.css';

const fixture: { chat?: AIChatController; writer?: ChatResponseWriter } = {};
fixture.chat = createAIChat({ respond(_request, writer) { fixture.writer = writer; return new Promise<void>(() => {}); } });
(window as unknown as { richChatFixture: typeof fixture }).richChatFixture = fixture;
createApp({ render: () => h('div', { style: 'height: 90vh; width: 340px' }, h(AIChat, { chat: fixture.chat! })) }).mount('#app');
