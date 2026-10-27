import type {FrameTheme} from '../theme';
import {themeTokenNames, themeTokens} from '../tokens/tokenCatalog';

/** Exclusive DOM ownership only; selected themes remain instance-local. */
const owners = new WeakMap<HTMLElement, ThemeAttachment>();

/** Typography inherited by both shell surfaces and detached overlay roots. */
const typography = {
  color: 'var(--frame-text)',
  'font-family': 'var(--frame-font-body)',
  'font-size': 'var(--frame-font-size-body)',
  'line-height': 'var(--frame-line-height-body)',
} as const;

/**
 * Applies a controller's theme to one element and restores host-owned styles.
 *
 * Only declarations still matching this attachment's last write are restored.
 * Subsequent host writes survive cleanup, as do unrelated inline declarations.
 * Callers receive a bound, idempotent detach callback from the controller.
 */
export class ThemeAttachment {

  /** Attribute identifying theme scopes for shared CSS fallbacks. */
  private readonly scopeAttribute = 'data-frame-theme-scope';

  /** Host attribute value restored when this scope is released. */
  private readonly previousScope: string | null;

  /** Inline values and priorities captured before managed writes. */
  private readonly previous = new Map<string, [string, string]>();

  /** Actual CSSOM values used to recognize declarations still owned here. */
  private readonly written = new Map<string, string>();

  /** Prevents stale cleanup from releasing a replacement attachment. */
  private detached = false;

  /** Element whose inline declarations this attachment manages. */
  private readonly element: HTMLElement;

  /** Removes this attachment from the owning controller. */
  private readonly release: () => void;

  /**
   * Claims an element without accessing browser globals during module import.
   * @throws If another attachment already owns the element.
   */
  constructor(element: HTMLElement, release: () => void) {
    if (owners.has(element))
      throw new Error('Theme target is already attached');
    this.element = element;
    this.release = release;
    this.previousScope = element.getAttribute(this.scopeAttribute);
    owners.set(element, this);
    element.setAttribute(this.scopeAttribute, '');
    this.detach = this.detach.bind(this);
  }

  /** Replaces managed declarations, filling omitted shared tokens from defaults. */
  update(theme: FrameTheme | null): void {
    if (this.detached) return;
    this.restore();
    if (theme) {
      for (const name of themeTokenNames) {
        const value = theme.tokens[name] ?? themeTokens[name].value;
        if (value !== '') this.write(name, value);
      }
      this.write('color-scheme', theme.appearance);
    }
    for (const [key, value] of Object.entries(typography))
      this.write(key, value);
  }

  /** Restores managed styles and releases exclusive ownership exactly once. */
  detach(): void {
    if (this.detached) return;
    this.detached = true;
    this.restore();
    this.release();
    owners.delete(this.element);
    if (this.element.getAttribute(this.scopeAttribute) === '') {
      if (this.previousScope === null)
        this.element.removeAttribute(this.scopeAttribute);
      else this.element.setAttribute(this.scopeAttribute, this.previousScope);
    }
  }

  /** Restores declarations whose value and priority still match our last write. */
  private restore(): void {
    for (const [key, value] of this.written) {
      if (
        this.element.style.getPropertyValue(key) === value &&
        this.element.style.getPropertyPriority(key) === ''
      ) {
        const [old, priority] = this.previous.get(key)!;
        if (old) this.element.style.setProperty(key, old, priority);
        else this.element.style.removeProperty(key);
      }
    }
    this.previous.clear();
    this.written.clear();
  }

  /** Captures host declarations and records normalized values after CSSOM writes. */
  private write(key: string, value: string): void {
    if (!this.previous.has(key)) {
      this.previous.set(key, [
        this.element.style.getPropertyValue(key),
        this.element.style.getPropertyPriority(key),
      ]);
    }
    this.element.style.setProperty(key, value);
    this.written.set(key, this.element.style.getPropertyValue(key));
  }
}
