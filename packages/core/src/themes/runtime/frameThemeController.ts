import {computed, shallowReactive, shallowRef, type ComputedRef} from 'vue';
import {
  defineTheme,
  type FrameTheme,
  type FrameThemeDefinition,
} from '../theme';
import {ThemeAttachment} from './themeAttachment';

/**
 * Owns theme selection, registration, and attached surfaces for one Frame.
 *
 * Definitions are validated immutable copies. Parsing and construction never
 * access the DOM; explicit attachment applies styles to shell or host surfaces.
 * Disposal releases every attachment and prevents further selection or claims.
 *
 * @example
 * const themes = new FrameThemeController();
 * themes.set(definition);
 * const detach = themes.attach(element);
 * detach();
 * themes.dispose();
 */
export class FrameThemeController {

  /** Selected immutable theme, or null to inherit document CSS tokens. */
  readonly current: ComputedRef<FrameTheme | null>;

  /** Registered definitions in insertion order for theme selection UI. */
  readonly available: ComputedRef<readonly FrameTheme[]>;

  /** Reactive selection shared by every owned attachment. */
  private readonly selected = shallowRef<FrameTheme | null>(null);

  /** Registered definitions isolated from other controllers. */
  private readonly definitions = shallowReactive(new Map<string, FrameTheme>());

  /** Owned DOM bindings released on explicit detach or controller disposal. */
  private readonly bindings = new Map<HTMLElement, ThemeAttachment>();

  /** Terminal lifecycle flag guarding state mutations and attachment. */
  private disposed = false;

  /** Validates an optional initial selection and includes it in available themes. */
  constructor(initial?: FrameTheme | FrameThemeDefinition) {
    if (initial) {
      this.selected.value = defineTheme(initial);
      this.definitions.set(this.selected.value.id, this.selected.value);
    }
    this.current = computed(() => this.selected.value);
    this.available = computed(() => [...this.definitions.values()]);
    this.register = this.register.bind(this);
    this.set = this.set.bind(this);
    this.reset = this.reset.bind(this);
    this.attach = this.attach.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /**
   * Registers an immutable definition without selecting it.
   * @returns Idempotent cleanup scoped to this exact registration.
   * @throws If disposed, invalid, or the identifier is already registered.
   */
  register(theme: FrameTheme | FrameThemeDefinition): () => void {
    this.assertActive();
    const definition = defineTheme(theme);
    if (this.definitions.has(definition.id)) {
      throw new Error(`Theme already registered: ${definition.id}`);
    }
    this.definitions.set(definition.id, definition);
    return () => {
      if (this.definitions.get(definition.id) === definition) {
        this.definitions.delete(definition.id);
      }
    };
  }

  /** Validates before replacing the selection and updating all attached surfaces. */
  set(theme: FrameTheme | FrameThemeDefinition): void {
    this.assertActive();
    this.selected.value = defineTheme(theme);
    this.apply();
  }

  /** Resumes document inheritance; harmless after disposal. */
  reset(): void {
    if (this.disposed) return;
    this.selected.value = null;
    this.apply();
  }

  /**
   * Exclusively attaches an element to the current and future selections.
   * @returns A bound, idempotent cleanup restoring host-owned declarations.
   * @throws If disposed or the element already belongs to an attachment.
   */
  attach(element: HTMLElement): () => void {
    this.assertActive();
    const binding = new ThemeAttachment(element, () =>
      this.bindings.delete(element)
    );
    this.bindings.set(element, binding);
    binding.update(this.selected.value);
    return binding.detach;
  }

  /** Releases every owned surface and clears registration and selection state. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.definitions.clear();
    for (const binding of [...this.bindings.values()]) binding.detach();
    this.selected.value = null;
  }

  /** Rejects mutations after the owning Frame has released this service. */
  private assertActive(): void {
    if (this.disposed) throw new Error('Frame theme has been disposed');
  }

  /** Projects the current selection onto all owned DOM attachments. */
  private apply(): void {
    for (const binding of this.bindings.values())
      binding.update(this.selected.value);
  }
}
