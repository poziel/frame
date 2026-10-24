import { createApp, h } from 'vue';
import { createFrame, FrameShell } from '@frame/core';
import '../../../packages/core/src/style.css';

const frame = createFrame();
createApp({ setup: () => () => h('div', [
  h('button', { onClick: () => { frame.layout.manageButtonPosition = 'top'; } }, 'API top'),
  h('button', { onClick: () => { frame.layout.manageButtonPosition = 'bottom'; } }, 'API bottom'),
  h('button', { onClick: () => { frame.features.settings = !frame.features.settings; } }, 'Toggle settings'),
  h('button', { onClick: () => { frame.toolbar.setVisible('layoutControls', false); } }, 'Hide layout controls'),
  ...(['default', 'top', 'bottom'] as const).map(position => h('button', { onClick: () => { frame.layout.primaryViewBarPosition = position; } }, `Activity ${position}`)),
  h(FrameShell, { frame, style: 'height:650px;min-height:0' }, { 'status-actions': () => h('button', 'Notification history') }),
]) }).mount('#app');
