import type {Frame} from '../frame';

/** Public setters and shell controls invoke the same commands as menus and shortcuts. */
export class ShellCommandBindings {

  /** Frame whose public presentation methods route through command guards. */
  private readonly frame: Frame;

  /** Creates a routing adapter after built-in commands have captured raw methods. */
  constructor(frame: Frame) {
    this.frame = frame;
  }

  /** Connects public presentation operations to their registered commands. */
  connect(): void {
    const frame = this.frame;
    for (const name of [
      'primaryViewBar',
      'secondaryViewBar',
      'panelViewBar',
      'navigationBar',
    ] as const) {
      const bar = frame[name];
      bar.open = () => {
        this.run(`frame.${name}.open`);
      };
      bar.close = () => {
        this.run(`frame.${name}.close`);
      };
      bar.toggle = () => {
        this.run(`frame.${name}.toggle`);
      };
      bar.setDisplay = (value) => this.run(`frame.${name}.display.${value}`);
      bar.setSize = (value) => this.run(`frame.${name}.size.${value}`);
    }
    for (const name of ['primaryViewBar', 'secondaryViewBar'] as const)
      frame[name].setPosition = (value) =>
        this.run(`frame.${name}.position.${value}`);
    frame.navigationBar.setPosition = (value) =>
      this.run(`frame.navigationBar.position.${value}`);
    frame.panelViewBar.setBarVisible = (value) =>
      this.run(`frame.panelViewBar.${value ? 'open' : 'close'}`);
    frame.navigationBar.setVisible = (value) =>
      this.run(`frame.navigationBar.${value ? 'open' : 'close'}`);
    frame.panel.setPosition = (value) =>
      this.run(`frame.layout.panel.position.${value}`);
    frame.panel.setAlignment = (value) =>
      this.run(`frame.layout.panel.${value}`);
  }

  /** Executes an enabled presentation command and reports whether it was accepted. */
  private run(id: string): boolean {
    if (!this.frame.commands.isEnabled(id)) return false;
    void this.frame.commands.execute(id);
    return true;
  }
}
