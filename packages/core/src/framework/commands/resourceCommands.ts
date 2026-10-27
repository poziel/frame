import type {Workspace} from '../workspace/workspace';
import type {FrameThemeController} from '../../themes/runtime/frameThemeController';
import type {CommandRegistry} from './commandRegistry';
import type {CommandOptions as Command} from './command';
import type {ComputedRef, ShallowReactive} from 'vue';
import {computed, effectScope, shallowReactive} from 'vue';
import type {ViewRegistry} from '../views/viewRegistry';

/** Narrow dependencies connected by the owning Frame instance. */
export interface ResourceCommandsServices {

  /** Owns registered shell views, hierarchy, visibility, selection, and movement. */
  readonly viewRegistry: ViewRegistry;

  /** Authoritative command registration, discovery, and guarded execution. */
  readonly commands: CommandRegistry;

  /** Theme selection, token application, and owned theme attachments. */
  readonly theme: FrameThemeController;

  /** Workspace panes, tabs, focus, and content registration. */
  readonly workspace: Workspace;
}

/**
 * Owns resource-derived command definitions and their presentation labels.
 * The CommandRegistry remains the authority for live registration, restrictions, and execution.
 */
export class ResourceCommands {

  /** Observers belong to this service rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: ResourceCommandsServices;

  /** Host command definitions awaiting registry projection. */
  readonly commandMap: ShallowReactive<Map<string, Command>>;

  /** Reactive commands generated from registered resources and themes. */
  readonly generatedCommands: ComputedRef<Command[]>;

  /** Combined host and generated definitions supplied to the command registry. */
  readonly commandDefinitions: ComputedRef<Command[]>;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: ResourceCommandsServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.registerCommandDefinition = this.registerCommandDefinition.bind(this);

    this.commandMap = shallowReactive(new Map<string, Command>());
    this.generatedCommands = this.scope.run(() =>
      computed<Command[]>(() => [
        ...[...this.services.viewRegistry.viewMap.values()].map((view) => ({
          id: `frame.view.select.${view.id}`,
          label: `View: Select ${view.label}`,
          feature: () =>
            this.services.viewRegistry.regionFeature(
              this.services.viewRegistry.viewRegion(view.id)
            ),
          quickInput: false,
          enabled: () =>
            this.services.commands.isEnabled(
              this.services.viewRegistry.getViewCommand(view.id) ?? ''
            ),
          run: () => {
            if (this.services.viewRegistry.getViewParent(view.id))
              this.services.viewRegistry.openView(view.id);
            else if (
              this.services.viewRegistry.viewRegion(view.id) === 'primary'
            )
              this.services.viewRegistry.selectSideView(view.id);
            else if (
              this.services.viewRegistry.viewRegion(view.id) === 'secondary'
            )
              this.services.viewRegistry.selectSecondaryView(view.id);
            else this.services.viewRegistry.openBottomPanel(view.id);
          },
        })),
        ...this.services.theme.available.value.map((definition) => ({
          id: `frame.theme.select.${definition.id}`,
          label: `Theme: ${definition.name}`,
          commandCenter: false,
          feature: 'theme',
          scope: 'frame' as const,
          run: () => this.services.theme.set(definition),
        })),
        ...this.services.workspace.tabs.value.map((tab) => ({
          id: `frame.workspace.activate.${tab.id}`,
          label: `Workspace: Activate ${tab.title}`,
          icon: tab.icon,
          feature: 'workspace',
          scope: 'frame' as const,
          run: () => {
            this.services.workspace.activateTab(tab.id, 'api');
          },
        })),
      ])
    )!;
    this.commandDefinitions = this.scope.run(() =>
      computed(() => {
        const names = new Map<string, string[]>();
        for (const view of this.services.viewRegistry.viewMap.values()) {
          const name = view.label.trim().toLowerCase();
          names.set(name, [...(names.get(name) ?? []), view.id]);
        }
        const presentations = new Map<
          string,
          {
            label: string;
            icon?: import('vue').Component;
          }
        >();
        const regions = {
          primary: 'Primary sidebar',
          secondary: 'Secondary sidebar',
          bottom: 'Panel',
        };
        for (const view of this.services.viewRegistry.viewMap.values()) {
          const peers = names.get(view.label.trim().toLowerCase())!;
          let suffix = '';
          if (peers.length > 1) {
            const region = this.services.viewRegistry.viewRegion(view.id)!;
            let location = regions[region];
            if (
              peers.filter(
                (id) => this.services.viewRegistry.viewRegion(id) === region
              ).length > 1
            ) {
              const parents: string[] = [];
              let parent = this.services.viewRegistry.viewParents.get(view.id);
              while (parent) {
                parents.unshift(
                  this.services.viewRegistry.viewMap.get(parent)!.label
                );
                parent = this.services.viewRegistry.viewParents.get(parent);
              }
              // Include the parent path and stable ID for duplicates within one region.
              location += ` / ${[...parents, view.id].join(' / ')}`;
            }
            suffix = ` (${location})`;
          }
          presentations.set(
            this.services.viewRegistry.viewCommands.get(view.id)!,
            {
              label: `View: ${view.label}${suffix}`,
              icon: view.icon,
            }
          );
        }
        return [...this.commandMap.values()]
          .map((command) => ({...command, ...presentations.get(command.id)}))
          .concat(
            this.generatedCommands.value.filter(
              (command) => !this.commandMap.has(command.id)
            )
          );
      })
    )!;
  }

  /** Adds a host command definition and returns exact-registration cleanup. */
  registerCommandDefinition(command: Command) {
    if (this.commandMap.has(command.id))
      throw new Error(`Command already registered: ${command.id}`);
    const definition = {...command, feature: command.feature ?? 'application'};
    this.commandMap.set(command.id, definition);
    return () => {
      if (this.commandMap.get(command.id) === definition)
        this.commandMap.delete(command.id);
    };
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.commandMap.clear();
    this.scope.stop();
  }
}
