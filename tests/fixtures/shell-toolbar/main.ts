import {createApp, defineComponent, h, ref} from 'vue';
import {createFrame, FrameShell} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

const frame = createFrame({navigation: true});
(window as any).toolbarFixture = frame;
frame.registerToolbarAction({
  id: 'primary',
  label: 'Custom action',
  run() {
    runs.value++;
  },
});
const runs = ref(0),
  mounted = ref(true);
frame.registerSidePanel({
  id: 'sample',
  label: 'Sample',
  component: defineComponent({render: () => h('p', 'Sample content')}),
});
createApp({
  setup() {
    return () =>
      h('div', [
        h(
          'button',
          {
            id: 'remount',
            onClick: () => {
              mounted.value = !mounted.value;
            },
          },
          'Toggle shell'
        ),
        h('output', {id: 'runs'}, String(runs.value)),
        mounted.value
          ? h(FrameShell, {
              frame,
              titleText: 'Toolbar fixture',
              menuItems: [
                {
                  id: 'file',
                  label: 'File',
                  children: [{id: 'test', label: 'Test'}],
                },
              ],
              style: 'height:650px;min-height:0',
            })
          : null,
      ]);
  },
}).mount('#app');
