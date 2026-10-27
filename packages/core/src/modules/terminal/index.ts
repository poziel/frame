import './styles/index.css';

export {default as Terminal} from './components/Terminal.vue';
export {default as TerminalView} from './components/TerminalView.vue';
export {
  createTerminal,
  TerminalSessionController,
} from './controllers/terminal';
export {createTerminalView} from './integrations/terminalView';
export type {TerminalController} from './controllers/terminal';
export type {
  TerminalCreateOptions,
  TerminalOptions,
  TerminalProfile,
  TerminalSession,
  TerminalBackend,
  TerminalEvent,
  TerminalSpawnOptions,
  TerminalSessionLayout,
} from './types/terminalTypes';
