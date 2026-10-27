import type {ModalDefinition} from '../../components/framework/modal';
import type {ShallowReactive} from 'vue';
import {markRaw, shallowReactive} from 'vue';
import type {FrameOptions} from '../frame';
import type {ViewRegistry} from './viewRegistry';
import type {QuickInputController} from '../commands/quickInputController';

/** Narrow dependencies connected by the owning Frame instance. */
export interface ModalRegistryServices {

  /** Owns registered shell views, hierarchy, visibility, selection, and movement. */
  readonly viewRegistry: ViewRegistry;

  /** Owns command discovery and explicit picker requests. */
  readonly quickInputController: QuickInputController;

  /** Initial configuration shared by the owning service constructors. */
  readonly options: FrameOptions;
}

/**
 * Owns modal registrations, stacking, and presentation activation.
 * Opening a modal cancels conflicting transient interactions through explicit dependencies.
 */
export class ModalRegistry {

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ModalRegistryServices;

  /** Ordered modal definitions; the last entry is the active presentation. */
  readonly modals: ShallowReactive<ModalDefinition[]>;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ModalRegistryServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);

    this.modals = shallowReactive<ModalDefinition[]>([]);
  }

  /** Closes the addressed modal, defaulting to the topmost presentation. */
  closeModal(id = this.modals[this.modals.length - 1]?.id) {
    const index = this.modals.findIndex((modal) => modal.id === id);
    if (index >= 0) this.modals.splice(index, 1);
  }

  /** Opens or activates a modal, cancelling conflicting transient interactions. */
  openModal(modal: ModalDefinition) {
    this.services.viewRegistry.viewDrag.cancel();
    this.services.quickInputController.closeQuickInput();
    let definition = this.modals.find((item) => item.id === modal.id);
    if (definition) {
      this.modals.splice(this.modals.indexOf(definition), 1);
      this.modals.push(definition);
    } else {
      definition = {
        ...this.services.options.modal,
        ...modal,
        footer: modal.footer ? markRaw(modal.footer) : undefined,
        component: markRaw(modal.component),
        icon: modal.icon ? markRaw(modal.icon) : undefined,
      };
      this.modals.push(definition);
    }
    const current = definition;
    return {
      id: current.id,
      close: () => {
        if (this.modals.includes(current)) this.closeModal(current.id);
      },
    };
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.modals.splice(0);
  }
}
