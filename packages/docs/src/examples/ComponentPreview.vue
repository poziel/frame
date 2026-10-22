<script setup lang="ts">
import FormExamples from './FormExamples.vue';
import { formExamples } from './formCatalog';
import { computed, h, onBeforeUnmount, ref, useId } from "vue";
import { useFrame } from "../../../core/src/frame/createFrame";
import type { FrameMenuItem } from "../../../core/src/types";
import { SelectOption, SelectSeparator, type SelectItem } from "../../../core/src/types";
import FrameSlider from "../../../core/src/components/FrameSlider.vue";
import FrameColorPicker from "../../../core/src/components/FrameColorPicker.vue";
import FrameTextArea from "../../../core/src/components/FrameTextArea.vue";
import FrameButton from "../../../core/src/components/FrameButton.vue";
import FrameIconButton from "../../../core/src/components/FrameIconButton.vue";
import FrameTextInput from "../../../core/src/components/FrameTextInput.vue";
import FrameCheckbox from "../../../core/src/components/FrameCheckbox.vue";
import FrameSelect from "../../../core/src/components/FrameSelect.vue";
import FrameIcon from "../../../core/src/components/FrameIcon.vue";
import FrameTooltip from "../../../core/src/components/FrameTooltip.vue";
import FrameMenu from "../../../core/src/components/FrameMenu.vue";
import ContextMenu from "../../../core/src/components/ContextMenu.vue";
import SettingControl from "../../../core/src/components/SettingControl.vue";
import ResizablePane from "../../../core/src/components/ResizablePane.vue";
import ResizeHandle from "../../../core/src/components/ResizeHandle.vue";
import ShowcaseModalContent from "./ShowcaseModalContent.vue";
import LoaderExample from "./LoaderExample.vue";
import CodeBlockExample from "./CodeBlockExample.vue";
import CodeEditorExample from './CodeEditorExample.vue';
import LoadingExample from "./LoadingExample.vue";
import AIChatExample from "./AIChatExample.vue";
import TerminalExample from './TerminalExample.vue';
const props = defineProps<{ id: string; variant?: string }>();
const emit = defineEmits<{ feedback: [text: string] }>();
const frame = useFrame(), instance = useId();
const text = ref<string | number>("Frame workspace"), checked = ref(false), disabled = ref(false), tooltip = ref(true), highlight = ref(true);
const choice = ref("manual"), size = ref(28), width = ref(180), axis = ref<"x" | "y">("x"), volume = ref(50), color = ref("#0078d4"), notes = ref("Make room for the details.");
const trigger = ref<{ element?: HTMLButtonElement }>(), menuOpen = ref(false);
let count = 0; const disposers: (() => void)[] = []; let viewAdded = false, actionAdded = false;
function report(value: unknown) { emit("feedback", String(value)); }
function click(name: string) { report(`${name} clicked · ${++count} action${count === 1 ? "" : "s"}`); }
const describedOptions: SelectItem[] = [new SelectOption({ value: "manual", label: "Manual", description: "Save only when you choose the Save action." }), new SelectOption({ value: "automatic", label: "Automatic", detail: "recommended", description: "Save changes as you work." }), new SelectOption({ value: "focus", label: "On focus change", description: "Save when you move to another view." }), new SelectOption({ value: "unavailable", label: "Unavailable option", disabled: true })];
const options = computed<SelectItem[]>(() => {
  if (props.variant === "separators") return [
    ...Array.from({ length: 5 }, (_, i) => ({ value: `first-${i}`, label: `Local option ${i + 1}` })),
    new SelectSeparator("remote"),
    ...Array.from({ length: 6 }, (_, i) => ({ value: `second-${i}`, label: `Remote option ${i + 1}` })),
    new SelectSeparator("advanced"),
    ...Array.from({ length: 4 }, (_, i) => ({ value: `third-${i}`, label: `Advanced option ${i + 1}` })),
  ];
  if (props.variant === "plain") return [new SelectOption({ value: "manual", label: "Manual" }), new SelectOption({ value: "automatic", label: "Automatic" }), new SelectOption({ value: "focus", label: "On focus change" })];
  if (props.variant === "disabled") return [new SelectOption({ value: "manual", label: "Manual" }), new SelectOption({ value: "automatic", label: "Automatic", disabled: true }), new SelectOption({ value: "focus", label: "On focus change" })];
  return describedOptions;
});
if (props.variant === "separators") choice.value = "first-0";
const items: FrameMenuItem[] = [{ id: "new", label: "New item" }, { id: "views", label: "Open view", children: [{ id: "outline", label: "Outline" }, { id: "preview", label: "Preview" }] }, { id: "separator", type: "separator" }, { id: "disabled", label: "Unavailable action", disabled: true }];
function select(item: FrameMenuItem) { if (item.type !== "separator") report(`Selected: ${item.label}`); }
function modal() { frame.openModal({ id: `showcase-modal-${instance}`, title: "Component example", component: ShowcaseModalContent, icon: () => h(FrameIcon, { name: "window" }), width: 620, height: 360 }); }
async function pick() { const item = await frame.showQuickPick([{ id: "one", label: "First choice", detail: "A normal choice" }, { id: "two", label: "Second choice" }, { id: "disabled", label: "Unavailable", disabled: true }], { title: "Try Quick input" }); report(item ? `Selected: ${item.label}` : "Picker cancelled"); }
function openViews() {
  const viewId = `showcase-collection-${instance}`;
  if (!viewAdded) { disposers.push(frame.registerView({ id: viewId, label: "Example collection", children: ["Outline", "Details", "History"].map((title, index) => ({ id: `${viewId}-${index}`, label: title, component: { render: () => h("p", { style: "padding: 12px; line-height: 1.6" }, `${title} is a child view. Collapse its header or resize the shared separator.`) } })) }, "secondary")); viewAdded = true; }
  frame.openView(viewId); report("Example collection opened in the secondary sidebar. It is removed when you leave this example.");
}
function addAction() {
  if (!actionAdded) { disposers.push(frame.registerActivityAction({ id: `showcase-action-${instance}`, label: "Example action", icon: () => h(FrameIcon, { name: "zap" }), run: () => click("Activity action") })); actionAdded = true; }
  report("A lightning action is now in the activity bar. Click it without switching views; it is removed when you leave this example.");
}
onBeforeUnmount(() => disposers.reverse().forEach(dispose => dispose()));
</script>
<template><div class="component-preview-controls">
  <template v-if="formExamples.some(item => item.id === id)"><FormExamples :id="id" @feedback="report"/></template><template v-else-if="id === 'loader'"><LoaderExample /></template>
  <template v-else-if="id === 'code-block'"><CodeBlockExample /></template>
  <template v-else-if="id === 'code-editor'"><CodeEditorExample /></template>
  <template v-else-if="id === 'ai-chat'"><AIChatExample @feedback="report"/></template>
  <template v-else-if="id === 'terminal'"><TerminalExample/></template>
  <template v-else-if="id === 'loading'"><LoadingExample /></template>
  <template v-else-if="id === 'buttons'"><div class="showcase-row"><FrameButton :disabled="disabled" @click="click('Ghost')">Quiet action</FrameButton><FrameButton variant="secondary" :disabled="disabled" @click="click('Secondary')">Secondary action</FrameButton><FrameButton variant="primary" icon="check" :disabled="disabled" @click="click('Primary')">Primary action</FrameButton></div><FrameCheckbox v-model="disabled" label="Disable the buttons"/></template>
  <template v-else-if="id === 'icon-buttons'"><div class="showcase-row"><FrameIconButton label="Refresh preview" icon="refresh" :size="size" :tooltip="tooltip" :hover-highlight="highlight" @click="click('Refresh')"/><FrameIconButton label="Add item" icon="add" :size="size" :tooltip="tooltip" :hover-highlight="highlight" @click="click('Add')"/><FrameIconButton label="Disabled action" icon="close" disabled/></div><SettingControl :setting="{ id: 'size', label: 'Button size', type: 'range', min: 24, max: 48, default: 28 }" :model-value="size" @update:model-value="size = Number($event)"/><FrameCheckbox v-model="tooltip" label="Show tooltips"/><FrameCheckbox v-model="highlight" label="Highlight on hover"/></template>
  <template v-else-if="id === 'text-input'"><label for="preview-text">Workspace name</label><FrameTextInput id="preview-text" v-model="text" :disabled="disabled" placeholder="Name your workspace" @update:model-value="report($event)"/><FrameCheckbox v-model="disabled" label="Disable input"/><p>Current value: {{ text }}</p></template>
  <template v-else-if="id === 'checkbox'"><FrameCheckbox v-model="checked" label="Enable autosave" @update:model-value="report(`Autosave: ${$event ? 'enabled' : 'disabled'}`)"/><FrameCheckbox label="Unavailable preference" disabled/><p>Checked: {{ checked }}</p></template>
  <template v-else-if="id === 'select'"><FrameSelect v-model="choice" label="Save mode" :options="options" default-value="manual" :disabled="disabled" @update:model-value="report(`Save mode: ${$event}`)"/><FrameCheckbox v-model="disabled" label="Disable select"/><p>Selected value: {{ choice }}</p></template>
  <template v-else-if="id === 'setting-controls'"><SettingControl :setting="{ id: 'volume', label: 'Volume', type: 'range', default: 50, min: 0, max: 100 }" :model-value="volume" @update:model-value="volume = Number($event); report(`Volume: ${$event}`)"/><SettingControl :setting="{ id: 'color', label: 'Accent sample', type: 'color', default: '#0078d4' }" :model-value="color" @update:model-value="color = String($event); report($event)"/><SettingControl :setting="{ id: 'notes', label: 'Notes', type: 'textarea', default: '' }" :model-value="notes" @update:model-value="notes = String($event); report($event)"/></template>
  <template v-else-if="id === 'icons'"><div class="showcase-row"><FrameIcon name="home" :size="24"/><FrameIcon name="settings-gear" :size="24"/><FrameIcon name="symbol-class" :size="24"/></div></template>
  <template v-else-if="id === 'slider'"><label for="slider-example">Volume: {{ volume }}</label><FrameSlider id="slider-example" v-model="volume" :min="0" :max="100" @update:model-value="report(`Volume: ${$event}`)"/></template>
  <template v-else-if="id === 'color-picker'"><label for="color-example">Project color</label><FrameColorPicker id="color-example" v-model="color" @update:model-value="report($event)"/><code>{{ color }}</code></template>
  <template v-else-if="id === 'text-area'"><label for="notes-example">Notes</label><FrameTextArea id="notes-example" v-model="notes" placeholder="Write a note…" @update:model-value="report($event)"/></template>
  <template v-else-if="id === 'tooltips'"><div class="showcase-row"><FrameTooltip v-for="placement in (['top','bottom','left','right'] as const)" :key="placement" :text="`Tooltip on the ${placement}`" :placement="placement" v-slot="{ describedby }"><FrameButton variant="secondary" :aria-describedby="describedby">{{ placement }}</FrameButton></FrameTooltip></div></template>
  <template v-else-if="id === 'menus'"><FrameButton ref="trigger" variant="secondary" @click="menuOpen = true">Open actions menu</FrameButton><FrameMenu v-if="menuOpen && trigger?.element" :anchor="trigger.element" :items="items" label="Example actions" @select="select" @close="menuOpen = false"/></template>
  <template v-else-if="id === 'context-menu'"><ContextMenu :items="items" label="Example context menu" @select="select"><div class="showcase-context-target" tabindex="0">Right-click this surface to choose an action.</div></ContextMenu></template>
  <template v-else-if="id === 'resizable-panes'"><FrameSelect :model-value="axis" label="Pane direction" :options="[{value:'x',label:'Side by side'},{value:'y',label:'Stacked'}]" @update:model-value="axis = $event as 'x' | 'y'"/><div class="showcase-split"><ResizablePane v-model="width" :axis="axis" :min="80" :max="400" :min-second="80" label="Resize example panes"><template #first><div class="showcase-pane">First pane · {{ Math.round(width) }}px preferred</div></template><template #second><div class="showcase-pane">Second pane<br/>Drag the divider or focus it and use arrow keys.</div></template></ResizablePane></div></template>
  <template v-else-if="id === 'resize-handle'"><div class="showcase-resize-demo"><div :style="{ width: `${width}px` }" class="showcase-resize-box">{{ Math.round(width) }}px</div><ResizeHandle axis="x" label="Resize sample width" :value="width" :min="80" :max="320" @change="width = $event; report(`Width: ${Math.round($event)}px`)" @reset="width = 180"/></div></template>
  <template v-else-if="id === 'modals'"><FrameButton variant="secondary" @click="modal">Open example modal</FrameButton></template>
  <template v-else-if="id === 'settings'"><FrameButton variant="secondary" icon="settings-gear" @click="frame.openSettings()">Open application settings</FrameButton><p>The demo preferences are live: density, sidebar position, workspace title, and centering.</p></template>
  <template v-else-if="id === 'notification-panel'"><FrameButton variant="secondary" @click="frame.executeCommand('features.notifications'); report('Notification history toggled')">Toggle notification history</FrameButton></template>
  <template v-else-if="id === 'notifications'"><div class="showcase-row"><FrameButton v-for="severity in (['info','success','warning','error'] as const)" :key="severity" variant="secondary" @click="frame.notify({title: `${severity[0]!.toUpperCase()}${severity.slice(1)} example`, severity, details:'This notification disappears after five seconds. Hover or focus to keep reading.', source:'Components', action: { label: 'Open settings', run: () => frame.openSettings() }}); report(`${severity} notification added`)">{{ severity }}</FrameButton></div></template>
  <template v-else-if="id === 'quick-input'"><FrameButton variant="secondary" @click="pick">Open a quick picker</FrameButton></template>
  <template v-else-if="id === 'banner'"><div class="showcase-row"><FrameButton variant="secondary" :disabled="!frame.banner.value" @click="frame.openBanner(); report('Banner opened above the workspace')">Show banner</FrameButton><FrameButton @click="frame.closeBanner()">Hide banner</FrameButton></div></template>
  <template v-else-if="id === 'workspace'"><div class="showcase-row"><FrameButton v-for="direction in (['left','right','up','down'] as const)" :key="direction" variant="secondary" @click="frame.splitWorkspace(direction)">Split {{ direction }}</FrameButton></div><p>Home returns to a single empty workspace.</p></template>
  <template v-else-if="id === 'views'"><FrameButton variant="secondary" @click="openViews">Open a live collection in the secondary sidebar</FrameButton></template>
  <template v-else-if="id === 'activity-actions'"><FrameButton variant="secondary" @click="addAction">Add a temporary activity action</FrameButton><FrameButton @click="frame.resetWorkspace()">Run the Home action</FrameButton></template>
</div></template>
