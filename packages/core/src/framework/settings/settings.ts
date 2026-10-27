import type {Component} from 'vue';
import {Setting} from './setting';
import {PreferencePage} from '../preferences/preferencePage';
import {isSelectOption} from '../../components/forms/shared/select';
import {
  computed,
  effectScope,
  reactive,
  shallowReactive,
  shallowRef,
  watch,
  nextTick,
  type ShallowRef,
  type WatchStopHandle,
} from 'vue';
import type {SettingDefinition, SettingValue} from './setting';
import type {SettingsOptions, SettingsCopyFormat} from './settingsTypes';

/** Registered settings section with optional fields, nested sections, or custom content. */
export interface SettingsSection {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Explanatory text displayed alongside the entry. */
  description?: string;

  /** Field definitions registered within this section. */
  settings?: readonly SettingDefinition[];

  /** Nested definitions rendered and registered beneath this entry. */
  children?: readonly SettingsSection[];

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}

/**
 * Owns one Frame's settings registrations, values, persistence, and editor state.
 *
 * Host callbacks retain ownership of domain values and file access. This class
 * coordinates validation and lifecycle; PreferencePage owns the shared draft.
 * Public callbacks remain bound when passed to registration or lifecycle APIs.
 *
 * @example
 * ```ts
 * const settings = frame.settings;
 * const size = settings.get('editor.fontSize');
 * size?.set(18);
 * await settings.flush();
 * ```
 */
export class Settings {

  /** Detached scope keeps settings observers owned by this controller. */
  private readonly scope = effectScope(true);

  /** Explicit host integration; construction does not read storage. */
  private readonly options: SettingsOptions;

  /** Reactive root sections presented by the settings form. */
  readonly sections = shallowReactive<SettingsSection[]>([]);

  /** Reactive fallback values for registered fields without host-owned storage. */
  readonly values = reactive<Record<string, SettingValue>>(Object.create(null));

  /** Field definitions indexed for constant-time lookup and validation. */
  private readonly definitions = shallowReactive(
    new Map<string, SettingDefinition>()
  );

  /** Stable item handles indexed by their registered field IDs. */
  private readonly handles = shallowReactive(new Map<string, Setting>());

  /** Section identities used to reject duplicate registrations. */
  private readonly sectionIds = new Set<string>();

  /** Prevents registration and persistence after this controller ends. */
  private disposed = false;

  /** Selected section shared by modal and tab presentations. */
  readonly selected = shallowRef('');

  /** Most recent storage failure, exposed to the host and settings surface. */
  readonly error = shallowRef('');

  /** Persisted overrides, including values for contributions not yet registered. */
  private readonly stored = reactive<Record<string, SettingValue>>(
    Object.create(null)
  );

  /** Whether storage hydration has completed successfully. */
  readonly loaded: ShallowRef<boolean>;

  /** Shared hydration request; failed reads may be retried. */
  private loading: Promise<void> | undefined = undefined;

  /** Serialized storage writes, preserving edit order. */
  private writes = Promise.resolve();

  /** Records whole-document replacement so a late load cannot restore old values. */
  private replaced = false;

  /** Fields edited locally while initial storage hydration is pending. */
  private readonly touched = new Set<string>();

  /** Releases automatic persistence observation on disposal. */
  private readonly stopSaving: WatchStopHandle;

  /** Cached depth-first section projection, recomputed when the tree changes. */
  readonly allSections = computed(() => {
    const result: SettingsSection[] = [];
    const visit = (items: readonly SettingsSection[]) => {
      for (const item of items) {
        result.push(item);
        visit(item.children ?? []);
      }
    };
    visit(this.sections);
    return result;
  });

  /** Shared preference draft, editor, and presentation content lifecycle. */
  readonly page: PreferencePage;

  /** Creates isolated settings state and its owned persistence observer. */
  constructor(options: SettingsOptions = {}) {
    this.options = options;
    this.get = this.get.bind(this);
    this.read = this.read.bind(this);
    this.isModified = this.isModified.bind(this);
    this.getOverrides = this.getOverrides.bind(this);
    this.toJSON = this.toJSON.bind(this);
    this.applyJSON = this.applyJSON.bind(this);
    this.load = this.load.bind(this);
    this.flush = this.flush.bind(this);
    this.reveal = this.reveal.bind(this);
    this.settingUrl = this.settingUrl.bind(this);
    this.copy = this.copy.bind(this);
    this.register = this.register.bind(this);
    this.set = this.set.bind(this);
    this.reset = this.reset.bind(this);
    this.dispose = this.dispose.bind(this);
    this.loaded = shallowRef(!this.options.storage);
    this.stopSaving = this.scope.run(() =>
      watch(
        () => (this.loaded.value ? this.toJSON() : undefined),
        (json) => {
          if (json !== undefined) this.queueWrite(json);
        },
        {flush: 'post'}
      )
    )!;
    this.page = this.scope.run(
      () =>
        new PreferencePage(
          {
            toJSON: this.toJSON,
            applyJSON: this.applyJSON,
            flush: this.flush,
            load: this.load,
          },
          'Settings'
        )
    )!;
  }

  /** Returns the stable handle for a registered field without creating state. */
  get(id: string): Setting | undefined {
    return this.handles.get(id);
  }

  /** Updates a field by delegating to its registration-owned handle. */
  set(id: string, value: SettingValue): boolean {
    return this.get(id)?.set(value) ?? false;
  }

  /** Reads the effective value, preferring the host getter over fallback storage. */
  read(id: string) {
    const field = this.definitions.get(id);
    return field?.getValue?.() ?? this.values[id] ?? field?.default;
  }

  /** Reports whether a registered field differs from its declared default. */
  isModified(id: string) {
    return this.get(id)?.modified ?? false;
  }

  /** Collects non-default persisted values while retaining unknown plugin keys. */
  getOverrides(): Record<string, SettingValue> {
    const result: Record<string, SettingValue> = Object.assign(
      Object.create(null),
      this.stored
    );
    for (const [id, field] of this.definitions) {
      if (field.persist === false) {
        delete result[id];
        continue;
      }
      const value = this.read(id);
      if (value !== field.default) result[id] = value;
      else delete result[id];
    }
    return result;
  }

  /** Serializes sorted overrides without including contextual or default values. */
  toJSON(): string {
    const overrides = this.getOverrides();
    return JSON.stringify(overrides, Object.keys(overrides).sort(), 2) + '\n';
  }

  /** Replaces persisted overrides atomically with respect to validation. */
  applyJSON(json: string) {
    if (this.disposed) throw new Error('Settings are disposed');
    const parsed = this.parseJSON(json);
    // Validate every known field before applying any changes, including resets.
    for (const [id, field] of this.definitions) {
      if (field.persist === false) continue;
      const value = Object.prototype.hasOwnProperty.call(parsed, id)
        ? parsed[id]
        : field.default;
      if (
        (!this.valid(field, value) || field.disabled) &&
        value !== this.read(id)
      )
        throw new Error(`Invalid or disabled setting: ${id}`);
    }
    this.replaced = true;
    for (const [id, field] of this.definitions) {
      if (field.persist === false) continue;
      const value = Object.prototype.hasOwnProperty.call(parsed, id)
        ? parsed[id]
        : field.default;
      if (value !== this.read(id)) {
        field.onChange?.(value);
        this.values[id] = value;
      }
      this.touched.add(id);
    }
    Object.keys(this.stored).forEach((id) => delete this.stored[id]);
    Object.assign(this.stored, parsed);
  }

  /** Hydrates registered values once, preserving edits made while reading storage. */
  load(): Promise<void> {
    if (this.loading) return this.loading;
    if (!this.options.storage || this.disposed) return Promise.resolve();
    this.loading = (async () => {
      try {
        const json = await this.options.storage!.read();
        if (this.disposed) return;
        const parsed =
          json === undefined || this.replaced ? {} : this.parseJSON(json);
        for (const [id, value] of Object.entries(parsed)) {
          if (this.touched.has(id)) continue;
          const field = this.definitions.get(id);
          if (field && value !== this.read(id)) {
            field.onChange?.(value);
            this.values[id] = value;
          }
          this.stored[id] = value;
        }
        this.loaded.value = true;
        this.error.value = '';
      } catch (cause) {
        this.loading = undefined;
        if (!this.disposed)
          this.error.value = String(
            cause instanceof Error ? cause.message : cause
          );
        throw cause;
      }
    })();
    return this.loading;
  }

  /** Waits for hydration and scheduled writes, retrying the latest failed write. */
  async flush() {
    await this.load();
    await nextTick();
    try {
      await this.writes;
    } catch {
      this.queueWrite(this.toJSON());
      await this.writes;
    }
  }

  /** Selects the section containing a field or the section with the supplied ID. */
  reveal(id: string) {
    const section = this.allSections.value.find(
      (item) =>
        item.id === id || item.settings?.some((field) => field.id === id)
    );
    if (!section) return false;
    this.selected.value = section.id;
    return true;
  }

  /** Builds a host-provided or browser-compatible link to one setting. */
  settingUrl(id: string) {
    if (this.options.url) return this.options.url(id);
    const url = new URL(
      typeof location === 'undefined' ? 'https://localhost/' : location.href
    );
    url.hash = `frame-setting=${encodeURIComponent(id)}`;
    return url.toString();
  }

  /** Copies a field ID, effective JSON value, or deep link through host clipboard access. */
  async copy(id: string, format: SettingsCopyFormat) {
    if (!this.definitions.has(id) || this.disposed)
      throw new Error(`Unknown setting: ${id}`);
    const text =
      format === 'id'
        ? id
        : format === 'json'
          ? JSON.stringify({[id]: this.read(id)}, null, 2)
          : this.settingUrl(id);
    if (this.options.writeClipboard) await this.options.writeClipboard(text);
    else await navigator.clipboard.writeText(text);
  }

  /** Registers a section tree and returns cleanup for that exact registration. */
  register(section: SettingsSection, parentId?: string) {
    if (this.disposed) throw new Error('Settings are disposed');
    const parent = parentId
      ? this.allSections.value.find((item) => item.id === parentId)
      : undefined;
    if (parentId && !parent)
      throw new Error('Unknown settings parent: ' + parentId);
    const ids: string[] = [],
      fields: SettingDefinition[] = [];
    const visit = (item: SettingsSection) => {
      if (this.sectionIds.has(item.id) || ids.includes(item.id))
        throw new Error(`Duplicate settings section: ${item.id}`);
      ids.push(item.id);
      for (const field of item.settings ?? []) {
        if (
          this.definitions.has(field.id) ||
          fields.some((other) => other.id === field.id)
        )
          throw new Error(`Duplicate setting: ${field.id}`);
        fields.push(field);
      }
      for (const child of item.children ?? []) visit(child);
    };
    visit(section);
    ids.forEach((id) => this.sectionIds.add(id));
    fields.forEach((field) => {
      const value =
        Object.prototype.hasOwnProperty.call(this.stored, field.id) &&
        this.valid(field, this.stored[field.id])
          ? this.stored[field.id]
          : field.default;
      this.definitions.set(field.id, field);
      const handle: Setting = new Setting(field, {
        read: () => this.read(field.id),
        set: (value) => this.updateValue(field.id, value),
        copy: (format) => this.copy(field.id, format),
        active: () => !this.disposed && this.handles.get(field.id) === handle,
      });
      this.handles.set(field.id, handle);
      this.values[field.id] = value;
      if (value !== field.default) field.onChange?.(value);
    });
    const clone = (item: SettingsSection): SettingsSection =>
      shallowReactive({
        ...item,
        children: shallowReactive((item.children ?? []).map(clone)),
      });
    const definition = clone(section);
    const container = parent
      ? (parent.children as SettingsSection[])
      : this.sections;
    container.push(definition);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      const index = container.indexOf(definition);
      if (index < 0) return;
      container.splice(index, 1);
      const remove = (item: SettingsSection) => {
        this.sectionIds.delete(item.id);
        for (const field of item.settings ?? []) {
          this.definitions.delete(field.id);
          this.handles.delete(field.id);
          delete this.values[field.id];
        }
        for (const child of item.children ?? []) remove(child);
        (item.children as SettingsSection[]).splice(0);
      };
      remove(definition);
    };
  }

  /** Restores a registered field to its declared default through the normal edit path. */
  reset(id: string) {
    return this.get(id)?.reset() ?? false;
  }

  /** Releases owned watchers and registrations without disposing host file services. */
  dispose() {
    this.disposed = true;
    this.page.dispose();
    this.stopSaving();
    this.scope.stop();
    this.sections.splice(0);
    this.definitions.clear();
    this.handles.clear();
    this.sectionIds.clear();
    Object.keys(this.values).forEach((id) => delete this.values[id]);
  }

  /** Active form or JSON mode, retained when settings move between a modal and tab. */
  get mode() {
    return this.page.mode;
  }

  /** Search text shared by every presentation of this settings controller. */
  get search() {
    return this.page.search;
  }

  /** JSON draft and explicit save operations, separate from effective values. */
  get json() {
    return this.page.json;
  }

  /** Bound operation that opens a fresh JSON draft without applying edits. */
  get showJSON() {
    return this.page.showJSON;
  }

  /** Bound operation that returns to the form and discards unsaved draft edits. */
  get showForm() {
    return this.page.showForm;
  }

  /** Optional host-owned JSON editor installed through the shared preference page. */
  get editor() {
    return this.page.editor;
  }

  /** Bound editor registration operation with registration-specific cleanup. */
  get registerEditor() {
    return this.page.registerEditor;
  }

  /** Checks scalar type and field constraints without mutating settings. */
  private valid(field: SettingDefinition, value: SettingValue): boolean {
    if (
      (field.type === 'number' || field.type === 'range') &&
      (typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < (field.min ?? -Infinity) ||
        value > (field.max ?? Infinity))
    )
      return false;
    if (field.type === 'checkbox') return typeof value === 'boolean';
    if (!['number', 'range'].includes(field.type) && typeof value !== 'string')
      return false;
    if (
      field.type === 'select' &&
      !field.options?.some(
        (option) =>
          isSelectOption(option) && option.value === value && !option.disabled
      )
    )
      return false;
    return field.type !== 'color' || /^#[0-9a-f]{6}$/i.test(String(value));
  }

  /** Validates a replacement document before any host callbacks are invoked. */
  private parseJSON(json: string): Record<string, SettingValue> {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error('Settings JSON must be an object.');
    for (const [id, value] of Object.entries(parsed)) {
      if (
        !['string', 'boolean', 'number'].includes(typeof value) ||
        (typeof value === 'number' && !Number.isFinite(value))
      )
        throw new Error(`Invalid setting value: ${id}`);
      const field = this.definitions.get(id);
      if (field?.persist === false) {
        delete (parsed as Record<string, unknown>)[id];
        continue;
      }
      if (
        field &&
        (!this.valid(field, value as SettingValue) ||
          (field.disabled && value !== this.read(id)))
      )
        throw new Error(`Invalid or disabled setting: ${id}`);
    }
    return parsed as Record<string, SettingValue>;
  }

  /** Appends a storage write and exposes failures without unhandled rejections. */
  private queueWrite(json: string) {
    if (!this.options.storage || this.disposed) return;
    this.writes = this.writes
      .catch(() => {})
      .then(async () => {
        if (this.disposed) return;
        try {
          await this.options.storage!.write(json);
          if (!this.disposed) this.error.value = '';
        } catch (cause) {
          if (!this.disposed)
            this.error.value = String(
              cause instanceof Error ? cause.message : cause
            );
          throw cause;
        }
      });
    void this.writes.catch(() => {});
  }

  /** Validates and updates one field through its host callback and persistence rules. */
  private updateValue(id: string, value: SettingValue) {
    const field = this.definitions.get(id);
    if (this.disposed || !field || field.disabled) return false;
    if (!this.valid(field, value)) return false;
    this.touched.add(id);
    if ((field.getValue?.() ?? this.values[id]) === value) return true;
    field.onChange?.(value);
    this.touched.add(id);
    this.values[id] = value;
    if (field.persist === false) return true;
    if (value === field.default) delete this.stored[id];
    else this.stored[id] = value;
    return true;
  }
}
