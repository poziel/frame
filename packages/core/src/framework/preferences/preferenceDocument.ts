import {computed, effectScope, shallowRef, watch, type ShallowRef} from 'vue';

/** Serialization and persistence owned by a settings or shortcut controller. */
export interface PreferenceDocumentHost {

  /** Serializes current effective overrides. */
  toJSON(): string;

  /** Validates and applies a complete override document. */
  applyJSON(text: string): void;

  /** Waits for pending persistence and reports storage failures. */
  flush(): Promise<void>;

  /** Waits for initial hydration before checking a draft for conflicts. */
  load(): Promise<void>;
}

/**
 * Owns an editable JSON draft independently of effective preferences.
 *
 * Clean drafts follow host changes. Dirty drafts remain untouched until Save
 * or reset; Save rejects stale documents and exposes errors without discarding
 * the draft. Disposal stops observation without disposing the host controller.
 */
export class PreferenceDocument {

  /** Detached observation scope owned by this document. */
  private readonly scope = effectScope(true);

  /** Controller that owns serialization, validation, and file access. */
  private readonly host: PreferenceDocumentHost;

  /** Human-readable document name used in conflict messages. */
  private readonly label: string;

  /** User-editable JSON; typing does not mutate effective preferences. */
  readonly draft: ShallowRef<string>;

  /** Last clean text used to determine whether the draft was edited. */
  private readonly baseline: ShallowRef<string>;

  /** Effective document expected when the next save starts. */
  private expected: string;

  /** Most recent validation, conflict, or persistence error. */
  readonly error = shallowRef('');

  /** Whether an explicit save operation is in progress. */
  readonly saving = shallowRef(false);

  /** Whether the draft differs from its last clean baseline. */
  readonly dirty = computed(() => this.draft.value !== this.baseline.value);

  /** Prevents new saves and late completion updates after disposal. */
  private disposed = false;

  /** Initializes a clean draft and starts document-owned host observation. */
  constructor(host: PreferenceDocumentHost, label = 'Settings') {
    this.host = host;
    this.label = label;
    this.reset = this.reset.bind(this);
    this.save = this.save.bind(this);
    this.dispose = this.dispose.bind(this);
    const initial = host.toJSON();
    this.draft = shallowRef(initial);
    this.baseline = shallowRef(initial);
    this.expected = initial;
    this.scope.run(() =>
      watch(
        () => this.host.toJSON(),
        () => {
          if (!this.dirty.value && !this.saving.value) this.reset();
        },
        {flush: 'sync'}
      )
    );
  }

  /** Discards draft edits and starts again from the current effective document. */
  reset(): void {
    if (this.disposed) return;
    this.draft.value = this.baseline.value = this.expected = this.host.toJSON();
    this.error.value = '';
  }

  /** Applies and persists a changed, current draft, exposing errors for retry. */
  async save(): Promise<void> {
    if (this.disposed || this.saving.value || !this.dirty.value) return;
    this.saving.value = true;
    try {
      await this.host.load();
      if (this.disposed) return;
      if (this.expected !== this.host.toJSON())
        throw new Error(
          `${this.label} changed while this file was being edited. Return to the form and reopen the JSON editor before saving.`
        );
      this.host.applyJSON(this.draft.value);
      this.expected = this.host.toJSON();
      await this.host.flush();
      if (!this.disposed) this.reset();
    } catch (cause) {
      if (!this.disposed)
        this.error.value =
          cause instanceof Error ? cause.message : String(cause);
    } finally {
      this.saving.value = false;
    }
  }

  /** Releases document observation; an already-started host write is not cancelled. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scope.stop();
  }
}
