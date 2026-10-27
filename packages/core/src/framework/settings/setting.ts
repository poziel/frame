import type {SelectItem} from '../../components/forms/shared/selectItem';
import type {Component} from 'vue';

import type {SettingsCopyFormat} from './settingsTypes';

/** Scalar value supported by settings validation and override persistence. */
export type SettingValue = string | number | boolean;

/** Host-supplied field metadata, validation constraints, and domain value callbacks. */
export interface SettingDefinition {

  /** Hide this persisted field from the settings form, while keeping it editable in JSON. */
  visible?: boolean;

  /** Exclude a contextual form control from the application preferences file. */
  persist?: boolean;

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Explanatory text displayed alongside the entry. */
  description?: string;

  /** Kind of control or structural row represented by this definition. */
  type:
    'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'range' | 'color';

  /** Value restored when this field is reset. */
  default: SettingValue;

  /** Hint displayed when the input or search field is empty. */
  placeholder?: string;

  /** Minimum accepted numeric value. */
  min?: number;

  /** Maximum accepted numeric value. */
  max?: number;

  /** Increment supplied to the numeric or range control. */
  step?: number;

  /** Selectable values and structural separator rows offered by the control. */
  options?: readonly SelectItem[];

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;

  /** Reads the effective value from host-owned domain state. */
  getValue?: () => SettingValue;

  /** Receives validated edits before controller fallback values are updated. */
  onChange?: (value: SettingValue) => void;

  /** Custom control, including a FieldGroup. Frame retains the label, description and row actions. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}

/** Props supplied to a setting's custom component. Emit update:modelValue to use Frame validation and persistence. */
export interface SettingComponentProps {

  /** Field definition whose metadata and validation remain owned by Frame. */
  setting: SettingDefinition;

  /** Current effective scalar value displayed by the custom control. */
  modelValue: SettingValue;

  /** Stable input identity used by labels and accessible descriptions. */
  inputId: string;

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;
}

/** Controller operations scoped to one exact field registration. */
export interface SettingAccess {

  /** Reads the effective host or fallback value. */
  read(): SettingValue;

  /** Applies a validated edit through the controller's persistence path. */
  set(value: SettingValue): boolean;

  /** Copies the effective value or field identity through host integration. */
  copy(format: SettingsCopyFormat): Promise<void>;

  /** Reports whether this exact definition still belongs to its controller. */
  active(): boolean;
}

/**
 * Live handle for one registered setting, including host-owned values.
 *
 * Retained handles become inactive on unregister or disposal. They cannot edit
 * a later registration that happens to reuse the same ID.
 *
 * @example
 * ```ts
 * const size = frame.settings.get('editor.fontSize');
 * size?.set(18);
 * size?.reset();
 * ```
 */
export class Setting {

  /** Host definition describing the field and its default value. */
  readonly definition: SettingDefinition;

  /** Registration-scoped operations supplied by the owning controller. */
  private readonly access: SettingAccess;

  /** Connects a field definition to its exact registration lifecycle. */
  constructor(definition: SettingDefinition, access: SettingAccess) {
    this.definition = definition;
    this.access = access;
  }

  /** Stable field identifier within the owning settings controller. */
  get id(): string {
    return this.definition.id;
  }

  /** Whether this handle can still operate on its original registration. */
  get active(): boolean {
    return this.access.active();
  }

  /** Effective value, or undefined after this registration has ended. */
  get value(): SettingValue | undefined {
    return this.active ? this.access.read() : undefined;
  }

  /** Whether the effective value differs from the registered default. */
  get modified(): boolean {
    return this.active && this.value !== this.definition.default;
  }

  /** Applies an edit using the same validation and persistence as the form. */
  set(value: SettingValue): boolean {
    return this.active && this.access.set(value);
  }

  /** Restores the default through the normal validated edit path. */
  reset(): boolean {
    return this.set(this.definition.default);
  }

  /** Copies this field, rejecting stale handles rather than targeting a replacement. */
  async copy(format: SettingsCopyFormat): Promise<void> {
    if (!this.active) throw new Error(`Inactive setting: ${this.id}`);
    await this.access.copy(format);
  }
}
