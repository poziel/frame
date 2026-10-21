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
export const typeDocs: Record<string, TypeDocumentation> = Object.fromEntries(Object.entries(legacyDocs).filter(([name]) => name !== 'SelectItem').map(([name, doc]) => [name, { ...doc, properties: doc.rows.map(([property, description], i) => ({ name: property, description, type: types[name]?.[i] ?? 'string', reference: property === 'children' ? 'FrameMenuItem' : property === 'options' ? 'SelectItem' : property === 'default' || property === 'getValue / onChange' ? 'SettingValue' : undefined })) }]));
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
    "description": "Public object contract exported by @frame/core.",
    "usage": "Use this contract when calling the corresponding Frame API. Optional fields may be omitted.",
    "code": "export interface QuickPickOptions {\r\n  searchable?: boolean;\r\n  title?: string;\r\n  placeholder?: string;\r\n}",
    "properties": [
      {
        "name": "searchable",
        "type": "boolean | undefined",
        "description": "Enables text filtering for this picker."
      },
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
