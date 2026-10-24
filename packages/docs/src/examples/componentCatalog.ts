import { generalExamples } from './generalCatalog';
import { formExamples } from './formCatalog';
import { fileUploadExamples } from './fileUploadCatalog';
const propertyTypes: Record<string, string[]> = {
  'code-editor': ['string', 'CodeEditorController', 'string', 'CodeBlockTheme', 'boolean', 'CodeEditorOptions', 'string', 'boolean', 'event'],
  terminal: ['TerminalController', 'string', 'string', 'string', 'ViewDefinition', 'TerminalSessionLayout'],
  'code-block': ['string', 'string', 'CodeBlockTheme', 'boolean', 'boolean', 'readonly number[]', 'number', 'boolean', 'boolean', 'string', 'event'],
  navigation: ['boolean', 'boolean', '() => boolean', 'boolean', '() => void'],
  'ai-chat': ['AIChatController', '"left" | "right"', 'readonly FrameMenuItem[] / event', '(messages: ChatMessage[], source: ChatMessage) => void', 'boolean / event', 'slot'],
  loader: ['FrameLoaderVariant', 'number', 'string', 'number | undefined', 'number | undefined', 'string', 'boolean', 'number', 'number'],
  loading: ['boolean', 'FrameLoaderVariant', 'string', 'number / string / number / number / number / number', 'slot', 'slot', 'string', 'FrameLoadingTextPosition', 'boolean', 'boolean', 'slot', 'slot'],
  buttons: ['"ghost" | "secondary" | "primary"', 'string', 'boolean', '(event: MouseEvent) => void'],
  'icon-buttons': ['number', 'boolean | string', 'boolean'],
  'text-input': ['string | number', '"text" | "number" | "password" | "search" | "email"', 'boolean / string'],
  checkbox: ['boolean', 'string'], select: ['readonly SelectItem[]', 'string'],
  slider: ['number', 'number'], 'color-picker': ['string', 'boolean'], 'text-area': ['string', 'number / string'],
  'setting-controls': ['SettingDefinition', 'SettingValue'], icons: ['string', 'number | string'],
  tooltips: ['"top" | "bottom" | "left" | "right"', 'string'],
  menus: ['readonly FrameMenuItem[]', 'HTMLElement'], 'context-menu': ['readonly FrameMenuItem[] / (item: FrameMenuItem) => void'],
  'resizable-panes': ['"x" | "y"', 'number', 'number'], 'resize-handle': ['"x" | "y" / boolean / number', '(value: number) => void / () => void'],
  modals: ['(definition: ModalDefinition) => { id: string; close: () => void } / (id: string) => void', 'readonly PanelAction[] / Component'],
  settings: ['(section: SettingsSection) => () => void', '(id: string, value: SettingValue) => boolean / (id: string) => boolean'],
  notifications: ['"info" | "success" | "warning" | "error"', 'string', 'number', 'NotificationAction | undefined'],
  'notification-panel': ['NotificationHistory', 'Frame', 'number'],
  'quick-input': ['readonly QuickPickItem[]', 'string', 'string', '"top" | "center"'], 'quick-panel': ['string', '"top" | "center"', 'slot', 'slot'],
  banner: ['"left" | "right" | "center" | "justify"', '() => void'],
  workspace: ['(direction: WorkspaceSplitDirection, paneId?: string) => string | undefined', '(id: string, content: WorkspacePaneContent) => void'],
  views: ['Component / readonly PanelDefinition[]', 'boolean'], 'navigation-items': ['() => void', 'boolean | (() => boolean)', 'boolean'],
};
const propertyReferences: Record<string, Record<number, string>> = {
  "code-block": { 2: "CodeBlockTheme" },
  "notification-panel": { 0: "NotificationHistory" }, notifications: { 3: "NotificationAction" }, modals: { 0: 'ModalDefinition', 1: 'PanelAction' }, settings: { 0: 'SettingsSection', 1: 'SettingValue' }, 'quick-input': { 0: 'QuickPickItem' }, workspace: { 0: 'WorkspaceSplitDirection', 1: 'WorkspacePaneContent' }, views: { 0: 'PanelDefinition' }, select: { 0: 'SelectItem' }, menus: { 0: 'FrameMenuItem' }, 'context-menu': { 0: 'FrameMenuItem' }, 'setting-controls': { 0: 'SettingDefinition' },
};
export interface ComponentExample { id: string; title: string; group: string; description: string; usage: string; code: string; properties: { name: string; description: string; type: string; reference?: string }[] }
function example(id: string, title: string, group: string, description: string, usage: string, code: string, properties: [string, string][] = []): ComponentExample { return { id, title, group, description, usage, code, properties: properties.map(([name, description], index) => ({ name, description, type: propertyTypes[id]?.[index] ?? "void", reference: propertyReferences[id]?.[index] })) }; }
export const componentExamples: ComponentExample[] = [...generalExamples, ...formExamples, ...fileUploadExamples,
  example('universal-viewer', 'Universal file viewer', 'Features', 'Preview local images, SVG, PDF, video, code, and plain text inline or fullscreen.', 'Choose a local file or a built-in sample, then open it fullscreen. Escape closes the dialog and restores focus. SVG offers an XML source toggle. Files stay in your browser. Office documents are unsupported; media decoding depends on the browser. PDF pages are visual previews without text selection or search.', `import { ref } from 'vue';
import { UniversalViewer, UniversalViewerContent, type ViewerFile } from '@frame/features';
import '@frame/features/style.css';

const open = ref(false);
const file = ref<ViewerFile>(); // Set to { source: selectedFile } from a file input.
// <UniversalViewerContent v-if="file" :file="file" style="height: 400px" />
// <UniversalViewer v-model:open="open" :file="file" />`),
  example('code-editor', 'Code editor', 'Features', 'A standalone Monaco editor with the same Shiki grammars and themes as Code Block.', 'Place the editor in any container with a defined height. Direct props override matching options. Monaco loads on first mount; each surface owns its model and undo history. A controller can attach to one surface at a time. Monaco themes apply globally across mounted editors. Formatting and semantic assistance depend on available language providers.', `import { CodeEditor, createCodeEditor } from '@frame/features';
import { CodeBlockTheme } from '@frame/core';
import '@frame/features/style.css';

const editor = createCodeEditor();
// <CodeEditor v-model="code" :editor="editor" language="typescript"
//   :theme="CodeBlockTheme.DarkPlus" :read-only="false"
//   :options="{ fontSize: 14, wordWrap: 'on', tabSize: 2 }"
//   style="height: 400px" />`, [['v-model', 'Optional source text; starts empty and updates on edits'], ['editor', 'Optional controller for focus, undo/redo, find, formatting and native Monaco access'], ['language', 'Shiki language name or alias; unknown names use plain text'], ['theme', 'Shared CodeBlockTheme enum; defaults to DarkPlus'], ['readOnly', 'Optional direct override of options.readOnly'], ['options', 'Typed Monaco editor and model options; updated reactively'], ['label', 'Accessible name; overrides options.ariaLabel'], ['autofocus', 'Focus once the editor is ready; defaults to false'], ['events', 'ready, update:modelValue, change, selection, focus, blur and error']]),
  example('terminal', 'Terminal', 'Features', 'Terminal sessions with an explicitly supplied backend, side-by-side panes, search, and a session sidebar.', 'The browser example uses a simulated command backend; it does not execute system commands. Supply a backend to run local or remote shells. Closing or moving a Frame view keeps its shells alive; the trash action terminates a session. Sidebar connector lines identify split groups. Right-click a session to rename it or change its color; hover reveals its close button.', `import { createTerminal, createTerminalView, Terminal } from '@frame/features';
import '@frame/features/style.css';

const terminal = createTerminal({ backend }); // Supply your application-owned TerminalBackend.
frame.registerView(createTerminalView({
  id: 'terminal', frame, terminal,
}), 'bottom');

// Or place the simple component in any container with a defined height:
// <Terminal :terminal="terminal" profile="pwsh" />
// Keep terminal in the application owner. Dispose it on app teardown.`, [['terminal', 'Application-owned controller shared by simple terminals and terminal views'], ['profile', 'Detected profile ID or display name; defaults to the preferred installed shell'], ['sessionId', 'Attach to an existing session without launching another shell'], ['cwd', 'Optional initial working directory'], ['createTerminalView', 'Creates a view definition using Frame header actions and Quick input'], ['sessionLayout', 'sidebar (default) or tabs, on TerminalView or createTerminalView; selectors hide with one session. Drag dividers to resize panes and sidebar. The terminal fills its parent height.']]),
  example("code-block", "Code block", "Display", "Read-only syntax highlighting powered by Shiki with 65 selectable themes.", "Languages and themes load on demand. Highlighted lines use displayed numbers, including the startLine offset. Unknown languages fall back to plain text. Copy preserves the original source. This component displays code; the host owns the source text.", `import { FrameCodeBlock, CodeBlockTheme } from '@frame/core';

<FrameCodeBlock :code="source" language="typescript"
  :theme="CodeBlockTheme.DarkPlus" :line-numbers="true"
  :highlight-on-hover="true" :highlighted-lines="[12]" :start-line="10" />`, [["code", "Required source text"], ["language", "Shiki language name or alias; defaults to text"], ["theme", "CodeBlockTheme enum; defaults to DarkPlus"], ["lineNumbers", "Show line numbers; defaults to false"], ["highlightOnHover", "Highlight hovered rows; defaults to true"], ["highlightedLines", "Displayed line numbers to emphasize"], ["startLine", "First displayed number; defaults to 1"], ["wrap", "Wrap long lines; defaults to false"], ["copyable", "Show the copy toolbar; defaults to true"], ["label", "Accessible viewer name"], ["error", "Emitted when highlighting fails; plain text remains visible"]]),
  example("navigation", "Back and forward", "Workspace", "Navigate through opened pages and registered views using title-bar arrows.", "Enable navigation when creating your frame. Opening workspace content or a registered view records a destination. Back preserves the forward path until a different destination opens. Use Back and Forward after Status Bar in Customize Layout to hide the arrows while keeping history. History belongs to this frame instance and is cleared on disposal. It does not undo edits or workspace geometry.", `const frame = createFrame({ navigation: true });
frame.setWorkspacePane(frame.workspace.activePane.value, { label: 'Page', component: Page });
frame.navigation.back();
frame.navigation.forward();
frame.layout.navigationVisible = false;
frame.navigation.clear();`, [["navigation", "createFrame option; false by default"], ["layout.navigationVisible", "Show or hide both arrows without discarding history"], ["navigation.back / forward", "Navigate one destination; returns false at a boundary or when disabled"], ["navigation.canGoBack / canGoForward", "Reactive availability flags"], ["navigation.clear", "Discard the current history"]]),
  example("ai-chat", "AI chat", "Features", "A chat room with ordered thoughts, answers, commentary, activities, approvals, questions and artifacts.", "Use the AI chat playground in the navigation bar to manually send events, request approvals, ask single/multiple-choice questions with custom answers, attach images/files and control turn completion. This component example uses the separate local mock server. Enter sends; Shift+Enter inserts a line. Rewind previews an edit without discarding replies until you send; Escape, X, or the same rewind button cancels. Forge emits an independent snapshot. Files stay local; voice input is a host integration hook.", `import { AIChat, createAIChat } from '@frame/features';
import '@frame/features/style.css';

const chat = createAIChat({
  async respond(request, response) {
    const thought = response.thinking('Checking the request…');
    // Await your backend here; forward request.signal to support Stop.
    response.finishThinking(thought);
    response.message('First message');
    response.message('Another message in the same generation');
    response.complete();
  }
});
// Dispose the controller when its owner unmounts.
// <AIChat :chat="chat" @forge="openConversation" />`, [["chat", "Controller from createAIChat; owns draft, messages, attachments and generation state"], ["userAlignment / assistantAlignment", "Independently select left or right alignment"], ["attachmentActions / attachmentAction", "Additional host-specific menu actions; files and folders are built in"], ["forge", "Emits an independent snapshot through the selected assistant response"], ["speechEnabled / speech", "Enable and handle voice input in the host"], ["message-actions / composer-actions / empty", "Slots for host actions and empty content"]]),
  example("loader", "Loader", "Display", "All 44 LDRS loading animations, available independently wherever you need an indicator.", "Browse all 44 styles below, select one, and copy its usage. The default is a 32px ring in the theme accent color. Reduced-motion preferences pause the animation. Use decorative when a surrounding component supplies the status.", `import { FrameLoader } from '@frame/core';

// In your template:
<FrameLoader variant="tailspin" :size="40" label="Calculating…" />`, [["variant", "All 44 LDRS styles; defaults to ring"], ["size", "Largest dimension in pixels; defaults to 32"], ["color", "Any CSS color; defaults to the theme accent"], ["speed", "Loop duration in seconds; 0 pauses; omitted uses the style default"], ["stroke", "Stroke width for styles that support it"], ["label", "Accessible status label; defaults to Loading…"], ["decorative", "Suppress the status when its parent already announces loading"], ["strokeLength", "Track length from 0 to 1 for supported styles"], ["bgOpacity", "Background track opacity from 0 to 1 for supported styles"]]),
  example("loading", "Loading region", "Overlays", "Cover one region with a loader while its mounted content continues initializing.", "Bind active to your task state and clear it in finally. Loading hides the default slot and makes it inert, preserving its component instances and layout. Other regions remain interactive. Keep the content mounted rather than putting it behind v-if. CPU-heavy JavaScript still needs a worker or backend task.", `<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FrameLoading } from '@frame/core';
const active = ref(true);
const data = ref<unknown>();
const error = ref('');
async function load() {
  active.value = true;
  error.value = '';
  try {
    const response = await fetch('/api/workspace');
    if (!response.ok) throw new Error('Unable to load workspace');
    data.value = await response.json();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    active.value = false;
  }
}
onMounted(load);
</script>
<template>
  <FrameLoading :active="active" variant="ring" label="Preparing workspace…">
    <p v-if="error" role="alert">{{ error }}</p>
    <pre v-else>{{ data }}</pre>
  </FrameLoading>
</template>`, [["active", "Required: cover and disable interaction in this region while true"], ["variant", "All 44 style choices from FrameLoader"], ["label", "Accessible status; also the visible fallback if text is omitted"], ["size / color / speed / stroke / strokeLength / bgOpacity", "Forwarded to the default loader"], ["default", "Content remains mounted, hidden and inert while active"], ["loader", "Replace only the animation; text keeps its configured placement"], ["text", "Visible message; falls back to label or Loading…. Empty string hides it"], ["textPosition", "above, below (default), left, or right of the loader"], ["showLoader", "Show the animation; true by default"], ["showText", "Show the message; true by default"], ["text (slot)", "Custom text markup"], ["overlay (slot)", "Replace the full overlay content with your own arrangement"]]),
  example("buttons", "Buttons", "Actions", "One button family for quiet actions, outlined actions, and primary actions.", "Use ghost buttons for most actions. Secondary buttons remain visible without using the accent. Reserve primary for the main action. Icon buttons use this same button foundation.", `<script setup lang="ts">
import { FrameButton } from '@frame/core';
const save = () => console.log('Saved');
</script>
<template>
  <FrameButton @click="save">Save</FrameButton>
  <FrameButton variant="secondary" @click="save">Save</FrameButton>
  <FrameButton variant="primary" icon="check" @click="save">Save</FrameButton>
</template>`, [["variant", "ghost (default), secondary, or primary"], ["icon", "Optional Iconify/Codicon name"], ["disabled", "Prevents interaction"], ["click", "Emits the native MouseEvent"]]),
  example("icon-buttons", "Icon buttons", "Actions", "Centered icon actions with a shared hit area, hover state, and tooltip.", "Use an accessible label for every icon-only action. Change the button size and icon ratio independently; disable tooltips or hover backgrounds when appropriate.", `<FrameIconButton label="Refresh" icon="refresh" :size="28" :icon-ratio="0.6" tooltip-placement="top" @click="refresh" />`, [["size / iconRatio", "Button size in pixels and icon-to-button ratio"], ["tooltip", "true, false, or custom tooltip text"], ["hoverHighlight", "Enable or disable the hover background"]]),
  example("text-input", "Text inputs", "Form controls", "Text, number, password, email, and search inputs with consistent focus styling.", "Bind the value with v-model and associate a visible label using for/id. Numeric inputs emit numbers; an empty numeric input emits an empty string so a host can validate it.", `<script setup lang="ts">
import { ref } from 'vue';
import { FrameTextInput } from '@frame/core';
const name = ref('Workspace');
</script>
<template><label for="name">Name</label><FrameTextInput id="name" v-model="name" /></template>`, [["v-model", "The current string or number"], ["type", "text, number, password, search, email"], ["disabled / placeholder", "Standard input behavior"]]),
  example("checkbox", "Checkboxes", "Form controls", "A neutral checkbox with a clickable label and visible keyboard focus.", "Click the label or press Space while focused to toggle the value. Disabled checkboxes keep their state and cannot be changed.", `<script setup lang="ts">
import { ref } from 'vue';
import { FrameCheckbox } from '@frame/core';
const enabled = ref(false);
</script>
<template><FrameCheckbox v-model="enabled" label="Enable autosave" /></template>`, [["v-model", "Boolean checked state"], ["label", "Visible and accessible label"]]),
  example("select", "Selects", "Form controls", "An application-styled dropdown with option details and descriptions.", "Open the list with click or ArrowDown. Move with arrow keys, choose with Enter, cancel with Escape, or type an option name. The dropdown flips upward when space is limited.", `<script setup lang="ts">
import { ref } from 'vue';
import { FrameSelect, SelectOption } from '@frame/core';
const mode = ref('manual');
const options = [new SelectOption({ value: 'manual', label: 'Manual', description: 'Save when you choose.' }), new SelectOption({ value: 'automatic', label: 'Automatic', description: 'Save changes as you work.' })];
</script>
<template><FrameSelect v-model="mode" label="Save mode" :options="options" default-value="manual" /></template>`, [["options", "SelectItem[]: options with value/label and optional description/detail/disabled, or separators with type/id"], ["defaultValue", "Shows a default marker without changing selection"]]),
  example("slider", "Sliders", "Form controls", "A standalone numeric slider; no settings metadata required.", "Bind a number with v-model. min, max, and step control the range. Label it using for/id or aria-label.", `<FrameSlider v-model="volume" :min="0" :max="100" :step="1" aria-label="Volume" />`, [["v-model", "Numeric value"], ["min / max / step", "Range and increment"]]),
  example("color-picker", "Color pickers", "Form controls", "A standalone color input using hexadecimal colors.", "Bind a #RRGGBB string and provide an accessible label. The platform picker lets users choose the color.", `<FrameColorPicker v-model="color" aria-label="Project color" />`, [["v-model", "Hexadecimal color string"], ["disabled", "Prevent changes"]]),
  example("text-area", "Text areas", "Form controls", "A standalone multiline text area for notes and longer text.", "Bind a string with v-model; use rows and placeholder to guide input. Associate a visible label using for/id.", `<FrameTextArea v-model="notes" :rows="5" placeholder="Write a note…" aria-label="Notes" />`, [["v-model", "Multiline string"], ["rows / placeholder", "Standard textarea behavior"]]),
  example("setting-controls", "Settings controls", "Form controls", "Metadata-driven controls for complete settings forms.", "SettingControl renders text, textarea, number, checkbox, select, range, or color. The settings model provides validation and host persistence callbacks.", `<SettingControl :setting="{ id: 'volume', label: 'Volume', type: 'range', default: 50, min: 0, max: 100 }" :model-value="volume" @update:model-value="volume = $event" />`, [["setting", "A SettingDefinition describing the control"], ["modelValue", "The current value"]]),
  example("icons", "Icons", "Display", "Microsoft Codicons offline and Iconify collection names on demand.", "Specify codicon:name or pack:name. Core Codicons are bundled; other packs need network access unless registered locally. Icons are decorative, so label the surrounding control.", `<FrameIcon name="codicon:layout-sidebar-left" :size="24" />
<FrameIcon pack="codicon" name="settings-gear" :size="24" />`, [["name / pack", "Iconify collection and icon name"], ["size", "Rendered width and height"]]),
  example("tooltips", "Tooltips", "Overlays", "Shared hover and keyboard tooltips that fit within the window.", "Tooltips appear after a hover delay or on keyboard focus. They disappear on pointer-down, Escape, scroll, or resize. Choose any side; placement falls back when space is limited.", `<FrameTooltip text="Save workspace" shortcut="Ctrl+S" placement="top" v-slot="{ describedby }">
  <FrameButton :aria-describedby="describedby">Save</FrameButton>
</FrameTooltip>`, [["placement", "top, bottom, left, or right"], ["shortcut", "Optional keyboard shortcut hint"]]),
  example("menus", "Dropdown menus", "Overlays", "Command menus with separators, disabled choices, and nested submenus.", "Anchor FrameMenu to a button. Use arrows to navigate, Enter to choose, Escape to dismiss, and Right/Left to navigate submenus. Menus fit to the viewport.", `<FrameButton ref="trigger" @click="open = true">Actions</FrameButton>
<FrameMenu v-if="open" :anchor="trigger.element" :items="items" label="Actions" @select="choose" @close="open = false" />`, [["items", "FrameMenuItem entries and nested children"], ["anchor", "HTMLElement used for placement and focus restoration"]]),
  example("context-menu", "Context menus", "Overlays", "Application-owned right-click menus using the same menu renderer.", "Wrap any content with ContextMenu and provide menu items. The browser context menu stays suppressed inside Frame. Each host decides where custom menus are useful.", `<ContextMenu :items="[{ id: 'inspect', label: 'Inspect' }]" label="Preview actions" @select="inspect">
  <div>Right-click here</div>
</ContextMenu>`, [["items / select", "Uses the same item and event contract as FrameMenu"]]),
  example("resizable-panes", "Resizable panes", "Layout", "Two connected panes with an accessible shared resize bar.", "Resize with the pointer or arrow keys. Home/double-click restores the default size. Temporary container shrinking preserves the preferred size. Change axis to stack the panes.", `<ResizablePane v-model="width" :min="100" :min-second="100" label="Resize preview">
  <template #first>Navigation</template>
  <template #second>Content</template>
</ResizablePane>`, [["axis", "x for side by side; y for stacked"], ["min / max / minSecond", "Bounds for the two regions"], ["v-model", "First pane size in pixels"]]),
  example("resize-handle", "Resize handles", "Layout", "The shared separator for custom resize interactions.", "ResizeHandle reports values; the host decides how to apply them. It supports pointer capture, keyboard arrows, Escape cancellation, and reset. Grip dots are opt-in and reserved for outer shell regions.", `<ResizeHandle axis="x" label="Resize sample" :value="width" :min="100" :max="400" @change="width = $event" @reset="width = 200" />`, [["axis / reverse / scale", "Map pointer movement to a value"], ["change / reset", "Events for host-owned sizing"]]),
  example("modals", "Modals", "Overlays", "Movable, resizable dialogs within the workbench.", "Open a registered Vue component with frame.openModal. The modal traps focus, closes on Escape, and supports maximize/restore. Set createFrame({ modal: { contentPadding: 16, width: 480, height: 280 } }) for application defaults. Override contentPadding with 0 for edge-to-edge content; set draggable, resizable, or maximizable to false independently. Supply footer and footerProps for application-owned bottom actions. Background content becomes inert while a modal is active.", `frame.openModal({ id: 'properties', title: 'Properties', component: MyProperties, width: 640, height: 420, contentPadding: 16, maximizable: false, footer: PropertyActions });`, [["openModal / closeModal", "Open, activate, and close modal instances"], ["actions / icon", "Optional header contributions"]]),
  example("settings", "Settings", "Overlays", "A ready-to-use settings modal with nested categories and standard controls.", "Register application-owned sections. Frame handles navigation and presentation; onChange and optional getValue connect the controls to your preference store.", `frame.registerSettingsSection({ id: 'general', title: 'General', settings: [{ id: 'autosave', label: 'Autosave', type: 'checkbox', default: true }] });
frame.openSettings();`, [["registerSettingsSection", "Returns a disposer"], ["settings.set / reset", "Validated edits and default restoration"]]),
  example("notifications", "Notifications", "Overlays", "Transient application notifications in the bottom-left corner.", "Notifications disappear after five seconds by default. Hover or keyboard focus pauses the timer. Set duration to 0 for a persistent notification. An optional action runs once and closes the notification on success. Notification history is available separately from @frame/features.", `frame.notify({ title: 'Project saved', severity: 'success', details: 'All changes are saved.', duration: 5000, action: { label: 'Open settings', run: () => frame.openSettings() } });`, [["severity", "info, success, warning, error"], ["details / source / priority", "Optional message, source label, and metadata"], ["duration", "Milliseconds before automatic dismissal; defaults to 5000. Zero stays until dismissed."], ["action", "Optional labeled callback; action failures produce an error notification."]]),
  example("notification-panel", "Notification history", "Overlays", "An optional ready-made notification panel from @frame/features.", "Create a history store before emitting notifications, mount NotificationPanel in the shell overlays slot and NotificationIndicator in status-actions. The history keeps up to 200 entries by default, independently of core expiry and dismissal. Its clear button changes history only.", `import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/features';
import '@frame/features/style.css';
const history = createNotificationHistory(frame);
// <FrameShell :frame="frame">
//   <template #overlays><NotificationPanel :frame="frame" :history="history" :bottom="38" /></template>
//   <template #status-actions><NotificationIndicator :history="history" /></template>
// </FrameShell>
// Call history.dispose() when the host is unmounted.`, [["history", "Opt-in store created by createNotificationHistory(frame, { limit: 200 })."], ["frame", "The shell instance whose notifications are collected."], ["bottom", "Panel offset in pixels above the bottom of the shell."]]),
  example("quick-input", "Quick input", "Overlays", "A searched list for choosing a command or application item.", "Mount FrameQuickInput when the picker is open. It always provides a search field, handles keyboard selection, and emits the accepted item ID. Close it on close or accept. Frame's showQuickPick API uses this same component.", `import { FrameQuickInput } from '@frame/core';`, [["items", "Unique IDs, labels, optional detail, shortcut and disabled state"], ["title", "Accessible picker name"], ["placeholder", "Search hint; defaults to Type to search…"], ["position", "Optional top or center override; otherwise follows the provided Frame layout"]]),
  example("quick-panel", "Quick panel", "Overlays", "A titled quick overlay for application-owned content and header actions.", "Mount FrameQuickPanel while open and handle close in the host. Supply application content through the default slot and optional actions through header-actions. It does not provide a search field or a selection model.", `import { FrameQuickPanel } from '@frame/core';`, [["title", "Visible panel heading"], ["position", "Optional top or center override; otherwise follows the provided Frame layout"], ["default", "Application-owned content"], ["header-actions", "Optional actions beside the title"]]),
  example("banner", "Banner", "Layout", "Custom content above the workspace with independent alignment.", "Register a Vue component and open the Banner. Left, right, center, and justify alignment determine which regions it spans. Banner content stays app-owned.", `frame.registerBanner({ id: 'review', label: 'Review', component: ReviewBanner });
frame.openBanner();`, [["layout.bannerAlignment", "left, right, center, justify"], ["openBanner / closeBanner", "Visibility controls"]]),
  example("workspace", "Workspace panes", "Layout", "Independent workspace surfaces that split in four directions.", "Split the focused pane, supply custom content with setWorkspacePane, or return to a single empty workspace with resetWorkspace. Closing a pane retains the remaining content.", `frame.splitWorkspace('right');
frame.setWorkspacePane(frame.workspace.activePane.value, { label: 'Preview', component: Preview });
frame.resetWorkspace();`, [["splitWorkspace", "left, right, up, down"], ["setWorkspacePane", "Replace a pane's content without changing its geometry"]]),
  example("views", "Views and sections", "Layout", "App-owned views that move between sidebars, panels, and nested collections.", "A view can hold custom content or child views. Collections share height between expanded sections and preserve preferred sizes. Drag policies control which views may move.", `frame.registerView({ id: 'collection', label: 'Collection', children: [{ id: 'outline', label: 'Outline', component: Outline }] }, 'primary');`, [["component / children", "Blank view or nested collection"], ["padded / movable / draggable", "Control layout and interaction"]]),
  example("navigation-items", "Navigation items", "Navigation", "Actions, links, menus and separators in the navigation bar.", "Navigation items are independent of sidebar and panel views. Register them explicitly; the host owns actions and destinations. The navigation bar can dock on any edge.", `frame.registerNavigationItem({ id: 'home', type: 'link', label: 'Home', href: '#/home' });`, [["type", "action, link, dropdown, or separator"], ["href", "Link destination"], ["run", "Action callback"]]),
];
