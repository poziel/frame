/** One shell and its portal-aware keyboard handler. */
export interface ShortcutOwner {

  /** Reports whether the target belongs to this shell or its portals. */
  owns(target: Node): boolean;

  /** Handles an event routed to this shell. */
  handle(event: KeyboardEvent): void;
}

/**
 * Shares one set of document listeners across mounted shells.
 * Routes shortcuts to the focused or last-used shell and releases listeners
 * when the final owner unregisters.
 */
export class ShellShortcutRouter {

  /** Active router for each document; documents are not retained globally. */
  private static readonly registries = new WeakMap<
    Document,
    ShellShortcutRouter
  >();

  /** Mounted shells eligible to receive keyboard events. */
  private readonly owners = new Set<ShortcutOwner>();

  /** Last shell activated by focus or pointer input. */
  private active: ShortcutOwner | undefined;

  /** Document whose listeners belong to this router. */
  private readonly document: Document;

  /** Bound activation listener with stable identity for removal. */
  private readonly activateListener = (event: Event) => this.activate(event);

  /** Bound keyboard listener with stable identity for removal. */
  private readonly keyListener = (event: KeyboardEvent) => this.handle(event);

  /** Attaches listeners for the first registered shell in a document. */
  private constructor(document: Document) {
    this.document = document;
    document.addEventListener('pointerdown', this.activateListener, true);
    document.addEventListener('focusin', this.activateListener, true);
    document.addEventListener('keydown', this.keyListener, true);
  }

  /** Registers a shell and returns an idempotent listener ownership cleanup. */
  static register(owner: ShortcutOwner, document: Document): () => void {
    let router = this.registries.get(document);
    if (!router) {
      router = new ShellShortcutRouter(document);
      this.registries.set(document, router);
    }
    router.owners.add(owner);
    const current = router;
    return () => current.remove(owner);
  }

  /** Finds the shell containing a focus or pointer target. */
  private find(target: EventTarget | null): ShortcutOwner | undefined {
    return target instanceof Node
      ? [...this.owners].find((owner) => owner.owns(target))
      : undefined;
  }

  /** Remembers the most recently activated shell without clearing host focus. */
  private activate(event: Event): void {
    const found = this.find(event.target);
    if (found) this.active = found;
  }

  /** Leaves host controls alone and dispatches eligible events to one shell. */
  private handle(event: KeyboardEvent): void {
    const found = this.find(event.target);
    if (found && !this.active) this.active = found;
    if (
      !found &&
      event.target !== this.document.body &&
      event.target !== this.document.documentElement &&
      event.target !== this.document
    )
      return;
    (
      this.active ?? (this.owners.size === 1 ? [...this.owners][0] : undefined)
    )?.handle(event);
  }

  /** Removes one owner and releases shared listeners after the final removal. */
  private remove(owner: ShortcutOwner): void {
    if (!this.owners.delete(owner)) return;
    if (this.active === owner) this.active = undefined;
    if (this.owners.size) return;
    this.document.removeEventListener(
      'pointerdown',
      this.activateListener,
      true
    );
    this.document.removeEventListener('focusin', this.activateListener, true);
    this.document.removeEventListener('keydown', this.keyListener, true);
    ShellShortcutRouter.registries.delete(this.document);
  }
}
