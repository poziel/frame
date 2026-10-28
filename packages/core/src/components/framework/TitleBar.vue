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
<style lang="scss">
.titlebar-leading {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  /* Left internal spacing for .titlebar-leading. @token --frame-titlebar-leading-padding-left */
  --_frame-default-titlebar-leading-padding-left-efeaa00b84: 6px;
  padding-left: var(
    --frame-titlebar-leading-padding-left,
    var(--_frame-default-titlebar-leading-padding-left-efeaa00b84)
  );
}

.titlebar-drag {
  align-self: stretch;
  flex: 1;
  /* Minimum width for .titlebar-drag. @token --frame-titlebar-drag-min-width */
  --_frame-default-titlebar-drag-min-width-339bd34b4f: 12px;
  min-width: var(
    --frame-titlebar-drag-min-width,
    var(--_frame-default-titlebar-drag-min-width-339bd34b4f)
  );
}

.titlebar-layout {
  display: flex;
  /* Right internal spacing for .titlebar-layout. @token --frame-titlebar-layout-padding-right */
  --_frame-default-titlebar-layout-padding-right-86eab8aff7: 8px;
  padding-right: var(
    --frame-titlebar-layout-padding-right,
    var(--_frame-default-titlebar-layout-padding-right-86eab8aff7)
  );
  /* Space between children for .titlebar-layout. @token --frame-titlebar-layout-gap */
  --_frame-default-titlebar-layout-gap-0b6242b44b: 2px;
  gap: var(
    --frame-titlebar-layout-gap,
    var(--_frame-default-titlebar-layout-gap-0b6242b44b)
  );
}

.titlebar-layout > .context-menu-target {
  display: flex;
}

.titlebar-center {
  display: flex;
  align-items: center;
  /* Space between children for .titlebar-center. @token --frame-titlebar-center-gap */
  --_frame-default-titlebar-center-gap-d1c195d7fd: 6px;
  gap: var(
    --frame-titlebar-center-gap,
    var(--_frame-default-titlebar-center-gap-d1c195d7fd)
  );
  /* Minimum width for .titlebar-center. @token --frame-titlebar-center-min-width */
  --_frame-default-titlebar-center-min-width-988dac48d7: 0;
  min-width: var(
    --frame-titlebar-center-min-width,
    var(--_frame-default-titlebar-center-min-width-988dac48d7)
  );
  flex: 0 1 600px;
}

.titlebar-center .command-tooltip,
.titlebar-center .titlebar-text {
  flex: 1;
  /* Minimum width for .titlebar-center .command-tooltip, .titlebar-center .titlebar-text. @token --frame-titlebar-center-command-tooltip-min-width */
  --_frame-default-titlebar-center-command-tooltip-min-width-2073f1825c: 0;
  min-width: var(
    --frame-titlebar-center-command-tooltip-min-width,
    var(--_frame-default-titlebar-center-command-tooltip-min-width-2073f1825c)
  );
}

.titlebar-navigation {
  display: flex;
  align-items: center;
  /* Space between children for .titlebar-navigation. @token --frame-titlebar-navigation-gap */
  --_frame-default-titlebar-navigation-gap-9bf348eefb: 2px;
  gap: var(
    --frame-titlebar-navigation-gap,
    var(--_frame-default-titlebar-navigation-gap-9bf348eefb)
  );
  flex: none;
}

.titlebar-leading > .titlebar-navigation {
  /* Space between children for .titlebar-leading > .titlebar-navigation. @token --frame-titlebar-center-gap */
  --_frame-default-titlebar-center-gap-d1c195d7fd: 6px;
  margin-left: var(
    --frame-titlebar-center-gap,
    var(--_frame-default-titlebar-center-gap-d1c195d7fd)
  );
}

.titlebar-center button.frame-button.workspace-command {
  min-width: 0;
}

.titlebar-navigation button:disabled {
  /* Opacity for .titlebar-navigation button:disabled. @token --frame-titlebar-navigation-button-disabled-opacity */
  --_frame-default-titlebar-navigation-button-disabled-opacity-61540859ab: 0.35;
  opacity: var(
    --frame-titlebar-navigation-button-disabled-opacity,
    var(--_frame-default-titlebar-navigation-button-disabled-opacity-61540859ab)
  );
  cursor: default;
}

@media (max-width: 700px) {
  .titlebar-center {
    flex-basis: 260px;
  }
}

@media (max-width: 540px) {
  .titlebar-center {
    flex-basis: 180px;
    /* Space between children for .titlebar-center. @token --frame-titlebar-center-gap-2 */
    --_frame-default-titlebar-center-gap-2-6feed306c9: 2px;
    gap: var(
      --frame-titlebar-center-gap-2,
      var(--_frame-default-titlebar-center-gap-2-6feed306c9)
    );
  }
}

.titlebar-center > * {
  pointer-events: auto;
}
</style>

<style lang="scss">
/* Title and status are part of the app background, without separators. */
.titlebar {
  display: flex;
  align-items: center;
  /* Minimum width for .titlebar. @token --frame-Title-and-status-are-part-of-the-app-background-min-width */
  --_frame-default-Title-and-status-are-part-of-the-app-background-min-width-b767f65866: 0;
  min-width: var(
    --frame-Title-and-status-are-part-of-the-app-background-min-width,
    var(
      --_frame-default-Title-and-status-are-part-of-the-app-background-min-width-b767f65866
    )
  );
  /* Base shell background behind its registered regions and content. @token --frame-bg @context */
  background: var(--frame-bg);
  user-select: none;
  position: relative;
  z-index: 5;
}

.titlebar-leading {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  /* Left internal spacing for .titlebar-leading. @token --frame-titlebar-leading-padding-left */
  --_frame-default-titlebar-leading-padding-left-efeaa00b84: 6px;
  padding-left: var(
    --frame-titlebar-leading-padding-left,
    var(--_frame-default-titlebar-leading-padding-left-efeaa00b84)
  );
}

.app-mark {
  flex-shrink: 0;
  /* Width for .app-mark. @token --frame-app-mark-width */
  --_frame-default-app-mark-width-9f733a5483: 28px;
  width: var(
    --frame-app-mark-width,
    var(--_frame-default-app-mark-width-9f733a5483)
  );
  display: grid;
  place-items: center;
}

.titlebar button.frame-button.titlebar-button {
  /* Width for .titlebar button.frame-button.titlebar-button. @token --frame-titlebar-button-width */
  --_frame-default-titlebar-button-width-586ce14ef6: 28px;
  width: var(
    --frame-titlebar-button-width,
    var(--_frame-default-titlebar-button-width-586ce14ef6)
  );
  /* Height for .titlebar button.frame-button.titlebar-button. @token --frame-titlebar-button-height */
  --_frame-default-titlebar-button-height-8363be2443: 26px;
  height: var(
    --frame-titlebar-button-height,
    var(--_frame-default-titlebar-button-height-8363be2443)
  );
  /* Corner radius for .titlebar button.frame-button.titlebar-button. @token --frame-titlebar-button-border-radius */
  --_frame-default-titlebar-button-border-radius-579cbd0a4b: var(
    --frame-radius-medium
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-titlebar-button-border-radius,
    var(--_frame-default-titlebar-button-border-radius-579cbd0a4b)
  );
  display: inline-grid;
  place-items: center;
  /* Foreground for .titlebar button.frame-button.titlebar-button. @token --frame-titlebar-button-color */
  --_frame-default-titlebar-button-color-a9e2cdc731: #959b9e;
  color: var(
    --frame-titlebar-button-color,
    var(--_frame-default-titlebar-button-color-a9e2cdc731)
  );
}

.titlebar button.frame-button.titlebar-button:hover {
  /* Background for .titlebar button.frame-button.titlebar-button:hover. @token --frame-titlebar-button-hover-background */
  --_frame-default-titlebar-button-hover-background-9df75860ab: #ffffff0b;
  background: var(
    --frame-titlebar-button-hover-background,
    var(--_frame-default-titlebar-button-hover-background-9df75860ab)
  );
}

.titlebar button.frame-button.titlebar-button[aria-expanded='true'] {
  /* Foreground for .titlebar button.frame-button.titlebar-button[aria-expanded='true']. @token --frame-titlebar-button-color-2 */
  --_frame-default-titlebar-button-color-2-a57f4314a2: #d4d6d7;
  color: var(
    --frame-titlebar-button-color-2,
    var(--_frame-default-titlebar-button-color-2-a57f4314a2)
  );
}

.titlebar-drag {
  align-self: stretch;
  flex: 1;
  /* Minimum width for .titlebar-drag. @token --frame-titlebar-drag-min-width */
  --_frame-default-titlebar-drag-min-width-339bd34b4f: 12px;
  min-width: var(
    --frame-titlebar-drag-min-width,
    var(--_frame-default-titlebar-drag-min-width-339bd34b4f)
  );
}

.titlebar button.frame-button.workspace-command {
  flex: 0 1 370px;
  /* Minimum width for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-min-width */
  --_frame-default-workspace-command-min-width-c8c931dbb9: 100px;
  min-width: var(
    --frame-workspace-command-min-width,
    var(--_frame-default-workspace-command-min-width-c8c931dbb9)
  );
  /* Height for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-height */
  --_frame-default-workspace-command-height-b38a5fcb88: 24px;
  height: var(
    --frame-workspace-command-height,
    var(--_frame-default-workspace-command-height-b38a5fcb88)
  );
  /* Border for .titlebar button.frame-button.workspace-command. @token --frame-command-border-color */
  --_frame-default-command-border-color-e0ee851e79: #303335;
  /* Border for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-border */
  --_frame-default-workspace-command-border-235e3b6271: 1px solid
    var(
      --frame-command-border-color,
      var(--_frame-default-command-border-color-e0ee851e79)
    );
  border: var(
    --frame-workspace-command-border,
    var(--_frame-default-workspace-command-border-235e3b6271)
  );
  /* Corner radius for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-border-radius */
  --_frame-default-workspace-command-border-radius-7b0c7a0e40: var(
    --frame-radius-large
  );
  /* Large shared corner radius used by panel and menu containers. @token --frame-radius-large @context */
  border-radius: var(
    --frame-workspace-command-border-radius,
    var(--_frame-default-workspace-command-border-radius-7b0c7a0e40)
  );
  /* Internal spacing for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-padding */
  --_frame-default-workspace-command-padding-a8883f133f: 0 9px;
  padding: var(
    --frame-workspace-command-padding,
    var(--_frame-default-workspace-command-padding-a8883f133f)
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Space between children for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-gap */
  --_frame-default-workspace-command-gap-50772785fa: 12px;
  gap: var(
    --frame-workspace-command-gap,
    var(--_frame-default-workspace-command-gap-50772785fa)
  );
  /* Text size for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-font-size */
  --_frame-default-workspace-command-font-size-1c6c4700ad: 11px;
  font-size: var(
    --frame-workspace-command-font-size,
    var(--_frame-default-workspace-command-font-size-1c6c4700ad)
  );
  /* Foreground for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-color */
  --_frame-default-workspace-command-color-dd2679bc25: #959b9e;
  color: var(
    --frame-workspace-command-color,
    var(--_frame-default-workspace-command-color-dd2679bc25)
  );
  /* Background for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-background */
  --_frame-default-workspace-command-background-aaf4d267e1: #1b1d1e;
  background: var(
    --frame-workspace-command-background,
    var(--_frame-default-workspace-command-background-aaf4d267e1)
  );
}

.titlebar button.frame-button.workspace-command > span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.titlebar button.frame-button.workspace-command:hover {
  /* Border color for .titlebar button.frame-button.workspace-command:hover. @token --frame-workspace-command-hover-border-color */
  --_frame-default-workspace-command-hover-border-color-28791c49cc: #45494b;
  border-color: var(
    --frame-workspace-command-hover-border-color,
    var(--_frame-default-workspace-command-hover-border-color-28791c49cc)
  );
}

.command-context {
  /* Foreground for .command-context. @token --frame-command-context-color */
  --_frame-default-command-context-color-4e9e7ff26f: #777f83;
  color: var(
    --frame-command-context-color,
    var(--_frame-default-command-context-color-4e9e7ff26f)
  );
}

.titlebar-layout {
  display: flex;
  /* Right internal spacing for .titlebar-layout. @token --frame-titlebar-layout-padding-right */
  --_frame-default-titlebar-layout-padding-right-86eab8aff7: 8px;
  padding-right: var(
    --frame-titlebar-layout-padding-right,
    var(--_frame-default-titlebar-layout-padding-right-86eab8aff7)
  );
  /* Space between children for .titlebar-layout. @token --frame-titlebar-layout-gap */
  --_frame-default-titlebar-layout-gap-0b6242b44b: 2px;
  gap: var(
    --frame-titlebar-layout-gap,
    var(--_frame-default-titlebar-layout-gap-0b6242b44b)
  );
}

.window-controls {
  display: flex;
  align-self: stretch;
}

.titlebar button.frame-button.window-control {
  /* Width for .titlebar button.frame-button.window-control. @token --frame-window-control-width */
  --_frame-default-window-control-width-c0c3c2bffb: 36px;
  width: var(
    --frame-window-control-width,
    var(--_frame-default-window-control-width-c0c3c2bffb)
  );
  display: grid;
  place-items: center;
  /* Foreground for .titlebar button.frame-button.window-control. @token --frame-window-control-color */
  --_frame-default-window-control-color-0bca395274: #a8acae;
  color: var(
    --frame-window-control-color,
    var(--_frame-default-window-control-color-0bca395274)
  );
}

.titlebar button.frame-button.window-control:hover:not(:disabled) {
  /* Background for .titlebar button.frame-button.window-control:hover:not(:disabled). @token --frame-window-control-hover-not-disabled-background */
  --_frame-default-window-control-hover-not-disabled-background-c567805622: #ffffff0f;
  background: var(
    --frame-window-control-hover-not-disabled-background,
    var(
      --_frame-default-window-control-hover-not-disabled-background-c567805622
    )
  );
}

.titlebar button.frame-button.window-close:hover:not(:disabled) {
  /* Background for .titlebar button.frame-button.window-close:hover:not(:disabled). @token --frame-window-close-hover-not-disabled-background */
  --_frame-default-window-close-hover-not-disabled-background-06109414fd: #c42b1c;
  background: var(
    --frame-window-close-hover-not-disabled-background,
    var(--_frame-default-window-close-hover-not-disabled-background-06109414fd)
  );
  /* Foreground for .titlebar button.frame-button.window-close:hover:not(:disabled). @token --frame-window-close-hover-not-disabled-color */
  --_frame-default-window-close-hover-not-disabled-color-c840e4e79c: white;
  color: var(
    --frame-window-close-hover-not-disabled-color,
    var(--_frame-default-window-close-hover-not-disabled-color-c840e4e79c)
  );
}

.titlebar button.frame-button.window-control:disabled {
  /* Opacity for .titlebar button.frame-button.window-control:disabled. @token --frame-window-control-disabled-opacity */
  --_frame-default-window-control-disabled-opacity-c746a95435: 0.4;
  opacity: var(
    --frame-window-control-disabled-opacity,
    var(--_frame-default-window-control-disabled-opacity-c746a95435)
  );
}

.command-tooltip {
  flex: 0 1 520px;
  /* Minimum width for .command-tooltip. @token --frame-command-tooltip-min-width-2 */
  --_frame-default-command-tooltip-min-width-2-ec357decac: 100px;
  min-width: var(
    --frame-command-tooltip-min-width-2,
    var(--_frame-default-command-tooltip-min-width-2-ec357decac)
  );
}

.titlebar button.frame-button.workspace-command {
  flex: initial;
  /* Width for .titlebar button.frame-button.workspace-command. @token --frame-workspace-command-width */
  --_frame-default-workspace-command-width-f2d515ca51: 100%;
  width: var(
    --frame-workspace-command-width,
    var(--_frame-default-workspace-command-width-f2d515ca51)
  );
}

.window-controls > .tooltip-trigger {
  align-self: stretch;
}

.titlebar button.frame-button.window-control {
  /* Height for .titlebar button.frame-button.window-control. @token --frame-window-control-height */
  --_frame-default-window-control-height-28b66ce9a3: 100%;
  height: var(
    --frame-window-control-height,
    var(--_frame-default-window-control-height-28b66ce9a3)
  );
}

@media (max-width: 700px) {
  .command-tooltip {
    flex-basis: 260px;
  }
}

@media (max-width: 540px) {
  .command-tooltip {
    flex-basis: 140px;
    /* Minimum width for .command-tooltip. @token --frame-command-tooltip-min-width */
    --_frame-default-command-tooltip-min-width-62415ee97f: 70px;
    min-width: var(
      --frame-command-tooltip-min-width,
      var(--_frame-default-command-tooltip-min-width-62415ee97f)
    );
  }
}

@media (min-width: 701px) {
  .titlebar > .command-tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    /* Width for .titlebar > .command-tooltip. @token --frame-titlebar-command-tooltip-width */
    --_frame-default-titlebar-command-tooltip-width-0e04b02f6a: min(
      600px,
      calc(100% - 430px)
    );
    width: var(
      --frame-titlebar-command-tooltip-width,
      var(--_frame-default-titlebar-command-tooltip-width-0e04b02f6a)
    );
  }
}

@media (min-width: 701px) {
  .titlebar > .command-tooltip,
  .titlebar > .titlebar-text {
    /* Width for .titlebar > .command-tooltip, .titlebar > .titlebar-text. @token --frame-titlebar-command-tooltip-width-3 */
    --_frame-default-titlebar-command-tooltip-width-3-72dc0db78b: min(
      600px,
      calc(100% - 580px)
    );
    width: var(
      --frame-titlebar-command-tooltip-width-3,
      var(--_frame-default-titlebar-command-tooltip-width-3-72dc0db78b)
    );
  }
}

.titlebar-layout > .context-menu-target {
  display: flex;
}

.titlebar-center {
  display: flex;
  align-items: center;
  /* Space between children for .titlebar-center. @token --frame-titlebar-center-gap */
  --_frame-default-titlebar-center-gap-d1c195d7fd: 6px;
  gap: var(
    --frame-titlebar-center-gap,
    var(--_frame-default-titlebar-center-gap-d1c195d7fd)
  );
  /* Minimum width for .titlebar-center. @token --frame-titlebar-center-min-width */
  --_frame-default-titlebar-center-min-width-988dac48d7: 0;
  min-width: var(
    --frame-titlebar-center-min-width,
    var(--_frame-default-titlebar-center-min-width-988dac48d7)
  );
  flex: 0 1 600px;
}

.titlebar-center .command-tooltip,
.titlebar-center .titlebar-text {
  flex: 1;
  /* Minimum width for .titlebar-center .command-tooltip, .titlebar-center .titlebar-text. @token --frame-titlebar-center-command-tooltip-min-width */
  --_frame-default-titlebar-center-command-tooltip-min-width-2073f1825c: 0;
  min-width: var(
    --frame-titlebar-center-command-tooltip-min-width,
    var(--_frame-default-titlebar-center-command-tooltip-min-width-2073f1825c)
  );
}

.titlebar-navigation {
  display: flex;
  align-items: center;
  /* Space between children for .titlebar-navigation. @token --frame-titlebar-navigation-gap */
  --_frame-default-titlebar-navigation-gap-9bf348eefb: 2px;
  gap: var(
    --frame-titlebar-navigation-gap,
    var(--_frame-default-titlebar-navigation-gap-9bf348eefb)
  );
  flex: none;
}

.titlebar-leading > .titlebar-navigation {
  /* Space between children for .titlebar-leading > .titlebar-navigation. @token --frame-titlebar-center-gap */
  --_frame-default-titlebar-center-gap-d1c195d7fd: 6px;
  margin-left: var(
    --frame-titlebar-center-gap,
    var(--_frame-default-titlebar-center-gap-d1c195d7fd)
  );
}

.titlebar-center button.frame-button.workspace-command {
  min-width: 0;
}

.titlebar-navigation button:disabled {
  /* Opacity for .titlebar-navigation button:disabled. @token --frame-titlebar-navigation-button-disabled-opacity */
  --_frame-default-titlebar-navigation-button-disabled-opacity-61540859ab: 0.35;
  opacity: var(
    --frame-titlebar-navigation-button-disabled-opacity,
    var(--_frame-default-titlebar-navigation-button-disabled-opacity-61540859ab)
  );
  cursor: default;
}

@media (min-width: 701px) {
  .titlebar > .titlebar-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    /* Width for .titlebar > .titlebar-center. @token --frame-titlebar-titlebar-center-width */
    --_frame-default-titlebar-titlebar-center-width-2ed147e276: min(
      600px,
      calc(100% - 580px)
    );
    width: var(
      --frame-titlebar-titlebar-center-width,
      var(--_frame-default-titlebar-titlebar-center-width-2ed147e276)
    );
  }
}

@media (max-width: 700px) {
  .titlebar-center {
    flex-basis: 260px;
  }
}

@media (max-width: 540px) {
  .titlebar-center {
    flex-basis: 180px;
    /* Space between children for .titlebar-center. @token --frame-titlebar-center-gap-2 */
    --_frame-default-titlebar-center-gap-2-6feed306c9: 2px;
    gap: var(
      --frame-titlebar-center-gap-2,
      var(--_frame-default-titlebar-center-gap-2-6feed306c9)
    );
  }
}

/* Shell dimensions specialize the shared controls without changing their interaction behavior. */
.titlebar button.frame-button.window-control {
  aspect-ratio: auto;
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
}

.titlebar button.frame-button.workspace-command {
  min-height: 0;
}

.titlebar button.frame-button.titlebar-button.frame-icon-button-labeled {
  width: auto;
  inline-size: auto;
  display: inline-flex;
}

/* Title and control sizes retain one position and scale at every window width. */
.titlebar > .titlebar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  min-width: 0;
  pointer-events: none;
}

.titlebar-center > * {
  pointer-events: auto;
}

.titlebar > .titlebar-center .titlebar-text {
  flex: 1;
  width: 100%;
  min-width: 0;
  text-align: center;
}

.titlebar > .window-controls,
.titlebar > .titlebar-layout {
  flex-shrink: 0;
}
</style>
