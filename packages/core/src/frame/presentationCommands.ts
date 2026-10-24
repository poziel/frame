import type { Frame } from './createFrame';

/** Public setters and shell controls invoke the same commands as menus and shortcuts. */
export function connectPresentationCommands(frame: Frame) {
  const run = (id: string) => {
    if (!frame.commands.isEnabled(id)) return false;
    void frame.commands.execute(id); return true;
  };
  for (const name of ['primaryViewBar', 'secondaryViewBar', 'panelViewBar', 'navigationBar'] as const) {
    const bar = frame[name];
    bar.open = () => { run(`frame.${name}.open`); };
    bar.close = () => { run(`frame.${name}.close`); };
    bar.toggle = () => { run(`frame.${name}.toggle`); };
    bar.setDisplay = value => run(`frame.${name}.display.${value}`);
    bar.setSize = value => run(`frame.${name}.size.${value}`);
  }
  for (const name of ['primaryViewBar', 'secondaryViewBar'] as const) frame[name].setPosition = value => run(`frame.${name}.position.${value}`);
  frame.navigationBar.setPosition = value => run(`frame.navigationBar.position.${value}`);
  frame.panelViewBar.setBarVisible = value => run(`frame.panelViewBar.${value ? 'open' : 'close'}`);
  frame.navigationBar.setVisible = value => run(`frame.navigationBar.${value ? 'open' : 'close'}`);
  frame.panel.setPosition = value => run(`frame.layout.panel.position.${value}`);
  frame.panel.setAlignment = value => run(`frame.layout.panel.${value}`);
}
