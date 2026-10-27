import extractedReferences from './documentation/references.json';
import { CodeBlockTheme } from "../../../core/src/components/data-display/codeThemes";
const legacyDocs = {
  FrameMenuItem: { description: "A typed command-menu entry, shared by FrameMenu, ContextMenu, and the Manage menu. A menu item is either an action/submenu or a separator.", code: `import type { FrameMenuItem } from '@frame/core';
const items: FrameMenuItem[] = [
  { id: 'save', label: 'Save', command: 'app.save', shortcut: 'Ctrl+S' },
  { id: 'view', label: 'View', children: [{ id: 'outline', label: 'Outline' }] },
  { id: 'divider', type: 'separator' },
  { id: 'autosave', label: 'Autosave', checked: true },
];`, rows: [["id", "Required unique ID within this menu."], ["type", "Omit or use item for choices; separator for a non-selectable divider."], ["label", "Required text for a choice; separators do not use it."], ["command", "Optional registered command ID. The host handles selection/dispatch."], ["shortcut", "Optional display hint; does not install a shortcut."], ["children", "Nested FrameMenuItem[] submenu."], ["disabled", "Skips pointer/keyboard selection."], ["checked", "Optional checkbox state; application updates the value."], ["visibility", "Use the hover/focus visibility indicator."]] },
  SelectItem: { description: "A discriminated list entry: SelectOption for an actual value, or SelectSeparator for a divider. The bound value belongs to an option; separators can never be selected.", code: `import type { SelectItem, SelectOption, SelectSeparator } from '@frame/core';
const items: SelectItem[] = [
  { value: 'local', label: 'Local' },
  { type: 'separator', id: 'remote-group' },
  { value: 'remote', label: 'Remote', description: 'Optional explanation.' },
];`, rows: [["SelectOption.value", "Required string stored by v-model; unique among options."], ["SelectOption.label", "Required visible text."], ["description", "Optional footer explanation. Omit for a compact dropdown."], ["detail", "Optional secondary inline text."], ["disabled", "Optional; skipped by keyboard and pointer selection."], ["SelectSeparator.type", "The literal separator."], ["SelectSeparator.id", "Required stable unique key; separators have no value."]] },
  SettingDefinition: { description: "Metadata used by the settings system to assemble a form. Individual components such as FrameSlider and FrameTextArea do not require this object.", code: `import type { SettingDefinition } from '@frame/core';
const setting: SettingDefinition = {
  id: 'volume', label: 'Volume', type: 'range', default: 50, min: 0, max: 100,
  onChange: value => { preferences.volume = Number(value); },
};`, rows: [["id / label", "Unique setting identifier and visible label."], ["type", "text, textarea, number, checkbox, select, range, color."], ["default", "Initial/reset value: string, boolean, or number."], ["description / placeholder", "Optional supporting text."], ["options", "SelectItem[] for selects; may contain separators."], ["min / max / step", "Numeric control bounds and increment."], ["getValue / onChange", "Connect a reactive preference store and persistence."], ["disabled", "Disables edits."]] },
};

export interface TypeDocumentation { description: string; usage?: string; code: string; properties: { name: string; type: string; description: string; reference?: string }[] }
const types: Record<string, string[]> = {
  FrameMenuItem: ['string', '"item" | "separator"', 'string', 'string', 'string', 'readonly FrameMenuItem[]', 'boolean', 'boolean', 'boolean'],
  SettingDefinition: ['string', '"text" | "textarea" | "number" | "checkbox" | "select" | "range" | "color"', 'SettingValue', 'string', 'readonly SelectItem[]', 'number', '(() => SettingValue) / ((value: SettingValue) => void)', 'boolean'],
};
export const typeDocs: Record<string, TypeDocumentation> = Object.fromEntries(Object.entries(legacyDocs).filter((
  [name]
) => name !== 'SelectItem').map(([name, doc]) => [name, { ...doc, properties: doc.rows.map((
  [property, description],
  i
) => ({ name: property, description, type: types[name]?.[i] ?? 'string', reference: property === 'children' ? 'FrameMenuItem' : property === 'options' ? 'SelectItem' : property === 'default' || property === 'getValue / onChange' ? 'SettingValue' : undefined })) }]));
typeDocs.SelectItem = {
  description: 'The shared runtime base for SelectOption and SelectSeparator. In TypeScript, SelectItem is the union of these two concrete classes.',
  usage: 'Construct options and separators, then pass a SelectItem array to FrameSelect or SettingDefinition.options. Options hold values; separators only divide groups. Existing plain object inputs remain supported. Use the concrete subclasses rather than constructing the empty base directly.',
  code: `import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'local', label: 'Local' }),
  new SelectSeparator('remote-group'),
  new SelectOption({ value: 'remote', label: 'Remote', description: 'Sync online.' }),
];`,
  properties: [
    { name: 'option', type: 'SelectOption', reference: 'SelectOption', description: 'Value-bearing choice, optionally disabled.' },
    { name: 'separator', type: 'SelectSeparator', reference: 'SelectSeparator', description: 'Non-selectable group divider.' },
  ],
};
typeDocs.SelectOption = {
  description: 'A runtime class extending SelectItem. Represents a selectable value.',
  usage: 'Pass an object with value and label to the constructor. Optional metadata controls supporting text and availability. Each value should be unique in the list.',
  code: `import { SelectOption } from '@frame/core';
const option = new SelectOption({ value: 'remote', label: 'Remote', detail: 'Cloud', description: 'Sync online.', disabled: false });`,
  properties: [
    { name: 'value', type: 'string', description: 'Required value emitted by v-model when selected.' },
    { name: 'label', type: 'string', description: 'Required visible option text.' },
    { name: 'description', type: 'string | undefined', description: 'Optional explanation below the list for the active option.' },
    { name: 'detail', type: 'string | undefined', description: 'Optional secondary inline text.' },
    { name: 'disabled', type: 'boolean | undefined', description: 'When true, pointer selection and keyboard navigation skip this option.' },
  ],
};
typeDocs.SelectSeparator = {
  description: 'A runtime class extending SelectItem. Represents a non-selectable divider.',
  usage: 'Pass a stable unique group ID to the constructor. Separators have no value and cannot become the selected option.',
  code: `import { SelectSeparator } from '@frame/core';
const divider = new SelectSeparator('remote-group');`,
  properties: [
    { name: 'id', type: 'string', description: 'Stable unique key supplied to the constructor.' },
    { name: 'type', type: 'readonly "separator"', description: 'Automatically initialized discriminant used to skip selection.' },
  ],
};

Object.assign(typeDocs, {
  "QuickPickItem": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface QuickPickItem {\r\n  id: string;\r\n  label: string;\r\n  detail?: string;\r\n  shortcut?: string;\r\n  disabled?: boolean;\r\n}",
    "properties": [
      {
        "name": "id",
        "type": "string",
        "description": "Stable identifier used for registration, lookup, and disposal."
      },
      {
        "name": "label",
        "type": "string",
        "description": "Visible text shown in the corresponding control or view."
      },
      {
        "name": "detail",
        "type": "string | undefined",
        "description": "Secondary text shown alongside the picker label."
      },
      {
        "name": "shortcut",
        "type": "string | undefined",
        "description": "Displayed keyboard shortcut hint; does not register a shortcut."
      },
      {
        "name": "disabled",
        "type": "boolean | undefined",
        "description": "Prevents activation or editing when true."
      }
    ]
  },
  "QuickPickOptions": {
    "description": "Options for the always-searchable frame.showQuickPick service.",
    "usage": "Supply title and search placeholder. Custom content belongs in FrameQuickPanel rather than a non-searchable picker.",
    "code": "export interface QuickPickOptions {\r\n  title?: string;\r\n  placeholder?: string;\r\n}",
    "properties": [
      {
        "name": "title",
        "type": "string | undefined",
        "description": "Visible heading for the dialog, category, or picker."
      },
      {
        "name": "placeholder",
        "type": "string | undefined",
        "description": "Prompt shown in the empty picker search field."
      }
    ]
  },
  "PanelDefinition": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface PanelDefinition {\r\n  id: string;\r\n  label: string;\r\n  icon?: Component;\r\n  actions?: readonly PanelAction[];\r\n  padded?: boolean;\r\n  draggable?: boolean;\r\n  movable?: boolean;\r\n  collapsed?: boolean;\r\n  component?: Component;\r\n  children?: readonly PanelDefinition[];\r\n  props?: Record<string, unknown>;\r\n}",
    "properties": [
      {
        "name": "id",
        "type": "string",
        "description": "Stable identifier used for registration, lookup, and disposal."
      },
      {
        "name": "label",
        "type": "string",
        "description": "Visible text shown in the corresponding control or view."
      },
      {
        "name": "icon",
        "type": "Component | undefined",
        "description": "Optional Vue component rendered as the contribution icon."
      },
      {
        "name": "actions",
        "type": "readonly PanelAction[] | undefined",
        "description": "Header actions displayed for this contribution.",
        "reference": "PanelAction"
      },
      {
        "name": "padded",
        "type": "boolean | undefined",
        "description": "Controls internal view-content padding."
      },
      {
        "name": "draggable",
        "type": "boolean | undefined",
        "description": "Allows dragging this view when shell interaction policies also allow it."
      },
      {
        "name": "movable",
        "type": "boolean | undefined",
        "description": "Allows moving this view between regions or collections."
      },
      {
        "name": "collapsed",
        "type": "boolean | undefined",
        "description": "Initial collapsed state for a section in a view collection."
      },
      {
        "name": "component",
        "type": "Component | undefined",
        "description": "Vue component rendered as the custom content."
      },
      {
        "name": "children",
        "type": "readonly PanelDefinition[] | undefined",
        "description": "Nested definitions shown as child categories or view sections."
      },
      {
        "name": "props",
        "type": "Record<string, unknown> | undefined",
        "description": "Values passed as props to the content component."
      }
    ]
  },
  "PanelAction": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface PanelAction { id: string; label: string; icon?: Component; run: () => void; disabled?: boolean }",
    "properties": [
      {
        "name": "id",
        "type": "string",
        "description": "Stable identifier used for registration, lookup, and disposal."
      },
      {
        "name": "label",
        "type": "string",
        "description": "Visible text shown in the corresponding control or view."
      },
      {
        "name": "icon",
        "type": "Component | undefined",
        "description": "Optional Vue component rendered as the contribution icon."
      },
      {
        "name": "run",
        "type": "() => void",
        "description": "Callback invoked when the user activates the action."
      },
      {
        "name": "disabled",
        "type": "boolean | undefined",
        "description": "Prevents activation or editing when true."
      }
    ]
  },
  "WorkspacePaneContent": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface WorkspacePaneContent {\r\n  label: string;\r\n  component?: Component;\r\n  props?: Record<string, unknown>;\r\n}",
    "properties": [
      {
        "name": "label",
        "type": "string",
        "description": "Visible text shown in the corresponding control or view."
      },
      {
        "name": "component",
        "type": "Component | undefined",
        "description": "Vue component rendered as the custom content."
      },
      {
        "name": "props",
        "type": "Record<string, unknown> | undefined",
        "description": "Values passed as props to the content component."
      }
    ]
  },
  "WorkspaceSplitDirection": {
    "description": "Public value type exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export type WorkspaceSplitDirection = \"left\" | \"right\" | \"up\" | \"down\";",
    "properties": [
      {
        "name": "value",
        "type": "\"left\" | \"right\" | \"up\" | \"down\"",
        "description": "Supported literal values for this contract."
      }
    ]
  },
  "ModalDefinition": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface ModalDefinition {\r\n  id: string;\r\n  title: string;\r\n  component: Component;\r\n  props?: Record<string, unknown>;\r\n  icon?: Component;\r\n  actions?: readonly PanelAction[];\r\n  width?: number;\r\n  height?: number;\r\n  maximized?: boolean;\r\n}",
    "properties": [
      {
        "name": "id",
        "type": "string",
        "description": "Stable identifier used for registration, lookup, and disposal."
      },
      {
        "name": "title",
        "type": "string",
        "description": "Visible heading for the dialog, category, or picker."
      },
      {
        "name": "component",
        "type": "Component",
        "description": "Vue component rendered as the custom content."
      },
      {
        "name": "props",
        "type": "Record<string, unknown> | undefined",
        "description": "Values passed as props to the content component."
      },
      {
        "name": "icon",
        "type": "Component | undefined",
        "description": "Optional Vue component rendered as the contribution icon."
      },
      {
        "name": "actions",
        "type": "readonly PanelAction[] | undefined",
        "description": "Header actions displayed for this contribution.",
        "reference": "PanelAction"
      },
      {
        "name": "width",
        "type": "number | undefined",
        "description": "Initial dialog width in pixels; constrained to the available workbench."
      },
      {
        "name": "height",
        "type": "number | undefined",
        "description": "Initial dialog height in pixels; constrained to the available workbench."
      },
      {
        "name": "maximized",
        "type": "boolean | undefined",
        "description": "Open the dialog maximized within the workbench."
      }
    ]
  },
  "SettingValue": {
    "description": "Public value type exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export type SettingValue = string | number | boolean;",
    "properties": [
      {
        "name": "value",
        "type": "string | number | boolean",
        "description": "Supported literal values for this contract."
      }
    ]
  },
  "SettingsSection": {
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface SettingsSection { id: string; title: string; description?: string; settings?: readonly SettingDefinition[]; children?: readonly SettingsSection[] }",
    "properties": [
      {
        "name": "id",
        "type": "string",
        "description": "Stable identifier used for registration, lookup, and disposal."
      },
      {
        "name": "title",
        "type": "string",
        "description": "Visible heading for the dialog, category, or picker."
      },
      {
        "name": "description",
        "type": "string | undefined",
        "description": "Supporting explanatory text displayed beneath the heading."
      },
      {
        "name": "settings",
        "type": "readonly SettingDefinition[] | undefined",
        "description": "Settings definitions rendered in this category.",
        "reference": "SettingDefinition"
      },
      {
        "name": "children",
        "type": "readonly SettingsSection[] | undefined",
        "description": "Nested definitions shown as child categories or view sections."
      }
    ]
  }
});

typeDocs.NotificationAction = {
  description: 'An optional labeled application action displayed inside a notification.',
  usage: 'Pass this object as NotificationOptions.action. Frame prevents repeated clicks while running, pauses expiry, and closes the notification after success. The host owns the callback.',
  code: `frame.notify({ title: 'Review requested', action: { label: 'Open settings', run: () => frame.openSettings() } });`,
  properties: [
    { name: 'label', type: 'string', description: 'Visible action-button text.' },
    { name: 'run', type: '() => void | Promise<void>', description: 'Runs on activation. A thrown error or rejected promise displays an error notification.' },
  ],
};

typeDocs.NotificationHistory = {
  description: 'An optional in-memory store from @frame/core/modules/notifications. It retains notification events independently of core notification expiry.',
  usage: 'Create the store before emitting notifications. Mount NotificationPanel and NotificationIndicator with the same store. Dispose it on host unmount to unsubscribe. This store is not part of @frame/core.',
  code: `import { createNotificationHistory } from '@frame/core/modules/notifications';
const history = createNotificationHistory(frame, { limit: 200 });
history.toggle();
// onBeforeUnmount(() => history.dispose());`,
  properties: [
    { name: 'state.open', type: 'boolean', description: 'Controls the optional history panel visibility.' },
    { name: 'state.items', type: 'HistoryNotification[]', description: 'Newest-first history entries with independent numeric historyId keys and expanded state; bounded by limit.' },
    { name: 'toggle', type: '() => void', description: 'Toggles panel visibility.' },
    { name: 'dismiss', type: '(historyId: number) => void', description: 'Removes one history entry without dismissing an active core notification.' },
    { name: 'clear', type: '() => void', description: 'Clears history without changing active notifications.' },
    { name: 'dispose', type: '() => void', description: 'Unsubscribes, clears history, and closes its panel.' },
  ],
};

typeDocs.CodeBlockTheme = {
  description: 'Runtime enum containing every theme bundled with the installed Shiki version.',
  usage: 'Import the enum from core and pass a member to FrameCodeBlock. codeBlockThemeOptions supplies labels and light/dark metadata for a theme selector. Theme modules load only when selected.',
  code: "import { CodeBlockTheme } from '@frame/core';\nconst theme = CodeBlockTheme.DarkPlus;",
  properties: Object.entries(CodeBlockTheme).map(([name, value]) => ({ name: `CodeBlockTheme.${name}`, type: JSON.stringify(value), description: 'Available syntax highlighting theme.' })),
};
typeDocs.FrameOptions = {
  description: 'Optional built-in features chosen when creating an isolated Frame instance.',
  code: 'const frame = createFrame({ navigation: true, settings: true, notifications: true });',
  properties: [
    { name: 'navigation', type: 'boolean', description: 'Enable page/view navigation history and the Back/Forward arrows. Default false.' },
    { name: 'settings', type: 'boolean', description: 'Enable built-in Settings UI. Default true.' },
    { name: 'notifications', type: 'boolean', description: 'Enable transient notifications. Default true.' },
    { name: 'toolbar', type: 'ToolbarOptions', reference: 'ToolbarOptions', description: 'Initial title-bar control visibility; runtime changes use frame.toolbar.' },
    { name: 'primaryViewBar', type: 'PrimaryViewBarOptions', reference: 'PrimaryViewBarOptions', description: 'Initial view-bar position, size, hidden items and badges; runtime changes use frame.primaryViewBar.' },
    { name: 'secondaryViewBar', type: 'SecondaryViewBarOptions', reference:'SecondaryViewBarOptions', description:'Initial secondary view-bar display, size, position, and item visibility.' },
    { name: 'panelViewBar', type: 'PanelViewBarOptions', reference:'PanelViewBarOptions', description:'Panel view-item presentation, independent of its container.' },
    { name: 'navigationBar', type: 'boolean | NavigationBarOptions', reference:'NavigationBarOptions', description:'Optional navigation-only bar; supports all four docking edges.' },
    { name: 'status', type: 'StatusOptions', reference: 'StatusOptions', description: 'Initial status text, bar visibility, hidden items and hidden badges; runtime changes use frame.status.' },
  ],
};

typeDocs.StatusOptions = {
  description: 'Initial presentation for the three-section status bar owned by a Frame instance.',
  code: "const frame = createFrame({ status: { message: 'Ready', visible: true, hidden: ['app.version'], hiddenBadges: [] } });",
  properties: [
    { name: 'message', type: 'string', description: 'Initial persistent center text. Defaults to Ready.' },
    { name: 'visible', type: 'boolean', description: 'Initial status-bar visibility. Defaults to true.' },
    { name: 'hidden', type: 'readonly string[]', description: 'Ids whose item presentation starts hidden.' },
    { name: 'hiddenBadges', type: 'readonly string[]', description: 'Ids whose badges start hidden.' },
  ],
};
typeDocs.StatusController = {
  description: 'Frame-owned text/button registration, side placement and centered application status.',
  code: "frame.status.register({ id: 'app.save', kind: 'button', label: 'Save', text: 'Save', side: 'right', run: save });\nframe.status.set('Saving document');\nframe.status.show('Could not save', { severity: 'error', duration: 4000 });",
  properties: [
    { name: 'register', type: '(item: StatusItemDefinition) => () => void', description: 'Register a text or button item and return an idempotent disposer.' },
    { name: 'update', type: '(id: string, patch: StatusItemUpdate) => boolean', description: 'Update an item; getter-backed values remain owned by their source.' },
    { name: 'move', type: '(id: string, side: "left" | "right") => boolean', description: 'Move a side item without replacing its registration.' },
    { name: 'setVisible / setBadgeVisible', type: '(id: string, visible: boolean) => boolean', description: 'Control item and badge presentation independently.' },
    { name: 'set', type: '(text: string) => void', description: 'Update the persistent center status.' },
    { name: 'show', type: '(text: string, options?: StatusMessageOptions) => () => void', description: 'Show temporary status text. Defaults to 4000 ms, then restores the persistent status.' },
    { name: 'clear', type: '() => void', description: 'Clear persistent and temporary status text.' },
    { name: 'setBarVisible', type: '(visible: boolean) => boolean', description: 'Show or hide the entire status bar through its existing layout state.' },
  ],
};

for (const [name, description, code] of [
  ['DateValue', 'Calendar-aware date model used by calendar, date, month and year controls.', "import { CalendarDate, type DateValue } from '@frame/core';\nconst date: DateValue = new CalendarDate(2026, 10, 21);"],
  ['DateRange', 'Start and end date values used by range calendars, fields and pickers.', "import { CalendarDate, type DateRange } from '@frame/core';\nconst range: DateRange = { start: new CalendarDate(2026, 10, 21), end: new CalendarDate(2026, 10, 26) };"],
  ['TimeValue', 'Structured time model used by the time field; it is not a formatted display string.', "import { Time, type TimeValue } from '@frame/core';\nconst time: TimeValue = new Time(9, 30);"],
  ['TimeRange', 'Start and end time values controlled by the application.', "import { Time, type TimeRange } from '@frame/core';\nconst range: TimeRange = { start: new Time(9, 30), end: new Time(17) };"],
]) {
  const range = name!.endsWith('Range');
  const valueType = name!.replace('Range', 'Value');
  typeDocs[name!] = {
    description: description!, code: code!,
    usage: 'Import the model type and its constructors or parsers from @frame/core. The application chooses its storage format, locale and time zone.',
    properties: range
      ? ['start', 'end'].map(property => ({ name: property, type: `${valueType} | undefined`, reference: valueType, description: 'A structured value, or undefined while this end of the range is incomplete.' }))
      : (name === 'DateValue' ? ['year', 'month', 'day'] : ['hour', 'minute', 'second']).map(property => ({ name: property, type: 'number', description: 'A numeric part of the structured calendar or time value. Use exported constructors and parsers to create values.' })),
  };
}

for(const [name,doc] of Object.entries(extractedReferences)) if(!Object.prototype.hasOwnProperty.call(typeDocs,name)) typeDocs[name]=doc;

typeDocs.ToolbarOptions = {
 description: 'Initial visibility of instance-owned title-bar controls.',
 code: "const frame = createFrame({ toolbar: { primary: true, commandCenter: false } });\nframe.toolbar.setVisible('bottom', true);",
 properties: ['customize','primary','bottom','secondary','commandCenter','layoutControls'].map(name=>({name,type:'boolean',description:'Whether this title-bar control is rendered; hiding it does not disable its command.'})),
};
typeDocs.PrimaryViewBarOptions = {
 description: 'Initial view-bar presentation and contribution visibility, scoped to the Frame instance.',
 code: "const frame = createFrame({ primaryViewBar: { position: 'top', size: 'compact' } });\nframe.primaryViewBar.setPosition('bottom');\nframe.primaryViewBar.setSize('default');\nframe.primaryViewBar.movePrimarySide('right');",
 properties: [{name:'allowAddSeparator',type:'boolean',description:'Opt-in user separator creation; defaults to false.'},
  {name:'position',type:'ViewBarPosition',reference:'ViewBarPosition',description:'Initial placement or hidden state; defaults to default.'},
  {name:'size',type:'ViewBarSize',reference:'ViewBarSize',description:'Initial item size; defaults to default. Independent of position and shell density.'},
  ...['hidden','hiddenBadges'].map(name=>({name,type:"readonly string[]",description:'Contributions whose view item or badge begins hidden.'})),
 ],
};
typeDocs.ViewBarPosition = {
 description: 'View-bar placement or visibility selected through options or frame.primaryViewBar.setPosition.',
 code: "import type { ViewBarPosition } from '@frame/core';\nconst position: ViewBarPosition = 'top';\nframe.primaryViewBar.setPosition(position);",
 properties: [
  {name:'default',type:'literal',description:'Normal view bar placement.'},
  {name:'top / bottom',type:'literal',description:'Horizontal view-bar placement.'},
  {name:'hidden',type:'literal',description:'Hide through layout.primaryViewBarVisible while retaining the last visible position.'},
 ],
};
typeDocs.ViewBarSize = {
 description: 'View item size, independent of view-bar placement and overall shell density.',
 code: "import type { ViewBarSize } from '@frame/core';\nconst size: ViewBarSize = 'compact';\nframe.primaryViewBar.setSize(size);",
 properties: [{name:'default / compact',type:'literal',description:'Normal or compact view item sizing.'}],
};
typeDocs.PrimaryViewBarController = {
 description: 'Per-instance view-bar presentation, visibility, and badge controls.',
 code: "frame.primaryViewBar.setPosition('top');\nframe.primaryViewBar.setSize('compact');\nframe.primaryViewBar.movePrimarySide('right');\nconst position = frame.primaryViewBar.position.value;",
 properties: [
  {name:'position / size',type:'ComputedRef<ViewBarPosition> / ComputedRef<ViewBarSize>',description:'Reactive current presentation. Read .value in script.'},
  {name:'setPosition',type:'(position: ViewBarPosition) => boolean',reference:'ViewBarPosition',description:'Change placement or hide; non-hidden positions show the bar.'},
  {name:'setSize',type:'(size: ViewBarSize) => boolean',reference:'ViewBarSize',description:'Change only view item size.'},
  {name:'movePrimarySide',type:"(side: 'left' | 'right') => boolean",description:'Move the primary sidebar and view-bar presentation together.'},
  {name:'setVisible / setBadgeVisible / setBadge',type:'methods',description:'Control registered contributions by their view/action key; hiding does not dispose content.'},
 ],
};


typeDocs.NavigationItem = {
 description:'A navigation-only union: action, link, dropdown, or separator. Navigation items never own sidebar/panel content.',
 code:"frame.registerNavigationItem({ id: 'home', type: 'link', label: 'Home', href: '#/home' });",
 properties:[{name:'type',type:"'action' | 'link' | 'dropdown' | 'separator'",description:'Explicit behavior discriminator.'},{name:'id',type:'string',description:'Unique throughout one navigation tree; separate from view ids.'},{name:'run',type:'() => void | Promise<void>',description:'Required only for an action.'},{name:'href / onNavigate',type:'string / optional callback',description:'A link destination and optional host router integration.'},{name:'items',type:'readonly NavigationItem[]',description:'Required for dropdowns; nested dropdowns are supported.'}],
};
typeDocs.NavigationBarOptions = {
 description:'Initial optional navigation-bar presentation and docking.',
 code:"const frame = createFrame({ navigationBar: { position: 'left', display: 'both', size: 'compact' } });",
 properties:[{name:'allowAddSeparator',type:'boolean',description:'Opt-in user separator creation; defaults to false.'},{name:'collapsed',type:'boolean',description:'Independent collapsed state for vertical icons-and-text navigation; defaults false.'},{name:'position',type:"'top' | 'bottom' | 'left' | 'right'",description:'Dock outside the entire workbench body; defaults to top.'},{name:'visible',type:'boolean',description:'An options object shows the bar unless false.'},{name:'display',type:"'icons' | 'text' | 'both'",description:'Works in every docking orientation.'},{name:'justification',type:"'left' | 'center' | 'right'",description:'Side-docked item alignment; defaults to left on either side. Also controlled by setJustification.'},{name:'size',type:"'default' | 'compact'",description:'Independent of overall shell density.'},{name:'hidden / hiddenBadges',type:'readonly string[]',description:'Initial navigation-item presentation preferences.'}],
};
typeDocs.PanelViewBarOptions = {
 description:'Presentation of panel view items, separate from panel docking/alignment.',
 code:"const frame = createFrame({ panelViewBar: { visible: true, size: 'compact', display: 'both' } });",
 properties:[{name:'allowAddSeparator',type:'boolean',description:'Opt-in user separator creation; defaults to false.'},{name:'visible',type:'boolean',description:'Hides only the selector when false; retains panel content.'},{name:'size',type:"'default' | 'compact'",description:'Panel view-bar item size.'},{name:'display',type:"'icons' | 'text' | 'both'",description:'Panel view-item display.'},{name:'hidden / hiddenBadges',type:'readonly string[]',description:'Initial view-item or badge visibility.'}],
};
typeDocs.SecondaryViewBarOptions = {
 description:'Initial secondary sidebar view-bar presentation and item preferences.',
 code:"const frame = createFrame({ secondaryViewBar: { position: 'top', display: 'both', size: 'default' } });",
 properties:[{name:'allowAddSeparator',type:'boolean',description:'Opt-in user separator creation; defaults to false.'},{name:'position',type:'ViewBarPosition',reference:'ViewBarPosition',description:'Defaults to top; default follows the outer sidebar edge.'},{name:'display',type:"'icons' | 'text' | 'both'",description:'Available in vertical and horizontal placements.'},{name:'size',type:'ViewBarSize',reference:'ViewBarSize',description:'Independent default or compact item sizing.'},{name:'hidden / hiddenBadges',type:'readonly string[]',description:'Initial secondary-view or badge visibility.'}],
};
