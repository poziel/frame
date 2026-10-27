import type {SettingsStorage} from './settingsTypes';

/** Writable handle used by file-backed settings without requiring browser globals. */
export interface SettingsWritableFile {

  /** Writes serialized settings to the host-selected file. */
  write(json: string): Promise<void>;

  /** Commits the write and releases the file stream. */
  close(): Promise<void>;

  /** Cancels a failed write when supported by the host. */
  abort?(): Promise<void>;
}

/** Host-selected file access; choosing the path and obtaining permission are host responsibilities. */
export interface SettingsFileHandle {

  /** Opens the current file contents for reading. */
  getFile(): Promise<{text(): Promise<string>}>;

  /** Opens a writable stream for one serialized settings document. */
  createWritable(): Promise<SettingsWritableFile>;
}

/**
 * Adapts a host-owned file handle to the settings storage contract.
 * Construction performs no I/O and never requests permission. The controller
 * serializes writes; this adapter owns only the stream for each write operation.
 */
export class SettingsFileStorage implements SettingsStorage {

  /** File selected and authorized by the host application. */
  private readonly handle: SettingsFileHandle;

  /** Retains explicit file access without opening the file. */
  constructor(handle: SettingsFileHandle) {
    this.handle = handle;
  }

  /** Reads nonempty JSON, treating an empty file as missing settings. */
  async read(): Promise<string | undefined> {
    const json = await (await this.handle.getFile()).text();
    return json.trim() ? json : undefined;
  }

  /** Writes and commits JSON, aborting the stream if writing or closing fails. */
  async write(json: string): Promise<void> {
    const file = await this.handle.createWritable();
    try {
      await file.write(json);
      await file.close();
    } catch (cause) {
      await file.abort?.();
      throw cause;
    }
  }
}

/** Creates a file adapter through the existing public factory contract. */
export function createSettingsFileStorage(
  handle: SettingsFileHandle
): SettingsFileStorage {
  return new SettingsFileStorage(handle);
}
