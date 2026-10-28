import {createApp, defineComponent, h, ref} from 'vue';
import {
  createFrame,
  FrameShell,
  FrameButton,
  FrameMenu,
  ContextMenu,
  FrameDropdownMenu,
  FrameContextMenu,
  FrameMenubar,
  type FrameMenuItem,
} from '@frame/core';
import '../../../packages/core/src/styles/index.scss';

const frames = [createFrame(), createFrame()];
const selected = ref('none'),
  events = ref(0);
const alignment = ref<'left' | 'center' | 'right'>('left');
(globalThis as typeof globalThis & {__menuAlignment: unknown}).__menuAlignment =
  alignment;
const items: FrameMenuItem[] = [
  {id: 'alpha', label: 'Alpha', shortcut: 'Ctrl+A'},
  {id: 'disabled', label: 'Blocked', disabled: true},
  {id: 'sep', type: 'separator'},
  {id: 'checked', label: 'Show badge', checked: true, visibility: true},
  {
    id: 'sub',
    label: 'Options',
    children: [
      {id: 'child', label: 'Child action'},
      {
        id: 'deep',
        label: 'Advanced',
        children: [{id: 'deep-child', label: 'Deep action'}],
      },
    ],
  },
  {id: 'zulu', label: 'Zulu'},
];
for (const [i, frame] of frames.entries()) {
  frame.layout.primarySidebarVisible = false;
  frame.layout.secondarySidebarVisible = false;
  frame.layout.panelVisible = false;
  const Content = defineComponent({
    setup() {
      const anchor = ref<HTMLElement>(),
        open = ref(false),
        point = ref<{x: number; y: number}>();
      return () =>
        h('div', {style: 'padding:12px'}, [
          h(
            FrameButton,
            {
              onClick: (e: MouseEvent) => {
                anchor.value = e.currentTarget as HTMLElement;
                point.value = undefined;
                open.value = !open.value;
              },
            },
            () => `Open menu ${i}`
          ),
          h(
            'button',
            {onClick: () => (selected.value = 'outside')},
            'Outside ' + i
          ),
          h(FrameDropdownMenu, {
            items,
            label: 'Reusable dropdown ' + i,
            triggerLabel: 'Dropdown ' + i,
            onSelect: (item: FrameMenuItem) => (selected.value = item.id),
          }),
          h(FrameContextMenu, {
            items,
            label: 'Reusable context ' + i,
            triggerLabel: 'Context ' + i,
            onSelect: (item: FrameMenuItem) => (selected.value = item.id),
          }),
          h(FrameMenubar, {
            menus: [
              {id: 'file', label: 'File', children: items},
              {
                id: 'edit',
                label: 'Edit',
                children: [{id: 'copy', label: 'Copy'}],
              },
              {
                id: 'help',
                label: 'Help',
                children: [{id: 'about', label: 'About'}],
              },
              {
                id: 'tools',
                label: 'Tools',
                children: [{id: 'tool', label: 'Tool action'}],
              },
            ],
            maxVisible: 3,
            label: 'Reusable menubar ' + i,
          }),
          h(
            ContextMenu,
            {items, label: 'Wrapped menu ' + i, itemAlignment: alignment.value},
            () => h('span', 'Wrapped context area ' + i)
          ),
          h(
            'div',
            {
              style: 'height:200px',
              onContextmenu: (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                anchor.value = e.currentTarget as HTMLElement;
                point.value = {x: e.clientX, y: e.clientY};
                open.value = true;
              },
            },
            'Context area ' + i
          ),
          open.value && anchor.value
            ? h(FrameMenu, {
                anchor: anchor.value,
                point: point.value,
                items,
                itemAlignment: alignment.value,
                label: 'Fixture menu ' + i,
                onClose: () => {
                  events.value++;
                  open.value = false;
                },
                onSelect: (item: FrameMenuItem) => (selected.value = item.id),
              })
            : null,
        ]);
    },
  });
  frame.setWorkspacePane(frame.workspace.initialPaneId, {
    label: 'Fixture',
    component: Content,
  });
}
createApp({
  setup: () => () =>
    h('main', [
      h('output', {id: 'selected'}, selected.value),
      h('output', {id: 'closes'}, events.value),
      ...frames.map((frame, i) =>
        h(
          'section',
          {
            id: 'host-' + i,
            style: 'width:520px;height:400px;display:inline-block',
          },
          [h(FrameShell, {frame, showSearch: false})]
        )
      ),
    ]),
}).mount('#app');
