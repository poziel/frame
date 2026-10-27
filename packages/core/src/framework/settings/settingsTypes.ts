import type {Component} from 'vue';

/** Host-owned access to a settings file; Frame owns serialization and scheduling. */
export interface SettingsStorage {

  /** Reads JSON, or undefined when no file exists. */
  read(): Promise<string | undefined>;

  /** Writes one serialized override document; the host chooses its atomic-write policy. */
  write(json: string): Promise<void>;
}

/** Explicit file, clipboard, and deep-link integration for a settings controller. */
export interface SettingsOptions {

  /** Optional storage; omitted settings remain local to this controller's lifetime. */
  storage?: SettingsStorage;

  /** Overrides application links, for example with a native URL scheme. */
  url?: (settingId: string) => string;

  /** Optional clipboard adapter; otherwise the browser clipboard is used. */
  writeClipboard?: (text: string) => Promise<void>;
}

/**
 * Editor contribution installed by a host or optional editor module.
 * The shell owns draft state, save actions, and presentation; this definition
 * supplies the editor surface without importing its implementation into Core.
 */
export interface SettingsEditorDefinition {

  /** Component bound to the shared settings JSON draft. */
  component: Component;

  /** Additional editor-specific properties supplied by the host. */
  props?: Record<string, unknown>;
}

/** Content produced by a field's copy action. */
export type SettingsCopyFormat = 'id' | 'json' | 'url';
