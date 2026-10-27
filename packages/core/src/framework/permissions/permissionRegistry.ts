import {shallowReactive} from 'vue';
import {Permission, type PermissionOptions} from './permission';

/** Per-Frame permission ownership and fail-closed lookup. */
export class PermissionRegistry {

  /**
   * Dotted identifiers support item-owned operations through bracket lookup.
   */
  readonly [id: `${string}.${string}`]: Permission<unknown>;

  /** Reactive registrations preserving class identity. */
  private readonly entries = shallowReactive(
    new Map<string, Permission<unknown>>()
  );

  /** Prevents registrations after disposal. */
  private disposed = false;

  /**
   * Registers a permission and exposes the same object through bracket lookup.
   *
   * @typeParam C - Type of the explicit permission target.
   *
   * @param options - Initial registration data retained by the owning object.
   *
   * @returns The live permission shared by registry and bracket lookup.
   *
   * @throws If the registry is disposed or the ID is empty, reserved, or
   * already registered.
   */
  register<C = void>(options: PermissionOptions<C>): Permission<C> {
    if (this.disposed) {
      throw new Error('Permissions are disposed');
    }
    if (
      !options.id.trim() ||
      options.id in this ||
      this.entries.has(options.id)
    ) {
      throw new Error(`Invalid or duplicate permission: ${options.id}`);
    }
    const permission = new Permission(options, () => {
      if (this.entries.get(options.id) === permission) {
        this.entries.delete(options.id);
        Reflect.deleteProperty(this, options.id);
      }
    });
    this.entries.set(options.id, permission as Permission<unknown>);
    Object.defineProperty(this, options.id, {
      configurable: true,
      get: () => permission,
    });
    return permission;
  }

  /**
   * Looks up an item; contextual callers supply its target type.
   *
   * @typeParam C - Type of the explicit permission target.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @returns The registered permission, or undefined when the ID is unknown.
   */
  get<C = void>(id: string): Permission<C> | undefined {
    return this.entries.get(id) as Permission<C> | undefined;
  }

  /**
   * Lists live registrations without exposing the backing map.
   *
   * @returns A snapshot of live permission objects.
   */
  list(): readonly Permission<unknown>[] {
    return [...this.entries.values()];
  }

  /**
   * Unknown permissions deny access.
   *
   * @typeParam C - Type of the explicit permission target.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param context - Explicit target used to evaluate the permission condition
   * and reason.
   *
   * @returns The permission decision; unknown IDs produce a denial.
   */
  check<C = void>(id: string, context: C): {
    allowed: boolean;
    reason?: string;
  } {
    return (
      this.get<C>(id)?.check(context) ?? {
        allowed: false,
        reason: `Unknown permission: ${id}`,
      }
    );
  }

  /**
   * Delegates manual approval to the item.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @throws If the permission ID is unknown.
   */
  enable(id: string): void {
    this.require(id).enable();
  }

  /**
   * Delegates manual denial to the item.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   * @param reason - Explanation displayed while the manual denial is active.
   *
   * @throws If the permission ID is unknown.
   */
  disable(id: string, reason?: string): void {
    this.require(id).disable(reason);
  }

  /**
   * Resumes automatic evaluation.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   *
   * @throws If the permission ID is unknown.
   */
  reset(id: string): void {
    this.require(id).reset();
  }

  /**
   * Releases all registrations, including bracket accessors.
   *
   * @remarks
   * Retained permission objects deny access, and future registrations are
   * rejected.
   */
  dispose(): void {
    this.disposed = true;
    for (const permission of this.list()) {
      permission.unregister();
    }
  }

  /**
   * Rejects unknown identifiers for mutation operations.
   *
   * @param id - Registered permission ID; unknown IDs are rejected.
   *
   * @returns The registered permission for this ID.
   *
   * @throws If the permission ID is unknown.
   */
  private require(id: string): Permission<unknown> {
    const permission = this.entries.get(id);
    if (!permission) {
      throw new Error(`Unknown permission: ${id}`);
    }
    return permission;
  }
}
