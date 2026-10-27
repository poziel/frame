import {defineComponent, h, markRaw, shallowRef} from 'vue';
import {
  FrameIcon,
  type Frame,
  type PanelAction,
  type ViewDefinition,
} from '../../../index';
import TerminalView from '../components/TerminalView.vue';
import type {
  TerminalController,
  TerminalSessionLayout,
} from '../controllers/terminal';

/** Registers like any Frame view; its toolbar is supplied by Frame's own view header. */
export function createTerminalView(
  options: {
  id: string;
  terminal: TerminalController;
  frame: Frame;
  label?: string;
  autoStart?: boolean;
  sessionLayout?: TerminalSessionLayout;
}
): ViewDefinition {
  const instance = shallowRef<InstanceType<typeof TerminalView>>();
  const terminal = options.terminal;
  let profile: string | undefined;
  const run = (action: () => unknown | Promise<unknown>) => {
    void Promise.resolve().then(action).catch(terminal.reportError);
  };
  async function create(split = false) {
    await terminal.create(profile, {split});
  }
  async function chooseProfile() {
    const profiles = await terminal.detectProfiles();
    const selected = await options.frame.showQuickPick(
      profiles.map((p) => ({id: p.id, label: p.name, detail: p.path})),
      {
        title: 'New terminal with profile',
        placeholder: 'Choose an installed shell…',
      }
    );
    if (selected) {
      profile = selected.id;
      await create();
    }
  }
  function action(
    id: string,
    label: string,
    icon: string,
    execute: (anchor?: HTMLElement) => unknown
  ): PanelAction {
    return {
      id: `${options.id}.${id}`,
      label,
      icon: markRaw(() => h(FrameIcon, {name: icon})),
      run: (event?: MouseEvent) => {
        // Frame forwards the native click; capture its anchor before async dispatch clears currentTarget.
        const anchor =
          event?.currentTarget instanceof HTMLElement
            ? event.currentTarget
            : document.activeElement instanceof HTMLElement
              ? document.activeElement
              : undefined;
        run(() => execute(anchor));
      },
    };
  }
  return {
    id: options.id,
    label: options.label ?? 'Terminal',
    padded: false,
    icon: markRaw(() => h(FrameIcon, {name: 'terminal'})),
    component: markRaw(
      defineComponent({
        name: 'FrameTerminalView',
        setup: () => () =>
          h(TerminalView, {
            ref: instance,
            terminal,
            toolbar: false,
            autoStart: options.autoStart ?? true,
            sessionLayout: options.sessionLayout,
          }),
      })
    ),
    actions: [
      action('new', 'New terminal', 'add', () => create()),
      action(
        'profile',
        'New terminal with profile…',
        'chevron-down',
        chooseProfile
      ),
      action('split', 'Split terminal side by side', 'split-horizontal', () =>
        create(true)
      ),
      action('clear', 'Clear terminal', 'clear-all', () => terminal.clear()),
      action('close', 'Close terminal session', 'trash', () =>
        terminal.activeId.value
          ? terminal.close(terminal.activeId.value)
          : undefined
      ),
      action('options', 'Terminal options', 'ellipsis', (anchor) =>
        instance.value?.openMenu(anchor)
      ),
    ],
  };
}
