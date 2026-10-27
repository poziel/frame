import type {Frame} from '../frame';

/** A successfully installed capability and its optional Frame-owned cleanup. */
export interface FrameModuleInstallation<Capability> {

  /** Installing a module exposes a capability; it need not create a resource. */
  capability: Capability;

  /** Releases module-owned resources when the Frame is disposed. */
  dispose?: () => void;
}

/**
 * Typed extension descriptor consumed by Frame.use().
 * The literal key adds a capability to the same Frame instance; installing it
 * need not create resource instances or start host work automatically.
 */
export interface FrameModule<
  Key extends string = string,
  Capability = unknown,
> {

  /** Stable module identity, unique within one Frame. */
  readonly id: string;

  /** Literal property name under which the capability is published. */
  readonly key: Key;

  /** Roll back any partial registrations if installation throws. */
  install(frame: Frame): FrameModuleInstallation<Capability>;
}

/** Registry-owned record for one successful installation. */
interface InstalledModule {

  /** Exact descriptor identity used for idempotent repeated installation. */
  readonly descriptor: FrameModule;

  /** Published Frame property removed on disposal. */
  readonly key: string;

  /** Cleanup returned by the installer, if any. */
  readonly dispose?: () => void;
}

/**
 * Installs and owns optional module capabilities on one Frame instance.
 * Descriptor identity makes repeated installation idempotent. Reserved IDs and
 * keys prevent nested installers from claiming the same capability. Disposal
 * removes capabilities in reverse order even when individual cleanups fail.
 */
export class ModuleRegistry {

  /** Frame receiving each successfully installed capability. */
  private readonly frame: Frame;

  /** Successfully installed descriptors, in installation order for reverse cleanup. */
  private readonly installed = new Map<string, InstalledModule>();

  /** In-progress IDs and keys, reserving them against reentrant installers. */
  private readonly pending = new Map<string, string>();

  /** Rejects installation once registry disposal begins. */
  private disposed = false;

  /** Connects module ownership to one Frame without installing any modules. */
  constructor(frame: Frame) {
    this.frame = frame;
    this.install = this.install.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Installs a descriptor once, publishing its capability only after success. */
  install(module: FrameModule): void {
    if (this.disposed) throw new Error('Frame is disposed');
    const existing = this.installed.get(module.id);
    if (existing?.descriptor === module) return;
    if (existing || this.pending.has(module.id))
      throw new Error(`Module already installed or installing: ${module.id}`);
    if (
      !module.id ||
      !module.key ||
      module.key in this.frame ||
      [...this.pending.values()].includes(module.key)
    )
      throw new Error(`Module capability is unavailable: ${module.key}`);
    this.pending.set(module.id, module.key);
    try {
      const result = module.install(this.frame);
      try {
        if (this.disposed) throw new Error('Frame is disposed');
        Object.defineProperty(this.frame, module.key, {
          value: result.capability,
          enumerable: true,
          configurable: true,
        });
      } catch (error) {
        result.dispose?.();
        throw error;
      }
      this.installed.set(module.id, {
        descriptor: module,
        key: module.key,
        dispose: result.dispose,
      });
    } finally {
      this.pending.delete(module.id);
    }
  }

  /** Releases installed capabilities in reverse order, continuing through errors. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const errors: unknown[] = [];
    for (const item of [...this.installed.values()].reverse()) {
      try {
        item.dispose?.();
      } catch (error) {
        errors.push(error);
      }
      Reflect.deleteProperty(this.frame, item.key);
    }
    this.installed.clear();
    if (errors.length)
      throw Object.assign(new Error('Frame module cleanup failed'), {errors});
  }
}
