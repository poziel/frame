import {
  effectScope,
  nextTick,
  shallowRef,
  watch,
  type ShallowRef,
  type WatchStopHandle,
} from 'vue';
import type {CommandRegistry} from '../commands/commandRegistry';
import type {
  SettingsOptions,
  SettingsEditorDefinition,
} from '../settings/settingsTypes';
import {PreferencePage} from '../preferences/preferencePage';

/**
 * Owns shortcut override hydration and persistence for one Frame instance.
 * CommandRegistry delegates bindings to CommandKeybindings and retains execution
 * gates; this class shares form, search, and draft behavior through PreferencePage.
 */
export class Keybindings {

  /** The common presentation model; shortcut data remains owned by commands. */
  readonly page: PreferencePage;

  /** Reports successful initial hydration. */
  readonly loaded: ShallowRef<boolean>;

  /** Exposes read and write failures without discarding the original file. */
  readonly error = shallowRef('');

  /** Prevents deferred writes after disposal. */
  private disposed = false;

  /** Keeps an explicitly replaced document authoritative during hydration. */
  private replaced = false;

  /** Deduplicates concurrent reads. */
  private loading?: Promise<void>;

  /** Serializes file writes. */
  private writes = Promise.resolve();

  /** Releases automatic persistence. */
  private readonly stopSaving: WatchStopHandle;

  /** Persistence observer lifetime, independent of temporary caller scopes. */
  private readonly scope = effectScope(true);

  /** Registry owning shortcut values and guarded command execution. */
  private readonly commands: CommandRegistry;

  /** Explicit host file access and integration options. */
  private readonly options: SettingsOptions;

  /** Connects a command registry to optional host file access. */
  constructor(commands: CommandRegistry, options: SettingsOptions = {}) {
    this.showForm = this.showForm.bind(this);
    this.showJSON = this.showJSON.bind(this);
    this.registerEditor = this.registerEditor.bind(this);
    this.toJSON = this.toJSON.bind(this);
    this.applyJSON = this.applyJSON.bind(this);
    this.load = this.load.bind(this);
    this.flush = this.flush.bind(this);
    this.dispose = this.dispose.bind(this);
    this.commands = commands;
    this.options = options;
    this.loaded = shallowRef(!options.storage);
    this.page = new PreferencePage(
      {
        toJSON: this.toJSON,
        applyJSON: this.applyJSON,
        flush: this.flush,
        load: this.load,
      },
      'Keyboard Shortcuts'
    );
    this.stopSaving = this.scope.run(() =>
      watch(
        () => (this.loaded.value ? this.toJSON() : undefined),
        (json) => {
          if (json !== undefined) this.queueWrite(json);
        },
        {flush: 'post'}
      )
    )!;
  }

  /** Current form/JSON mode. */
  get mode() {
    return this.page.mode;
  }

  /** Search shared by modal and tab presentations. */
  get search() {
    return this.page.search;
  }

  /** The shortcut JSON draft. */
  get json() {
    return this.page.json;
  }

  /** Optional JSON editor contribution. */
  get editor() {
    return this.page.editor;
  }

  /** Opens the form without committing a dirty draft. */
  showForm() {
    return this.page.showForm();
  }

  /** Opens the JSON draft. */
  showJSON() {
    return this.page.showJSON();
  }

  /** Installs the same editor contract as Settings. */
  registerEditor(definition: SettingsEditorDefinition) {
    return this.page.registerEditor(definition);
  }

  /** Serializes only user overrides, including explicit shortcut removals. */
  toJSON() {
    const values = this.commands.getKeybindings();
    return JSON.stringify(values, Object.keys(values).sort(), 2) + '\n';
  }

  /** Validates the entire document before changing any binding. */
  applyJSON(json: string) {
    if (this.disposed) throw new Error('Keyboard Shortcuts are disposed');
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error('Keybindings JSON must be an object.');
    this.commands.replaceKeybindings(parsed as Record<string, string | null>);
    this.replaced = true;
  }

  /** Reads the file once; failed reads leave the source file untouched. */
  load(): Promise<void> {
    if (!this.options.storage || this.disposed) return Promise.resolve();
    if (this.loading) return this.loading;
    const baseline = this.commands.getKeybindings();
    this.loading = (async () => {
      try {
        const json = await this.options.storage!.read();
        if (this.disposed) return;
        const parsed: unknown = this.replaced
          ? this.commands.getKeybindings()
          : JSON.parse(json ?? '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
          throw new Error('Keybindings JSON must be an object.');
        const current = this.commands.getKeybindings();
        const merged = {...parsed} as Record<string, string | null>;
        for (const id of new Set([
          ...Object.keys(baseline),
          ...Object.keys(current),
        ])) {
          if (
            baseline[id] === current[id] &&
            Object.prototype.hasOwnProperty.call(baseline, id) ===
              Object.prototype.hasOwnProperty.call(current, id)
          )
            continue;
          if (Object.prototype.hasOwnProperty.call(current, id))
            merged[id] = current[id]!;
          else delete merged[id];
        }
        this.commands.replaceKeybindings(merged);
        this.loaded.value = true;
        this.error.value = '';
      } catch (cause) {
        this.loading = undefined;
        this.error.value =
          cause instanceof Error ? cause.message : String(cause);
        throw cause;
      }
    })();
    return this.loading;
  }

  /** Waits for pending writes before the host closes. */
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

  /** Releases presentation and automatic persistence watchers. */
  dispose() {
    this.disposed = true;
    this.stopSaving();
    this.scope.stop();
    this.page.dispose();
  }

  /** Queues an atomic host write without dropping prior failures. */
  private queueWrite(json: string) {
    if (!this.options.storage || this.disposed) return;
    this.writes = this.writes
      .catch(() => {})
      .then(async () => {
        if (this.disposed) return;
        try {
          await this.options.storage!.write(json);
          this.error.value = '';
        } catch (cause) {
          this.error.value =
            cause instanceof Error ? cause.message : String(cause);
          throw cause;
        }
      });
    void this.writes.catch(() => {});
  }
}
