import {createApp, h} from 'vue';
import {
  createAIChat,
  type AIChatController,
  type ChatResponseWriter,
} from '../../../packages/core/src/modules/chat/controllers/aiChat';
import AIChat from '../../../packages/core/src/modules/chat/components/AIChat.vue';
import '../../../packages/core/src/styles/index.scss';

const fixture: {chat?: AIChatController; writer?: ChatResponseWriter} = {};
fixture.chat = createAIChat({
  respond(_request, writer) {
    fixture.writer = writer;
    return new Promise<void>(() => {});
  },
});
(window as unknown as {richChatFixture: typeof fixture}).richChatFixture =
  fixture;
createApp({
  render: () =>
    h(
      'div',
      {style: 'height: 90vh; width: 340px'},
      h(AIChat, {chat: fixture.chat!})
    ),
}).mount('#app');
