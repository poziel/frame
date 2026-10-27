<script setup lang="ts">
import {onMounted, onBeforeUnmount, useId, nextTick} from 'vue';
import {ContextMenuCommands} from '../../framework/commands/contextMenuCommands';
import FrameContextMenu from '../navigation/FrameContextMenu.vue';
import ManageButton from './ManageButton.vue';
import type {
  ToolbarControl,
  ToolbarItemId,
} from '../../framework/views/toolbar';
import type {FrameMenuItem} from '../navigation/generalMenu';
import type {Component} from 'vue';
import {computed, ref, shallowRef} from 'vue';
import {useFrame} from '../../framework/useFrame';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import {regionIcon} from '../../framework/layout/layoutIcons';
import FrameLogo from './FrameLogo.vue';
import FrameIcon from '../data-display/FrameIcon.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
import FrameButton from '../actions/FrameButton.vue';
import FrameTooltip from '../overlays/FrameTooltip.vue';
import FrameMenubar from '../navigation/FrameMenubar.vue';

const props = defineProps<{
  appIcon?: Component;
  appName?: string;
  sidebarVisible: boolean;
  panelVisible: boolean;
  maximized: boolean;
  menuItems: readonly FrameMenuItem[];
  titleText: string;
  showSearch: boolean;
  menuBarVisible: boolean;
  zenMode: boolean;
  primarySide: 'left' | 'right';
  secondaryVisible: boolean;
}>();
const frame = useFrame();
const hasWindowControls = computed(() =>
  (['minimize', 'maximize', 'close'] as const).some((action) =>
    frame.host.window.supports(action)
  )
);
const commandCenterVisible = computed(
  () => props.showSearch && frame.toolbar.isVisible('commandCenter')
);
const titlebar = ref<HTMLElement>();
const menuWidth = ref(300),
  centerWidth = ref(300);
let titlebarObserver: ResizeObserver | undefined;
function measureTitlebar() {
  const el = titlebar.value;
  if (!el) return;
  const width = el.clientWidth;
  const right =
    (el.querySelector<HTMLElement>('.window-controls')?.getBoundingClientRect()
      .width ?? 0) +
    (el.querySelector<HTMLElement>('.titlebar-layout')?.getBoundingClientRect()
      .width ?? 0);
  const mark = el.querySelector<HTMLElement>('.app-mark');
  const leftInset = mark
    ? mark.getBoundingClientRect().right - el.getBoundingClientRect().left
    : 6;
  menuWidth.value = Math.max(24, width / 2 - leftInset - 48);
  centerWidth.value = Math.max(
    0,
    width -
      2 *
        Math.max(
          right + 12,
          (el
            .querySelector<HTMLElement>('.titlebar-leading')
            ?.getBoundingClientRect().width ?? leftInset) + 12
        )
  );
}
onMounted(() => {
  titlebarObserver = new ResizeObserver(measureTitlebar);
  if (titlebar.value) {
    titlebarObserver.observe(titlebar.value);
    for (const el of titlebar.value.querySelectorAll(
      '.window-controls,.titlebar-layout,.titlebar-leading'
    ))
      titlebarObserver.observe(el);
  }
  measureTitlebar();
});
onBeforeUnmount(() => titlebarObserver?.disconnect());
function startDragging(event: MouseEvent) {
  if (event.button !== 0 || event.detail > 1) return;
  void frame.host.window
    .startDragging()
    .catch((error) => frame.record(String(error)));
}
/** Toggles window maximization from unused title/menu bar space, excluding controls. */
function doubleClickBackground(event: MouseEvent) {
  const target = event.target;
  if (
    !(target instanceof Element) ||
    target.closest(
      'button,a,input,textarea,select,[role="button"],[role^="menuitem"],[contenteditable="true"],.app-mark'
    )
  )
    return;
  if (!frame.commands.isEnabled('frame.window.maximize')) return;
  event.preventDefault();
  emit('execute', 'frame.window.maximize');
}
const menuAnchor = shallowRef<HTMLElement>();
const menuPoint = ref({x: 0, y: 0});
const menuControl = ref('');
const builtins: {id: ToolbarControl; label: string}[] = [
  {id: 'customize', label: 'Customize Layout…'},
  {id: 'primary', label: 'Toggle Primary Sidebar'},
  {id: 'bottom', label: 'Toggle Panel'},
  {id: 'secondary', label: 'Toggle Secondary Sidebar'},
];
const eligibleToolbarActions = computed(() =>
  frame.toolbarActions.filter((item) => item.showInToolbar?.() !== false)
);
const activeToolbarActions = computed(() =>
  eligibleToolbarActions.value.filter(
    (item) =>
      item.feature?.enabled !== false &&
      frame.commands.isVisible(item.id) &&
      frame.toolbar.getPlacement(`action:${item.id}`).area === 'titleBar'
  )
);
const overflowAnchor = shallowRef<HTMLElement>();
const overflowCommands: Record<string, string> = {
  customize: 'frame.layout.customize',
  primary: 'frame.sidebar.toggle',
  bottom: 'frame.panel.toggle',
  secondary: 'frame.secondary.toggle',
};
const overflowMenu = computed<FrameMenuItem[]>(() => [
  ...activeToolbarActions.value
    .filter((item) => !item.visible)
    .map((item) => ({
      id: 'action:' + item.id,
      label: item.label,
      disabled: item.disabled,
    })),
]);
function openOverflow(event: MouseEvent) {
  menuAnchor.value = undefined;
  overflowAnchor.value = overflowAnchor.value
    ? undefined
    : (event.currentTarget as HTMLElement);
}
function chooseOverflow(item: FrameMenuItem) {
  if (item.type === 'separator' || item.disabled) return;
  if (item.id.startsWith('action:')) {
    const action = frame.toolbarActions.find(
      (action) => action.id === item.id.slice(7)
    );
    if (
      action &&
      !action.disabled &&
      action.feature?.enabled !== false &&
      action.showInToolbar?.() !== false
    )
      action.run();
  } else if (overflowCommands[item.id])
    emit('execute', overflowCommands[item.id]!);
}
const targeted = computed(() =>
  menuControl.value.startsWith('action:')
    ? frame.toolbarActions.find(
        (item) => item.id === menuControl.value.slice(7)
      )
    : builtins.find((item) => item.id === menuControl.value)
);
const toolbarCommands = new ContextMenuCommands(
  frame,
  'frame.context.toolbar.' + useId(),
  () => 'shell',
  runToolbar
);
onBeforeUnmount(toolbarCommands.dispose);
const toolbarMenu = computed<FrameMenuItem[]>(() =>
  toolbarCommands.bind([
    ...(targeted.value
      ? [
          {id: 'place:status-left', label: 'Move to Status Bar — Left'},
          {id: 'place:status-right', label: 'Move to Status Bar — Right'},
          {id: 'placement-divider', type: 'separator' as const},
        ]
      : []),
    ...(targeted.value && menuControl.value !== 'customize'
      ? [
          {id: 'hide-target', label: `Hide '${targeted.value.label}'`},
          {id: 'target-divider', type: 'separator' as const},
        ]
      : []),
    ...builtins
      .filter(
        (item) =>
          item.id !== 'customize' &&
          frame.commands.isVisible(overflowCommands[item.id]!)
      )
      .map((item) => ({...item, checked: frame.toolbar.isVisible(item.id)})),
    ...activeToolbarActions.value.map((item) => ({
      id: 'action:' + item.id,
      label: item.label,
      checked: !!item.visible,
    })),
    {id: 'chrome-divider', type: 'separator'},
    {
      id: 'menuBar',
      label: 'Menu Bar',
      command: 'frame.layout.menuBarVisible',
      checked: frame.layout.menuBarVisible,
    },
    {
      id: 'commandCenter',
      label: 'Command Center',
      checked: props.showSearch && frame.toolbar.isVisible('commandCenter'),
      disabled: !props.showSearch,
    },
    {
      id: 'layoutControls',
      label: 'Layout Controls',
      checked: frame.toolbar.isVisible('layoutControls'),
    },
    ...eligibleToolbarActions.value
      .filter((item) => item.feature)
      .map((item) => ({
        id: 'feature:' + item.id,
        label: item.feature!.label,
        checked: item.feature!.enabled,
      })),
  ])
);
function chooseToolbar(item: FrameMenuItem) {
  if (item.type === 'separator' || !item.command) return;
  const control = menuControl.value;
  void frame.commands.execute(item.command).then(() => {
    if (item.id.startsWith('place:'))
      void nextTick(() => {
        [
          ...(titlebar.value
            ?.closest('.workbench')
            ?.querySelectorAll<HTMLElement>('[data-status-id]') ?? []),
        ]
          .find(
            (element) => element.dataset.statusId === 'frame.toolbar.' + control
          )
          ?.querySelector<HTMLElement>('[data-status-control]')
          ?.focus();
      });
  });
}
function runToolbar(item: FrameMenuItem) {
  if (item.id.startsWith('place:')) {
    const area = item.id.slice(6);
    frame.toolbar.setPlacement(
      menuControl.value as ToolbarItemId,
      area === 'titleBar'
        ? {area: 'titleBar'}
        : {area: 'statusBar', side: area === 'status-right' ? 'right' : 'left'}
    );
  } else if (item.id === 'hide-target') {
    const id = menuControl.value;
    if (id.startsWith('action:'))
      frame.toolbar.setActionVisible(id.slice(7), false);
    else frame.toolbar.setVisible(id as ToolbarControl, false);
  } else if (item.id.startsWith('feature:')) {
    const action = eligibleToolbarActions.value.find(
      (action) => action.id === item.id.slice(8)
    );
    if (action?.feature)
      frame.toolbar.setActionEnabled(action.id, !action.feature.enabled);
  } else if (item.id === 'menuBar')
    frame.layout.menuBarVisible = !frame.layout.menuBarVisible;
  else if (item.id.startsWith('action:')) {
    const id = item.id.slice(7);
    const action = frame.toolbarActions.find((item) => item.id === id);
    if (action) frame.toolbar.setActionVisible(id, !action.visible);
  } else frame.toolbar.toggle(item.id as ToolbarControl);
}
function openToolbarMenu(event: MouseEvent) {
  const element = event.target as HTMLElement;
  if (element.closest('.menu-bar,.window-controls,[role=menubar]')) return;
  event.preventDefault();
  event.stopPropagation();
  if (!frame.toolbar.contextMenuEnabled) return;
  overflowAnchor.value = undefined;
  const control = element.closest<HTMLElement>('[data-toolbar-control]');
  menuControl.value = control?.dataset.toolbarControl ?? '';
  menuAnchor.value = control ?? (event.currentTarget as HTMLElement);
  menuPoint.value = {
    x: event.clientX || menuAnchor.value.getBoundingClientRect().left,
    y: event.clientY || menuAnchor.value.getBoundingClientRect().bottom,
  };
}
const emit = defineEmits<{commands: []; execute: [id: string]}>();
</script>
<template>
  <header
    ref="titlebar"
    class="titlebar"
    @contextmenu="openToolbarMenu"
    @dblclick="doubleClickBackground"
  >
    <div class="titlebar-leading">
      <span v-if="!zenMode" class="app-mark" :aria-label="appName ?? 'Frame'"
        ><component :is="appIcon ?? FrameLogo"
      /></span>
      <FrameMenubar
        popup-label="Application menu"
        label="Application menus"
        :available-width="menuWidth"
        v-if="menuBarVisible && !zenMode"
        :menus="menuItems"
        @execute="emit('execute', $event)"
      />
      <nav
        v-if="
          !commandCenterVisible &&
          frame.features.navigation &&
          frame.layout.navigationVisible
        "
        class="titlebar-navigation"
        aria-label="Navigation history"
      >
        <FrameIconButton
          class="titlebar-button"
          label="Back"
          icon="arrow-left"
          :icon-size="16"
          :disabled="!frame.navigation.canGoBack"
          @click="frame.commands.execute('frame.navigation.back')"
        />
        <FrameIconButton
          class="titlebar-button"
          label="Forward"
          icon="arrow-right"
          :icon-size="16"
          :disabled="!frame.navigation.canGoForward"
          @click="frame.commands.execute('frame.navigation.forward')"
        />
      </nav>
    </div>
    <div
      class="titlebar-drag"
      :style="
        frame.host.window.dragRegion === 'css'
          ? 'app-region: drag; -webkit-app-region: drag'
          : undefined
      "
      @mousedown.left="startDragging"
    />
    <div
      class="titlebar-center"
      :style="{
        width: 'min(var(--frame-palette-width, 600px), ' + centerWidth + 'px)',
      }"
    >
      <nav
        v-if="
          commandCenterVisible &&
          frame.features.navigation &&
          frame.layout.navigationVisible
        "
        class="titlebar-navigation"
        aria-label="Navigation history"
      >
        <FrameIconButton
          class="titlebar-button"
          label="Back"
          icon="arrow-left"
          :icon-size="16"
          :disabled="!frame.navigation.canGoBack"
          @click="frame.commands.execute('frame.navigation.back')"
        />
        <FrameIconButton
          class="titlebar-button"
          label="Forward"
          icon="arrow-right"
          :icon-size="16"
          :disabled="!frame.navigation.canGoForward"
          @click="frame.commands.execute('frame.navigation.forward')"
        />
      </nav>
      <FrameTooltip
        v-if="commandCenterVisible"
        text="Quick actions"
        shortcut="Ctrl+P"
        class="command-tooltip"
        v-slot="{describedby}"
      >
        <FrameButton
          class="workspace-command"
          aria-label="Open quick actions"
          :aria-describedby="describedby"
          @click="emit('commands')"
        >
          <span>{{ titleText }}</span
          ><FrameIcon name="chevron-down" :size="12" />
        </FrameButton>
      </FrameTooltip>
      <div
        v-if="!commandCenterVisible"
        class="titlebar-text"
        :style="
          frame.host.window.dragRegion === 'css'
            ? 'app-region: drag; -webkit-app-region: drag'
            : undefined
        "
        @mousedown.left="startDragging"
        >{{ titleText }}</div
      >
    </div>
    <div
      class="titlebar-drag"
      :style="
        frame.host.window.dragRegion === 'css'
          ? 'app-region: drag; -webkit-app-region: drag'
          : undefined
      "
      @mousedown.left="startDragging"
    />
    <div
      v-if="
        frame.toolbar.isVisible('layoutControls') ||
        (frame.layout.manageButtonPosition === 'top' && frame.features.settings)
      "
      class="titlebar-layout"
    >
      <ManageButton v-if="frame.layout.manageButtonPosition === 'top'" />
      <template v-if="frame.toolbar.isVisible('layoutControls')">
        <FrameIconButton
          v-if="
            frame.toolbar.isVisible('customize') &&
            frame.toolbar.getPlacement('customize').area === 'titleBar'
          "
          data-toolbar-control="customize"
          :disabled="!frame.commands.isEnabled('frame.layout.customize')"
          class="titlebar-button"
          label="Customize layout"
          icon="layout"
          :icon-size="16"
          @click="emit('execute', 'frame.layout.customize')"
        />
        <FrameIconButton
          v-if="
            frame.toolbar.isVisible('primary') &&
            frame.toolbar.getPlacement('primary').area === 'titleBar' &&
            frame.commands.isVisible('frame.sidebar.toggle')
          "
          data-toolbar-control="primary"
          :disabled="!frame.commands.isEnabled('frame.sidebar.toggle')"
          class="titlebar-button"
          label="Toggle primary sidebar"
          shortcut="Ctrl+B"
          :icon="regionIcon('primary', sidebarVisible, primarySide)"
          :icon-size="16"
          :aria-expanded="sidebarVisible"
          aria-controls="side-panel"
          @click="emit('execute', 'frame.sidebar.toggle')"
        />
        <FrameIconButton
          v-if="
            frame.toolbar.isVisible('bottom') &&
            frame.toolbar.getPlacement('bottom').area === 'titleBar' &&
            frame.commands.isVisible('frame.panel.toggle')
          "
          data-toolbar-control="bottom"
          :disabled="!frame.commands.isEnabled('frame.panel.toggle')"
          class="titlebar-button"
          label="Toggle panel"
          shortcut="Ctrl+J"
          :icon="regionIcon('panel', panelVisible, primarySide)"
          :icon-size="16"
          :aria-expanded="panelVisible"
          aria-controls="bottom-panel"
          @click="emit('execute', 'frame.panel.toggle')"
        />
        <FrameIconButton
          v-if="
            frame.toolbar.isVisible('secondary') &&
            frame.toolbar.getPlacement('secondary').area === 'titleBar' &&
            frame.commands.isVisible('frame.secondary.toggle')
          "
          data-toolbar-control="secondary"
          :disabled="!frame.commands.isEnabled('frame.secondary.toggle')"
          class="titlebar-button"
          label="Toggle secondary sidebar"
          shortcut="Ctrl+Alt+B"
          :icon="regionIcon('secondary', secondaryVisible, primarySide)"
          :icon-size="16"
          :aria-expanded="secondaryVisible"
          @click="emit('execute', 'frame.secondary.toggle')"
        />
        <FrameIconButton
          v-for="action in activeToolbarActions.filter((item) => item.visible)"
          :key="action.id"
          :data-toolbar-control="'action:' + action.id"
          class="titlebar-button"
          :label="action.label"
          :icon="action.icon"
          :show-label="!action.icon"
          :icon-size="16"
          :disabled="action.disabled"
          @click="action.run"
        />
        <FrameIconButton
          v-if="overflowMenu.length"
          class="titlebar-button"
          label="More Actions…"
          icon="ellipsis"
          :icon-size="16"
          aria-haspopup="menu"
          :aria-expanded="!!overflowAnchor"
          @click="openOverflow"
        />
      </template>
    </div>
    <div
      v-if="hasWindowControls"
      class="window-controls"
      aria-label="Window controls"
    >
      <FrameIconButton
        v-if="frame.host.window.supports('minimize')"
        class="window-control"
        label="Minimize window"
        @click="emit('execute', 'frame.window.minimize')"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M1 6.5h10" stroke="currentColor" />
        </svg>
      </FrameIconButton>
      <FrameIconButton
        v-if="frame.host.window.supports('maximize')"
        class="window-control"
        :label="maximized ? 'Restore window' : 'Maximize window'"
        @click="emit('execute', 'frame.window.maximize')"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path v-if="maximized" d="M3.5 3.5v-2h7v7h-2 M1.5 3.5h7v7h-7z" />
          <path v-else d="M1.5 1.5h9v9h-9z" />
        </svg>
      </FrameIconButton>
      <FrameIconButton
        v-if="frame.host.window.supports('close')"
        class="window-control window-close"
        label="Close window"
        @click="emit('execute', 'frame.window.close')"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="m1.5 1.5 9 9m-9 0 9-9" stroke="currentColor" />
        </svg>
      </FrameIconButton>
    </div>
    <FrameDropdownMenu
      v-if="overflowAnchor"
      :anchor="overflowAnchor"
      :items="overflowMenu"
      label="More Actions"
      @select="chooseOverflow"
      @close="overflowAnchor = undefined"
    />
    <component
      :is="menuPoint ? FrameContextMenu : FrameDropdownMenu"
      v-if="menuAnchor"
      :anchor="menuAnchor"
      :point="menuPoint"
      :items="toolbarMenu"
      label="Title bar actions"
      @select="chooseToolbar"
      @close="menuAnchor = undefined"
    />
  </header>
</template>
