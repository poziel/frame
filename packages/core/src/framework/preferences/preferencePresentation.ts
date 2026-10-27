import {effectScope, watch, h} from 'vue';
import type {Frame} from '../frame';
import PreferencesSurface from '../../components/framework/PreferencesSurface.vue';
import FrameIcon from '../../components/data-display/FrameIcon.vue';

/** Shared preference content kinds supported by the shell. */
export type PreferenceKind = 'settings' | 'keybindings';

/**
 * Coordinates one preference document's modal and workspace-tab presentation.
 * Watches explicit shell requests, preserves the existing content model during
 * moves, and removes presentation when its owning feature becomes unavailable.
 * It never owns or disposes the underlying preference values or JSON draft.
 */
export class PreferencePresentation {

  /** Watchers owned by this presentation rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Root instance owning modal, workspace, and feature operations. */
  private readonly frame: Frame;

  /** Preference controller presented by this instance. */
  readonly kind: PreferenceKind;

  /** Stable modal and workspace-tab identity for this document. */
  readonly id: string;

  /** Cleanup for the workspace tab registered by this instance. */
  private unregister: (() => void) | undefined;

  /** Prevents presentation after shell teardown. */
  private disposed = false;

  /** Connects one document to its existing shell requests and feature state. */
  constructor(frame: Frame, kind: PreferenceKind) {
    this.frame = frame;
    this.kind = kind;
    this.id = `frame.${kind}`;
    this.dispose = this.dispose.bind(this);
    this.scope.run(() => this.observe());
  }

  /** Shows this document in a tab or modal while retaining its existing page state. */
  present(tab: boolean): void {
    if (this.disposed || !this.available()) return;
    const frame = this.frame;
    const id = this.id;
    const kind = this.kind;
    const page = frame[kind];
    if (tab) {
      if (frame.workspace.tabs.value.some((item) => item.id === id)) {
        frame.workspace.activateTab(id);
        frame.closeModal(id);
        return;
      }
      const active = frame.workspace.activePane.value;
      const pane = frame.workspace.canOpenTab(active)
        ? active
        : frame.workspace.panes.value.find((item) =>
            frame.workspace.canOpenTab(item.id)
          )?.id;
      if (!pane) return;
      if (
        frame.workspace.paneMode(pane) !== 'tabs' &&
        !frame.workspace.setPaneMode(pane, 'tabs').ok
      )
        return;
      this.unregister?.();
      this.unregister = frame.workspace.registerTab(pane, {
        id,
        title: this.title(),
        dirty: page.mode.value === 'json' && page.json.dirty.value,
        icon: kind === 'settings' ? 'settings-gear' : 'record-keys',
        component: PreferencesSurface,
        props: {kind},
        closable: true,
      });
      frame.workspace.activateTab(id);
      frame.closeModal(id);
    } else {
      if (frame.modals.some((modal) => modal.id === id)) return;
      this.unregister?.();
      this.unregister = undefined;
      frame.openModal({
        id,
        title: this.title(),
        icon: {
          render: () =>
            h(FrameIcon, {
              name: kind === 'settings' ? 'settings-gear' : 'record-keys',
            }),
        },
        component: PreferencesSurface,
        props: {kind},
        width: kind === 'settings' ? 960 : 1050,
        height: 660,
        contentPadding: 0,
      });
    }
  }

  /** Stops owned watchers and releases the workspace tab created by this adapter. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scope.stop();
    this.unregister?.();
    this.unregister = undefined;
  }

  /** Reports feature availability for the document this instance presents. */
  private available(): boolean {
    return this.kind === 'settings'
      ? this.frame.features.settings
      : this.frame.features.isAvailable('keybindings');
  }

  /** Resolves the current form or JSON title without creating presentation state. */
  private title(): string {
    return this.frame[this.kind].mode.value === 'json'
      ? `${this.kind}.json`
      : this.kind === 'settings'
        ? 'Settings'
        : 'Keyboard Shortcuts';
  }

  /** Installs request, title, and availability observers inside the owned scope. */
  private observe(): void {
    const frame = this.frame;
    const kind = this.kind;
    const page = frame[kind];
    const request =
      kind === 'settings' ? frame.settingsRequest : frame.keybindingsRequest;
    const jsonRequest =
      kind === 'settings'
        ? frame.settingsJsonRequest
        : frame.keybindingsJsonRequest;
    const target =
      kind === 'settings' ? frame.settingsTarget : frame.keybindingsTarget;
    const canTab =
      kind === 'settings'
        ? frame.canOpenSettingsInTab
        : frame.canOpenKeybindingsInTab;
    watch(
      request,
      () => {
        if (request.value && this.available())
          this.present(target.value === 'tab');
      },
      {immediate: true}
    );
    watch(
      jsonRequest,
      () => {
        if (!jsonRequest.value || !this.available() || !page.editor.value)
          return;
        this.present(
          frame.workspace.tabs.value.some((tab) => tab.id === this.id) ||
            (!frame.modals.some((modal) => modal.id === this.id) &&
              canTab.value)
        );
      },
      {immediate: true}
    );
    watch(
      () => [page.mode.value, page.json.dirty.value],
      () => this.updateTitle(),
      {flush: 'sync'}
    );
    watch(
      () => [
        this.available(),
        frame.features.isAvailable('workspace'),
        page.editor.value,
      ],
      () => this.updateAvailability(),
      {flush: 'sync'}
    );
  }

  /** Updates existing presentation titles and tab dirty state in place. */
  private updateTitle(): void {
    const frame = this.frame;
    const page = frame[this.kind];
    const index = frame.modals.findIndex((modal) => modal.id === this.id);
    if (index >= 0)
      frame.modals.splice(index, 1, {
        ...frame.modals[index]!,
        title: this.title(),
      });
    if (frame.workspace.tabs.value.some((tab) => tab.id === this.id))
      frame.workspace.updateTab(this.id, {
        title: this.title(),
        dirty: page.mode.value === 'json' && page.json.dirty.value,
      });
  }

  /** Removes unavailable presentation and returns to the form if its editor ends. */
  private updateAvailability(): void {
    const frame = this.frame;
    const page = frame[this.kind];
    if (!page.editor.value) page.showForm();
    if (
      !this.available() ||
      (this.unregister && !frame.features.isAvailable('workspace'))
    ) {
      this.unregister?.();
      this.unregister = undefined;
      frame.closeModal(this.id);
      page.showForm();
    }
  }
}
