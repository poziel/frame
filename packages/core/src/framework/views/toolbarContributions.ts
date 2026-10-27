import type {Toolbar} from './toolbar';
import type {ToolbarStatus} from './toolbarStatus';
import type {CommandRegistry} from '../commands/commandRegistry';
import type {ToolbarAction} from './toolbar';
import type {ShallowReactive} from 'vue';
import {markRaw, reactive, shallowReactive} from 'vue';
import {validToolbarPlacement} from './toolbar';

/** Narrow dependencies connected by the owning Frame instance. */
export interface ToolbarContributionsServices {

  /** Authoritative command registration, discovery, and guarded execution. */
  readonly commands: CommandRegistry;

  /** Coordinates toolbar actions with their status-bar presentations. */
  readonly toolbarStatus: ToolbarStatus;

  /** Toolbar placement, presentation, and registration policy. */
  readonly toolbar: Toolbar;
}

/**
 * Owns application toolbar action registrations and their command/status bindings.
 * The Toolbar continues to own placement and presentation policy.
 */
export class ToolbarContributions {

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ToolbarContributionsServices;

  /** Registered toolbar contributions retained across presentation changes. */
  readonly toolbarActions: ShallowReactive<ToolbarAction[]>;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ToolbarContributionsServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.registerToolbarAction = this.registerToolbarAction.bind(this);

    this.toolbarActions = shallowReactive<ToolbarAction[]>([]);
  }

  /** Registers a toolbar action and its command/status integration. */
  registerToolbarAction(action: ToolbarAction) {
    if (this.toolbarActions.some((item) => item.id === action.id))
      throw new Error(`Toolbar action already registered: ${action.id}`);
    if (action.placement && !validToolbarPlacement(action.placement))
      throw new Error(`Invalid toolbar placement: ${action.id}`);
    const definition = reactive({
      ...action,
      placement: action.placement
        ? Object.freeze({...action.placement})
        : undefined,
      icon: action.icon ? markRaw(action.icon) : undefined,
      visible: action.visible ?? false,
    });
    const removeCommand = this.services.commands.get(action.id)
      ? undefined
      : this.services.commands.register({
          id: action.id,
          label: action.label,
          feature: action.id.startsWith('frame.') ? 'shell' : 'application',
          quickInput: action.id.startsWith('frame.') ? '>' : true,
          available: () => definition.feature?.enabled !== false,
          enabled: () => !definition.disabled,
          run: action.run,
        });
    definition.run = () => {
      void this.services.commands.execute(action.id);
    };
    let removeStatus: () => void;
    try {
      removeStatus = this.services.toolbarStatus.registerAction(definition);
    } catch (error) {
      removeCommand?.();
      throw error;
    }
    this.toolbarActions.push(definition);
    return () => {
      const index = this.toolbarActions.indexOf(definition);
      if (index >= 0) {
        removeStatus();
        this.services.toolbar.forgetAction(action.id);
        this.toolbarActions.splice(index, 1);
        removeCommand?.();
      }
    };
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.toolbarActions.splice(0);
  }
}
