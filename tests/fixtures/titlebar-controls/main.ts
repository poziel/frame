import {createApp, h, provide, ref} from 'vue';
import {createFrame} from '../../../packages/core/src/framework/frame';
import {frameKey} from '../../../packages/core/src/framework/useFrame';
import TitleBar from '../../../packages/core/src/components/framework/TitleBar.vue';
import '../../../packages/core/src/styles/index.scss';

const frame = createFrame({navigation: true}),
  maximized = ref(false),
  native = ref(true),
  command = ref(''),
  commands = ref(0);
createApp({
  setup() {
    provide(frameKey, frame);
    return () =>
      h('div', {class: 'workbench', style: 'height:240px'}, [
        h(TitleBar, {
          sidebarVisible: true,
          panelVisible: false,
          native: native.value,
          maximized: maximized.value,
          menuItems: [],
          titleText: 'Control fixture',
          showSearch: true,
          menuBarVisible: false,
          zenMode: false,
          primarySide: 'left',
          secondaryVisible: false,
          onExecute: (id: string) => {
            command.value = id;
            if (id === 'frame.window.maximize')
              maximized.value = !maximized.value;
          },
          onCommands: () => commands.value++,
        }),
        h(
          'button',
          {onClick: () => (native.value = !native.value)},
          'Toggle native controls'
        ),
        h('output', {id: 'command'}, command.value),
        h('output', {id: 'commands'}, commands.value),
      ]);
  },
}).mount('#app');
