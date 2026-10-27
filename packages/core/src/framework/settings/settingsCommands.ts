import {effectScope, watch, type WatchStopHandle} from 'vue';
import type {Settings} from './settings';
import type {CommandRegistry} from '../commands/commandRegistry';
import type {SettingsSection} from './settings';
import type {SettingsCopyFormat} from './settingsTypes';

/** Stable command identifier shared by field menus and command registration. */
export const settingCommandId = (id: string, action: string) =>
  `frame.settings.field.${encodeURIComponent(id)}.${action}`;

/**
 * Owns reset and clipboard commands for the registered settings fields.
 * Tracks section changes once and releases commands when their fields disappear.
 * Execution uses the same setting handles and feature checks as host API calls.
 */
export class SettingsCommands {

  /** Detached scope makes command observation independent of the caller scope. */
  private readonly scope = effectScope(true);

  /** Settings controller whose field registrations produce commands. */
  private readonly settings: Settings;

  /** Frame-local command collection receiving field actions. */
  private readonly commands: CommandRegistry;

  /** Cleanup operations for each field's command registrations. */
  private readonly removers = new Map<string, () => void>();

  /** Stops section observation when the owning Frame is disposed. */
  private readonly stop: WatchStopHandle;

  /** Connects current and future field registrations to their commands. */
  constructor(settings: Settings, commands: CommandRegistry) {
    this.settings = settings;
    this.commands = commands;
    this.dispose = this.dispose.bind(this);
    this.stop = this.scope.run(() =>
      watch(settings.allSections, (sections) => this.synchronize(sections), {
        flush: 'sync',
        immediate: true,
      })
    )!;
  }

  /** Releases the section observer and every command owned by this binding. */
  dispose(): void {
    this.stop();
    this.scope.stop();
    this.removers.forEach((remove) => remove());
    this.removers.clear();
  }

  /** Updates registrations only for fields added or removed from the section tree. */
  private synchronize(sections: readonly SettingsSection[]): void {
    const fields = sections.flatMap((section) => section.settings ?? []);
    const ids = new Set(fields.map((field) => field.id));
    for (const [id, remove] of this.removers)
      if (!ids.has(id)) {
        remove();
        this.removers.delete(id);
      }
    for (const field of fields) {
      if (this.removers.has(field.id)) continue;
      const setting = this.settings.get(field.id)!;
      const registrations = (['reset', 'id', 'json', 'url'] as const).map(
        (action) =>
          this.commands.register({
            id: settingCommandId(field.id, action),
            label: `Settings: ${action === 'reset' ? 'Reset' : `Copy ${action.toUpperCase()} for`} ${field.label}`,
            feature: 'settings',
            scope: 'frame',
            quickInput: false,
            enabled: () =>
              setting.active &&
              (action !== 'reset' || (!field.disabled && setting.modified)),
            run: async () => {
              if (action === 'reset') setting.reset();
              else await setting.copy(action as SettingsCopyFormat);
            },
          })
      );
      this.removers.set(field.id, () =>
        registrations.forEach((remove) => remove())
      );
    }
  }
}
