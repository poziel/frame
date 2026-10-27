<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref } from 'vue';
import { createFrame, FrameShell, FrameIcon, FrameButton, FrameTextField, FrameSelect, type NavigationItem, type ViewRegion } from '@frame/core';
import { frameMonokaiDark } from '@frame/themes';
import { playgroundOptions } from './playgroundOptions';
import './playground.css';
import DockSample from '../examples/DockSample.vue';
import DockPlayground from '../examples/DockPlayground.vue';
import type { LayoutPageId } from './navigation';

const props = defineProps<{ pageId: LayoutPageId }>();
const isNavigation = props.pageId === 'navigation-bar';
const isStatus = props.pageId === 'status-bar';
const isMenu = props.pageId === 'menu-bar';
const isWorkspace = props.pageId === 'workspace';
const isDocks = props.pageId === 'docks';
const region: ViewRegion | undefined = props.pageId.startsWith('primary') ? 'primary'
  : props.pageId.startsWith('secondary') ? 'secondary' : props.pageId.startsWith('panel') ? 'bottom' : undefined;
const frame = createFrame({
  theme: frameMonokaiDark,
  settings: false, notifications: false,
  features: { primarySidebar: region === 'primary' || isDocks, secondarySidebar: region === 'secondary' || isDocks, panel: region === 'bottom' || isDocks, navigationBar: isNavigation || isDocks, menuBar: isMenu || isDocks, statusBar: isStatus || isDocks },
  navigationBar: { visible: isNavigation, display: 'both', allowAddSeparator: true },
  primaryViewBar: { allowAddSeparator: true }, secondaryViewBar: { allowAddSeparator: true }, panelViewBar: { allowAddSeparator: true },
  toolbar: { customize: false, commandCenter: false, layoutControls: isMenu },
  workspace: { allowPaneCreation: isWorkspace, tabs: { allowCreate: true, allowClose: true, allowMove: true, lastTab: 'allow-empty' } },
});
frame.layout.primaryWidth = 200;
frame.layout.secondaryWidth = 240;
frame.layout.panelHeight = 180;
frame.layout.menuBarVisible = isMenu;
const feedback = ref('Ready to explore');
const label = ref('My Item');
const kind = ref<NavigationItem['type']>('action');
const entries = ref<{ id: string; label: string }[]>([]);
const removers = new Map<string, () => void>();
let sequence = 0;
const container = region === 'primary' ? frame.primarySidebar : region === 'secondary' ? frame.secondarySidebar : frame.panel;
const bar = region === 'primary' ? frame.primaryViewBar : region === 'secondary' ? frame.secondaryViewBar : frame.panelViewBar;
const visible = computed(() => isNavigation ? frame.navigationBar.visible.value : isStatus ? frame.layout.statusBarVisible : isMenu ? frame.layout.menuBarVisible : region ? container.visible.value : true);
const icon = () => h(FrameIcon, { name: 'beaker', size: 16 });
const positions = playgroundOptions(['top', 'bottom', 'left', 'right']);
const displays = playgroundOptions(['icons', 'text', 'both']);
const sizes = playgroundOptions(['default', 'compact']);
const viewBarPositions = playgroundOptions(['default', 'top', 'bottom', 'hidden']);
const sides = playgroundOptions(['left', 'right']);
const itemTypes = playgroundOptions(['action', 'link', 'dropdown', 'separator']);
function addItem() {
  if (!label.value.trim()) return;
  const id = `playground.item.${++sequence}`;
  const text = label.value.trim();
  const run = () => { feedback.value = `${text} activated`; };
  let remove: () => void;
  if (isNavigation) {
    const item: NavigationItem = kind.value === 'separator' ? { id, type: 'separator', label: text }
      : kind.value === 'link' ? { id, type: 'link', label: text, icon, href: '#example', onNavigate: run }
      : kind.value === 'dropdown' ? { id, type: 'dropdown', label: text, icon, items: [{ id: `${id}.action`, type: 'action', label: 'Try Action', run }] }
      : { id, type: 'action', label: text, icon, run };
    remove = frame.registerNavigationItem(item);
  } else if (region) {
    remove = frame.registerView({ id, label: text, icon, component: DockSample, props: { label: text } }, region);
    frame.openView(id);
  } else if (isStatus) {
    remove = frame.status.register({ id, kind: 'button', label: text, text, side: 'left', run });
  } else {
    remove = frame.registerToolbarAction({ id, label: text, icon, run });
  }
  removers.set(id, remove);
  entries.value.push({ id, label: text });
}
function removeItem(id: string) {
  removers.get(id)?.(); removers.delete(id);
  entries.value = entries.value.filter(entry => entry.id !== id);
}
function toggle() {
  if (isNavigation) frame.navigationBar.setVisible(!visible.value);
  else if (region) container.toggle();
  else if (isStatus) frame.status.setBarVisible(!visible.value);
  else if (isMenu) frame.menuBar.toggle();
}
function split() { frame.splitWorkspace('right'); }
function addTab() {
  const pane = frame.workspace.activePane.value;
  frame.workspace.setPaneMode(pane, 'tabs');
  void frame.workspace.requestTab(pane);
}
frame.registerCommand({ id: 'playground.menu.action', label: 'Try Menu Action', run: () => { feedback.value = 'Menu action activated'; } });
const menuItems = [{ id: 'playground.menu', label: 'Playground', children: [{ id: 'playground.action', label: 'Try Menu Action', command: 'playground.menu.action' }] }];
onBeforeUnmount(() => { removers.forEach(remove => remove()); frame.dispose(); });
</script>
<template>
  <section class="layout-playground" aria-label="Layout Playground controls">
    <div v-if="!isDocks" class="controls">
      <FrameButton v-if="!isWorkspace" variant="secondary" @click="toggle">{{ visible ? 'Hide' : 'Show' }} {{ isNavigation ? 'Navigation Bar' : isStatus ? 'Status Bar' : isMenu ? 'Menu Bar' : region === 'primary' ? 'Primary Sidebar' : region === 'secondary' ? 'Secondary Sidebar' : 'Panel' }}</FrameButton>
      <template v-if="isWorkspace"><FrameButton variant="secondary" @click="split">Split Right</FrameButton><FrameButton variant="secondary" @click="frame.splitWorkspace('down')">Split Down</FrameButton><FrameButton variant="primary" @click="addTab">Add Workspace Tab</FrameButton></template>
      <form v-else @submit.prevent="addItem">
        <label>Item Label<FrameTextField v-model="label" required /></label>
        <label v-if="isNavigation">Item Type<FrameSelect v-model="kind" label="Item Type" :options="itemTypes" /></label>
        <FrameButton type="submit" variant="primary">Add {{ region ? 'View' : 'Item' }}</FrameButton>
      </form>
      <template v-if="isNavigation">
        <label>Position<FrameSelect :model-value="frame.navigationBar.position.value" label="Position" :options="positions" @update:model-value="frame.navigationBar.setPosition($event as 'top'|'bottom'|'left'|'right')" /></label>
        <label>Display<FrameSelect :model-value="frame.navigationBar.display.value" label="Display" :options="displays" @update:model-value="frame.navigationBar.setDisplay($event as 'icons'|'text'|'both')" /></label>
      </template>
      <template v-if="region">
        <FrameButton variant="secondary" @click="bar.toggle()">Toggle View Bar</FrameButton>
        <label>View Bar Display<FrameSelect :model-value="bar.display.value" label="View Bar Display" :options="displays" @update:model-value="bar.setDisplay($event as 'icons'|'text'|'both')" /></label>
        <label>View Bar Size<FrameSelect :model-value="bar.size.value" label="View Bar Size" :options="sizes" @update:model-value="bar.setSize($event as 'default'|'compact')" /></label>
        <label v-if="region !== 'bottom'">View Bar Position<FrameSelect :model-value="region === 'primary' ? frame.primaryViewBar.position.value : frame.secondaryViewBar.position.value" label="View Bar Position" :options="viewBarPositions" @update:model-value="(region === 'primary' ? frame.primaryViewBar : frame.secondaryViewBar).setPosition($event as 'default'|'top'|'bottom'|'hidden')" /></label>
        <label v-if="region === 'bottom'">Panel Position<FrameSelect :model-value="frame.panel.position.value" label="Panel Position" :options="positions" @update:model-value="frame.panel.setPosition($event as 'top'|'bottom'|'left'|'right')" /></label>
        <label v-else>Primary Side<FrameSelect v-model="frame.layout.primarySide" label="Primary Side" :options="sides" /></label>
      </template>
    </div>
    <ul v-if="entries.length" class="entries"><li v-for="entry in entries" :key="entry.id"><span>{{ entry.label }}</span><FrameButton v-if="region" variant="secondary" @click="frame.openView(entry.id)">Open</FrameButton><FrameButton variant="secondary" :aria-label="`Remove ${entry.label}`" @click="removeItem(entry.id)">Remove</FrameButton></li></ul>
    <p v-if="!isDocks" role="status">{{ feedback }}</p>
    <div class="docs-frame-preview-label">Live Preview · Frame Monokai Dark</div>
    <div class="docs-frame-preview" :class="{ docks: isDocks }">
      <FrameShell :frame="frame" title-text="Layout Playground" :show-search="false" :menu-items="isMenu ? menuItems : []">
        <DockPlayground v-if="isDocks" />
        <div v-else class="preview-content"><h2>Workspace</h2><p>{{ entries.length || isWorkspace ? 'Interact with the shell around this workspace.' : 'Add an item above to begin.' }}</p><p v-if="region">Type in a view’s draft, switch views, then reopen it to test state retention.</p></div>
      </FrameShell>
    </div>
  </section>
</template>
<style scoped>
.controls,.controls form{display:flex;flex-wrap:wrap;gap:12px;align-items:end}.controls form{margin:0}.controls label{display:grid;gap:4px;min-width:130px}.controls :deep(.frame-select),.controls :deep(.frame-text-input){width:100%;min-width:0}.entries{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px}.entries li{display:flex;align-items:center;gap:8px;padding:6px;border:1px solid var(--frame-border-color);border-radius:var(--frame-radius-small)}.preview-content{padding:24px;color:var(--frame-text)}h2{font-size:18px}
</style>
