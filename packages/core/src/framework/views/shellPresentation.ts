import {computed, type ComputedRef} from 'vue';
import type {FeatureController} from '../features/feature';
import type {FeatureRegistry} from '../features/featureRegistry';

/** Presentation Controller contract used by its owning shell controller. */
export interface PresentationController extends FeatureController {

  /** Reactive presentation visibility, separate from availability. */
  readonly visible: ComputedRef<boolean>;

  /**
   * Opens an available presentation, optionally selecting a view.
   *
   * @param id - Registered view identifier; omit to use the existing selection.
   */
  open(id?: string): void;

  /** Closes the presentation without unregistering its content. */
  close(): void;

  /** Opens or closes the presentation when available. */
  toggle(): void;
}

/** Shared implementation for independently controlled shell presentations. */
export class ShellPresentation implements PresentationController {

  /** Reactive visibility including feature availability. */
  readonly visible: ComputedRef<boolean>;

  /** Registry providing authoritative feature availability. */
  private readonly features: FeatureRegistry;

  /** Feature controlling this presentation. */
  readonly feature: string;

  /**
   * Callback revealing the retained presentation.
   *
   * @param id - Identifier of the item or dotted command namespace to address.
   */
  private readonly showPresentation: (id?: string) => void;

  /** Callback hiding the presentation without unregistering it. */
  private readonly hidePresentation: () => void;

  /**
   * Connects this object to its owning services.
   *
   * @param features - Per-Frame feature availability shared with shell
   * controllers.
   * @param feature - Feature identifier controlling this presentation.
   * @param readVisible - Reads visibility from the existing presentation
   * controller.
   * @param showPresentation - Reveals the presentation, optionally selecting a
   * view.
   * @param hidePresentation - Hides the presentation while retaining its
   * registration.
   */
  constructor(
    features: FeatureRegistry,
    feature: string,
    readVisible: () => boolean,
    showPresentation: (id?: string) => void,
    hidePresentation: () => void
  ) {
    this.setAvailable = this.setAvailable.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.features = features;
    this.feature = feature;
    this.showPresentation = showPresentation;
    this.hidePresentation = hidePresentation;
    this.visible = computed(() => this.available && readVisible());
  }

  /**
   * Updates feature availability without unregistering content.
   *
   * @param value - New state for the addressed availability or presentation
   * property.
   */
  setAvailable(value: boolean) {
    this.features.setAvailable(this.feature, value);
  }

  /**
   * Makes the functional area available.
   *
   * @remarks
   * The presentation remains closed until explicitly opened.
   */
  enable() {
    this.setAvailable(true);
  }

  /**
   * Makes the functional area unavailable.
   *
   * @remarks
   * The owning Frame availability subscription coordinates closing the
   * presentation.
   */
  disable() {
    this.setAvailable(false);
  }

  /**
   * Reveals the presentation when its feature is available.
   *
   * @param id - Optional registered view to reveal or select.
   */
  open(id?: string) {
    if (this.available) {
      this.showPresentation(id);
    }
  }

  /**
   * Hides the presentation while retaining its content.
   *
   * @remarks
   * Closing does not unregister content or change feature availability.
   */
  close() {
    this.hidePresentation();
  }

  /**
   * Opens or closes the available presentation.
   *
   * @remarks
   * Unavailable features cannot be opened through this operation.
   */
  toggle() {
    if (this.available) {
      if (this.visible.value) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  /**
   * Reads the current feature availability.
   *
   * @returns Whether the feature controlling this presentation is available.
   */
  get available() {
    return this.features.isAvailable(this.feature);
  }
}
