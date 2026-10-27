import { createNotificationHistory, NotificationPanel, NotificationIndicator } from '@frame/core/modules/notifications';
import { vscodeLight2026, vscodeHighContrastBlack, vscodeHighContrastWhite } from '@frame/themes';
import { defineTheme, parseTheme, themeTokens, FrameThemeError, type FrameTheme, type FrameThemeTokenName, type FrameThemeTokens, type FrameThemeController } from '@frame/core';
const themeToken: FrameThemeTokenName = '--frame-spacing-unit';
const themeOverrides: Partial<FrameThemeTokens> = { [themeToken]: '5px' };
const authoredTheme: FrameTheme = defineTheme({ version: 1, id: 'consumer', name: 'Consumer', appearance: 'dark', tokens: themeOverrides });
const importedTheme = parseTheme(JSON.stringify(authoredTheme));
void [themeTokens[themeToken].value, FrameThemeError, importedTheme];
// @ts-expect-error Unknown tokens are rejected during typed authoring as well as import.
const unknownThemeToken: FrameThemeTokenName = '--app-theme';
void unknownThemeToken;
import { themeFormats, parseThemeFile, type FrameThemeFormat, type FrameTokenPath, type FrameTokenTree } from '@frame/core';
const tokenPath: FrameTokenPath = 'frame.text.input.padding';
const tokenTree: FrameTokenTree = { frame: { text: { input: { padding: '24px' } } } };
const tokenFormat: FrameThemeFormat = 'toml';
const nestedTheme = defineTheme({ version: 1, id: 'nested', name: 'Nested', appearance: 'dark', tokens: tokenTree });
const fileTheme = parseTheme('[frame.text.input]\npadding = "24px"', { format: tokenFormat });
void [tokenPath, nestedTheme, fileTheme, themeFormats];
void parseThemeFile(new File(['frame.accent: "#123456"'], 'theme.yaml'));
// @ts-expect-error Token paths must exist in Frame's catalog.
const unknownTokenPath: FrameTokenPath = 'frame.missing.token';
void unknownTokenPath;
import type { ToolbarPlacement, ToolbarItemId } from '@frame/core';
const sidebarPlacement: ToolbarPlacement = { area: 'statusBar', side: 'left', order: -100 };
const sidebarControl: ToolbarItemId = 'primary';
void [sidebarPlacement, sidebarControl];
import { Terminal, TerminalView, createTerminal, createTerminalView, type TerminalController, type TerminalProfile, type TerminalSessionLayout } from '@frame/core/modules/terminal';
import { AIChat, createAIChat, type ChatResponseWriter, type ChatMessage, type ChatQuestion, type ChatQuestionAnswer, type ChatApprovalResult, type ChatQuestionsResult } from '@frame/core/modules/chat';
import { h } from "vue";
import { CodeEditor, createCodeEditor, type CodeEditorOptions, type CodeEditorProps } from '@frame/core/modules/editor';
const editorOptions: CodeEditorOptions = { fontSize: 15, wordWrap: 'on', tabSize: 2, minimap: { enabled: false } };
const editorProps: CodeEditorProps = { modelValue: '', editor: createCodeEditor(), language: 'typescript', readOnly: false, options: editorOptions };
void h(CodeEditor, editorProps);
import { FrameCodeBlock, CodeBlockTheme, type FrameCodeBlockProps } from "@frame/core";
const viewerProps: FrameCodeBlockProps = { code: "const value = 1;", language: "typescript", theme: CodeBlockTheme.DarkPlus, lineNumbers: true, highlightedLines: [40], startLine: 40 };
void h(FrameCodeBlock, viewerProps);
import { createFrame, FrameShell, FrameIcon, addCollection, FrameMenu, FrameModal, FrameSettings, SettingControl, FrameNotifications, FrameIconButton, ResizablePane, FrameButton, FrameTextField, FrameCheckbox, FrameSelect, ComponentShowcase, FrameSlider, FrameColorPicker, FrameTextArea, SelectOption, SelectSeparator, type SelectItem, type FrameMenuItem } from "@frame/core";

// Compile against the built package exports, rather than reaching into src/.
import { FrameLoader, FrameLoading, frameLoaderVariants, type FrameLoaderVariant, type FrameLoadingProps, type FrameLoadingTextPosition } from "@frame/core";
const loaderVariant: FrameLoaderVariant = "pinwheel";
const position: FrameLoadingTextPosition = "above";
const loadingProps: FrameLoadingProps = { active: true, variant: "newtons-cradle", text: "Preparing…", textPosition: position, showLoader: true, showText: true, bgOpacity: .2, strokeLength: .3 };
void [h(FrameLoader, { variant: loaderVariant, size: 24 }), h(FrameLoading, loadingProps, () => "Content"), frameLoaderVariants];
export function consumerFixture() {
  const chat = createAIChat({ respond(_request, writer: ChatResponseWriter) { writer.message("Hello"); writer.complete(); } });
  const conversation: ChatMessage[] = chat.fork("response");
  void [h(AIChat, { chat, userAlignment: "right", assistantAlignment: "left", onForge: (
    messages: ChatMessage[]
  ) => { void messages; } }), conversation];
  chat.dispose();
  const richChat = createAIChat({ async respond(request, writer) {
    writer.commentary('Checking the request');
    writer.message('An intermediate observation', { phase: 'intermediate' });
    const groupId = writer.activityGroup({ label: 'Project checks' });
    const activity = writer.activity({ label: 'Inspect files', output: 'Reading…', outputLanguage: 'text', groupId });
    writer.updateActivity(activity, { output: 'Done' }); writer.finishActivity(activity);
    const questions: ChatQuestion[] = [{ id: 'format', text: 'Format?', choices: [{ id: 'png', label: 'PNG' }], allowCustom: true, multiple: true }];
    const question = writer.askQuestions({ text: 'Export options', questions });
    const answers: ChatQuestionAnswer[] = [{ questionId: 'format', choiceIds: ['png'], customText: 'WebP' }];
    richChat.answerQuestions(question.id, answers);
    const result: ChatQuestionsResult = await question.result;
    const approval = writer.requestApproval({ text: 'Export files?', detail: 'Writes to the export folder' });
    richChat.resolveApproval(approval.id, 'allow');
    const decision: ChatApprovalResult = await approval.result;
    if (request.signal.aborted || result.status === 'cancelled' || decision.status === 'cancelled') return;
    writer.artifact({ name: 'image.png', kind: 'image', url: 'https://example.com/image.png', mimeType: 'image/png', size: 1024 });
    writer.complete();
  } });
  richChat.cancelInteraction('request'); richChat.clear(); richChat.dispose();
  const frame = createFrame({ settings: true, notifications: true, navigation: true, theme: authoredTheme });
  const themeController: FrameThemeController = frame.theme;
  themeController.set(vscodeLight2026);
  themeController.set(vscodeHighContrastBlack);
  themeController.set(vscodeHighContrastWhite);
  themeController.set(importedTheme);
  const currentTheme: FrameTheme | null = themeController.current.value;
  themeController.reset();
  void currentTheme;
  const terminal: TerminalController = createTerminal({ backend: { async profiles() { return []; }, async spawn() { return 'consumer'; }, async write() {}, async resize() {}, async close() {} }, profile: 'pwsh' });
  const terminalProfiles: readonly TerminalProfile[] = terminal.profiles.value;
  const sessionLayout: TerminalSessionLayout = 'tabs';
  frame.registerView(createTerminalView({ id: 'consumer.terminal', frame, terminal, sessionLayout }), 'bottom');
  void [h(Terminal, { terminal, profile: 'cmd' }), h(TerminalView, { terminal, sessionLayout }), terminalProfiles];
  void [frame.navigation.canGoBack, frame.navigation.canGoForward, frame.navigation.back(), frame.navigation.forward(), frame.layout.navigationVisible];
  const history = createNotificationHistory(frame);
  void [NotificationPanel, NotificationIndicator, history];
  frame.registerSettingsSection({ id: "general", title: "General", settings: [{ id: "general.name", label: "Name", type: "text", default: "Artoria" }] });
  frame.notify({ title: "Ready", severity: "success", details: "Workspace is available" });
  void [FrameSettings, SettingControl, FrameNotifications];
  const button = h(FrameIconButton, { label: "Open", icon: "folder-opened", hoverHighlight: false, iconRatio: .6, tooltipPlacement: "right", onClick: () => {} });
  const split = h(ResizablePane, { axis: "x", modelValue: 210, min: 140, minSecond: 180 }, { first: () => "Navigation", second: () => "Content" });
  void [button, split, FrameButton, FrameTextField, FrameCheckbox, ComponentShowcase];
  const grouped: SelectItem[] = [new SelectOption({ value: "one", label: "One" }), new SelectSeparator("group"), new SelectOption({ value: "two", label: "Two" })];
  void [FrameSlider, FrameColorPicker, FrameTextArea, grouped];
  const select = h(FrameSelect, { modelValue: "one", label: "Choice", options: [{ value: "one", label: "One" }] }); void select;
  frame.registerNavigationItem({ id: "home", type:"action", label: "Home", run: frame.resetWorkspace });
  const icon = h(FrameIcon, { pack: "codicon", name: "layout-panel-justify", size: 16 });
  void icon; void addCollection;
  const menu: FrameMenuItem[] = [
    { id: "group", label: "Views", children: [{ id: "panel", label: "Panel", checked: true, command: "app.panel" }] },
    { id: "divider", type: "separator" },
    { id: "unavailable", label: "Unavailable", disabled: true },
  ];
  frame.layout.primarySide = "right";
  frame.registerSecondaryTab({ id: "app.details", label: "Details", component: { render: () => null } });
  frame.registerView({ id: "app.menu", label: "Menu", children: [{ id: "app.child", label: "Child", component: { render: () => null }, padded: false }] }, "primary");
  frame.registerBanner({ id: "app.banner", label: "Review", component: { render: () => null } });
  const modal = frame.openModal({ id: "app.modal", title: "Properties", component: { render: () => null } });
  modal.close();
  frame.layout.bannerAlignment = "justify";
  frame.splitWorkspace("right", frame.workspace.initialPaneId, { label: "Preview", component: { render: () => null } });
  frame.registerCommand({ id: "app.panel", label: "Panel", run() {} });
  return { component: h(FrameShell, { frame, titleText: "Artoria", showSearch: false, menuItems: menu }), menuComponent: FrameMenu, modalComponent: FrameModal };
}


// Public form compositions and calendar models must survive declaration emission.
import { FrameAutocomplete, FrameCheckboxGroup, FrameCombobox, FrameEditable, FrameField, FrameForm, FrameLabel, FrameListbox, FrameNumberField, FramePinField, FrameRadioGroup, FrameRating, FrameSwitch, FrameTagGroup, FrameTagField, FrameToggle, FrameToggleGroup, FrameCalendar, FrameRangeCalendar, FrameDateField, FrameDatePicker, FrameDateRangeField, FrameDateRangePicker, FrameTimeField, FrameTimeRangeField, FrameMonthPicker, FrameMonthRangePicker, FrameYearPicker, FrameYearRangePicker, FrameColorArea, FrameColorField, FrameColorSlider, FrameColorSwatch, FrameColorSwatchPicker, CalendarDate, Time, type DateRange, type TimeRange } from '@frame/core';
const exampleDay = new CalendarDate(2026, 10, 21);
const exampleRange: DateRange = { start: exampleDay, end: exampleDay.add({ days: 3 }) };
const exampleTimeRange: TimeRange = { start: new Time(9), end: new Time(17) };
void [FrameAutocomplete, FrameCheckboxGroup, FrameCombobox, FrameEditable, FrameField, FrameForm, FrameLabel, FrameListbox, FrameNumberField, FramePinField, FrameRadioGroup, FrameRating, FrameSwitch, FrameTagGroup, FrameTagField, FrameToggle, FrameToggleGroup, FrameCalendar, FrameRangeCalendar, FrameDateField, FrameDatePicker, FrameDateRangeField, FrameDateRangePicker, FrameTimeField, FrameTimeRangeField, FrameMonthPicker, FrameMonthRangePicker, FrameYearPicker, FrameYearRangePicker, FrameColorArea, FrameColorField, FrameColorSlider, FrameColorSwatch, FrameColorSwatchPicker, exampleRange, exampleTimeRange];

import type { ToolbarControl, ToolbarOptions,  PrimaryViewBarOptions, ViewBarPosition, ViewBarSize } from '@frame/core';
const viewId = 'consumer.details';
const activityOptions: PrimaryViewBarOptions = { position:'top', size:'compact', hidden:[viewId] };
const toolbarOptions: ToolbarOptions = { primary:true };
const toolbarControl: ToolbarControl = 'bottom';
const chromeFrame=createFrame({primaryViewBar:activityOptions,toolbar:toolbarOptions});
chromeFrame.toolbar.setVisible(toolbarControl,true);
chromeFrame.toolbar.setActionVisible('consumer.action',true);
chromeFrame.primaryViewBar.setVisible(viewId,false);
chromeFrame.primaryViewBar.setBadge(viewId,4);
chromeFrame.primaryViewBar.setBadgeVisible(viewId,false);
const consumerPosition:ViewBarPosition='bottom';
const consumerActivitySize:ViewBarSize='compact';
chromeFrame.primaryViewBar.setPosition(consumerPosition);
chromeFrame.primaryViewBar.setSize(consumerActivitySize);
chromeFrame.primaryViewBar.movePrimarySide('right');
const currentActivityPosition:ViewBarPosition=chromeFrame.primaryViewBar.position.value;
const currentActivitySize:ViewBarSize=chromeFrame.primaryViewBar.size.value;
void [currentActivityPosition,currentActivitySize];
// @ts-expect-error Position must be a supported literal.
chromeFrame.primaryViewBar.setPosition('floating');
// @ts-expect-error Activity size is independent of arbitrary CSS sizes.
chromeFrame.primaryViewBar.setSize('large');
chromeFrame.dispose();

const visibilityConsumer = createFrame();
const unregisterVisibility = visibilityConsumer.registerView({id:'visibility',label:'Visibility',children:[{id:'visibility.child',label:'Child',component:{render:()=>null},visible:false}]},'primary');
const childVisible:boolean = visibilityConsumer.isViewVisible('visibility.child');
visibilityConsumer.setViewVisible('visibility.child',!childVisible);
// @ts-expect-error Visibility takes a boolean, not a CSS display value.
visibilityConsumer.setViewVisible('visibility.child','none');
unregisterVisibility();visibilityConsumer.dispose();

const matchingSidebars = createFrame({primaryViewBar:{position:'top',display:'both'},secondaryViewBar:{position:'default',display:'icons'}});
matchingSidebars.primaryViewBar.setDisplay('text');
matchingSidebars.secondaryViewBar.setPosition('bottom');
matchingSidebars.secondaryViewBar.setDisplay('both');
matchingSidebars.closeSecondaryPanel();
// @ts-expect-error An activity display is a fixed presentation mode.
matchingSidebars.primaryViewBar.setDisplay('labels');
matchingSidebars.dispose();

// Quick pick is always searched; custom content uses the separate quick panel.
import { FrameQuickPick, FrameQuickPanel } from '@frame/core';
void h(FrameQuickPick,{items:[{id:'open',label:'Open workspace'}],title:'Choose command',position:'center',onAccept:(
  id:string
)=>{void id;},onClose:()=>{}},{item:({item}:{item:{label:string}})=>item.label});
void h(FrameQuickPanel,{title:'Workspace summary',position:'top',onClose:()=>{}},{default:()=>h('p','Workspace content'),'header-actions':()=>h(FrameButton,{label:'Done'})});

// Quick pick and extension command contributions use the public package declarations.
const quickInputFrame = createFrame();
// AI conversation state remains independent of its optional Frame presentation.
import { AIView, AIChatHistory, AIConversation, AIHistory, AIPrompt, createAIChatHistory, createAIChatView } from '@frame/core/modules/chat';
const conversationHistory = createAIChatHistory({ applicationId: 'consumer', createChat: () => createAIChat({ respond(
  _request,
  writer
) { writer.message('Ready'); } }) });
const removeAIView = quickInputFrame.secondarySidebar.register(createAIChatView({ id: 'consumer.ai', history: conversationHistory }));
void h(AIView, { history: conversationHistory });
void h(AIChatHistory, { history: conversationHistory });
void h(AIHistory, { history: conversationHistory, contextActions: () => [{id:'export',label:'Export'}] });
void h(AIPrompt, { modelValue: 'Hello', busy: false, onSubmit: (
  value: {text:string;attachments:import('@frame/core/modules/chat').ChatAttachment[]}
) => { void value.text; } });
void h(AIConversation, { chat: createAIChat({ respond() {} }) });
conversationHistory.rename('example', 'New name');
conversationHistory.pin('example'); conversationHistory.archive('example');
conversationHistory.setScope('all');
removeAIView(); conversationHistory.dispose();
quickInputFrame.registerCommand({ id: 'extension.preferences', label: 'Extension preferences', icon: 'settings-gear', scope: 'frame', shortcut: 'Ctrl+Shift+Y', quickInput: true, run() {} });
quickInputFrame.openQuickInput('application');
quickInputFrame.setQuickInputMode('frame');
quickInputFrame.openCommands();
const availableThemes: readonly FrameTheme[] = quickInputFrame.theme.available.value;
const removeQuickTheme: () => void = quickInputFrame.theme.register(authoredTheme);
void [availableThemes, removeQuickTheme];
quickInputFrame.dispose();
