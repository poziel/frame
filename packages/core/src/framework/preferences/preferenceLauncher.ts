import {computed, shallowRef, type ComputedRef, type ShallowRef} from 'vue';
import type {FeatureRegistry} from '../features/featureRegistry';
import type {Workspace} from '../workspace/workspace';

/** Operations shared by settings and keyboard-shortcut editors. */
export interface PreferenceEditor {

  /** Installed JSON editor capability, when available. */
  readonly editor: ShallowRef<unknown>;

  /** Selects the structured editing presentation. */
  showForm(): void;

  /** Selects JSON editing without changing the retained presentation target. */
  showJSON(): void;

  /** Selects a specific field when supported by this editor. */
  reveal?(id: string): boolean;
}

/**
 * Owns presentation requests for one preference editor.
 * Settings and keybindings each get an independent instance. Vue presentations
 * observe the request counters while this service enforces shared availability
 * and workspace policies.
 */
export class PreferenceLauncher {

  /** Counter observed by the retained form presentation. */
  readonly request = shallowRef(0);

  /** Requested placement, retained between successive openings. */
  readonly target = shallowRef<'modal' | 'tab'>('modal');

  /** Counter observed by JSON editor presentations. */
  readonly jsonRequest = shallowRef(0);

  /** Whether the current workspace can host this preference editor. */
  readonly canOpenInTab: ComputedRef<boolean>;

  /** Feature gate and stable suffix of the preference tab identity. */
  private readonly feature: string;

  /** Per-instance availability decisions. */
  private readonly features: FeatureRegistry;

  /** Retained workspace tabs and their insertion policies. */
  private readonly workspace: () => Workspace;

  /** Resolves the editor after Frame has connected its services. */
  private readonly editor: () => PreferenceEditor;

  /** Cancels a transient picker before activating the form presentation. */
  private readonly closePicker: () => void;

  /** Connects an editor without creating a tab or opening a modal. */
  constructor(
    feature: string,
    features: FeatureRegistry,
    workspace: () => Workspace,
    editor: () => PreferenceEditor,
    closePicker: () => void
  ) {
    this.feature = feature;
    this.features = features;
    this.workspace = workspace;
    this.editor = editor;
    this.closePicker = closePicker;
    this.canOpenInTab = computed(
      () =>
        this.features.isAvailable(this.feature) &&
        this.features.isAvailable('workspace') &&
        this.workspace().panes.value.some((pane) =>
          this.workspace().canOpenTab(pane.id)
        )
    );
  }

  /** Opens the form in its existing tab, otherwise requests a modal. */
  open(): void {
    if (!this.features.isAvailable(this.feature)) return;
    this.editor().showForm();
    this.target.value = this.workspace().tabs.value.some(
      (tab) => tab.id === 'frame.' + this.feature
    )
      ? 'tab'
      : 'modal';
    this.closePicker();
    this.request.value++;
  }

  /** Reveals a registered field and opens the form in its retained presentation. */
  reveal(id: string): boolean {
    if (!this.features.isAvailable(this.feature) || !this.editor().reveal?.(id))
      return false;
    this.open();
    return true;
  }

  /** Requests a workspace tab only when the current insertion policy allows it. */
  openInTab(): boolean {
    if (!this.canOpenInTab.value) return false;
    this.target.value = 'tab';
    this.closePicker();
    this.request.value++;
    return true;
  }

  /** Requests a modal without discarding the editor draft or selected mode. */
  openInModal(): boolean {
    if (!this.features.isAvailable(this.feature)) return false;
    this.target.value = 'modal';
    this.request.value++;
    return true;
  }

  /** Requests JSON editing only when an editor capability has been installed. */
  openJSON(): boolean {
    if (!this.features.isAvailable(this.feature) || !this.editor().editor.value)
      return false;
    this.editor().showJSON();
    this.jsonRequest.value++;
    return true;
  }
}
