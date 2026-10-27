import type {FeatureRegistry} from '../features/featureRegistry';
import type {CommandRegistry} from './commandRegistry';
import type {
  QuickPickItem,
  QuickPickOptions,
} from '../../components/framework/quickPick';
import type {ComputedRef, ShallowRef} from 'vue';
import {computed, effectScope, shallowRef} from 'vue';

/** One active command-discovery or explicit-choice request owned by Frame. */
export interface FramePickerRequest {

  /** Monotonic identity used to distinguish replacement requests. */
  id: number;

  /** Heading displayed by the picker surface. */
  title: string;

  /** Search hint for the current request. */
  placeholder: string;

  /** Command discovery destination, or explicit caller-provided choices. */
  mode: 'application' | 'frame' | 'pick';

  /** Optional prefix selecting a registered command discovery category. */
  category?: string;

  /** Whether this choice screen offers text filtering. */
  searchable?: boolean;

  /** Search text restored when returning to a parent submenu. */
  initialQuery?: string;

  /** Keyboard highlight restored when returning to a parent submenu. */
  initialSelectedId?: string;

  /** Receives search and selection updates for nested navigation restoration. */
  onStateChange?: QuickPickOptions['onStateChange'];

  /** Explicit choices; null uses live command discovery instead. */
  items: readonly QuickPickItem[] | null;

  /** Resolves selection or cancellation for this exact request. */
  finish: (item?: QuickPickItem) => void;
}

/** Narrow dependencies connected by the owning Frame instance. */
export interface QuickInputControllerServices {

  /** Authoritative command registration, discovery, and guarded execution. */
  readonly commands: CommandRegistry;

  /** Feature availability shared by shell presentation and execution guards. */
  readonly features: FeatureRegistry;

  /** Bound registry execution path shared by picker and host calls. */
  readonly executeCommand: CommandRegistry['execute'];
}

/**
 * Owns command discovery and explicit picker requests.
 * Replacement, acceptance, and disposal settle the exact pending request without creating a second command registry.
 */
export class QuickInputController {

  /** Observers belong to this service rather than a caller's temporary scope. */
  private readonly scope = effectScope(true);

  /** Explicit peer services; domain state remains owned by this class. */
  private readonly services: QuickInputControllerServices;

  /** Current picker request and its completion callback, or null. */
  readonly quickInput: ShallowRef<FramePickerRequest | null>;

  /** Monotonic identity for picker requests. */
  private requestId: number;

  /** Command discovery rows projected from current registry state. */
  private readonly commandItems: ComputedRef<QuickPickItem[]>;

  /** Live picker rows for the current category or explicit choice request. */
  readonly quickInputItems: ComputedRef<QuickPickItem[]>;

  /** Creates this service with explicit dependencies supplied by Frame. */
  constructor(services: QuickInputControllerServices) {
    this.services = services;
    this.dispose = this.dispose.bind(this);
    this.closeQuickInput = this.closeQuickInput.bind(this);
    this.openQuickInput = this.openQuickInput.bind(this);
    this.openCommands = this.openCommands.bind(this);
    this.setQuickInputMode = this.setQuickInputMode.bind(this);
    this.showQuickPick = this.showQuickPick.bind(this);
    this.acceptQuickInput = this.acceptQuickInput.bind(this);

    this.quickInput = shallowRef<FramePickerRequest | null>(null);
    this.requestId = 0;
    this.commandItems = this.scope.run(() =>
      computed<QuickPickItem[]>(() =>
        this.services.commands
          .list()
          .filter(
            (command) =>
              this.services.commands.isVisible(command.id) &&
              this.services.commands.category(command) !== false &&
              this.services.commands.category(command) ===
                (this.quickInput.value?.category ??
                  (this.quickInput.value?.mode === 'frame' ? '>' : '')) &&
              (!this.services.commands.category(command) ||
                !!this.services.commands.prefixes.get(
                  this.services.commands.category(command) as string
                ))
          )
          .map((command) => ({
            id: command.id,
            icon: command.icon,
            label: command.label,
            detail: command.detail,
            shortcut: command.shortcut,
            disabled: !this.services.commands.isEnabled(command.id),
          }))
      )
    )!;
    this.quickInputItems = this.scope.run(() =>
      computed(
        () =>
          this.quickInput.value?.items?.filter(
            (item) => item.available?.() !== false
          ) ?? this.commandItems.value
      )
    )!;
  }

  /** Cancels the current picker and resolves any pending selection. */
  closeQuickInput() {
    const current = this.quickInput.value;
    this.quickInput.value = null;
    current?.finish();
  }

  /** Opens live command discovery for an application or prefix category. */
  openQuickInput(destination: string = 'application') {
    if (!this.services.features.isAvailable('shell')) return;
    const category =
      destination === 'frame'
        ? '>'
        : destination === 'application'
          ? ''
          : destination;
    const definition = category
      ? this.services.commands.prefixes.get(category)
      : undefined;
    if (category && !definition)
      throw new Error('Unknown command category: ' + category);
    const mode = category === '>' ? 'frame' : 'application';
    this.closeQuickInput();
    this.quickInput.value = {
      id: ++this.requestId,
      mode,
      category,
      title: definition?.label ?? 'Quick pick',
      placeholder:
        definition?.placeholder ??
        (category
          ? 'Search ' + definition!.label + '…'
          : 'Search application…'),
      items: null,
      finish: (item) => {
        if (item) void this.services.executeCommand(item.id);
      },
    };
  }

  /** Opens Frame command discovery using its reserved prefix. */
  openCommands() {
    this.openQuickInput('frame');
  }

  /** Switches a live command request between registered prefix categories. */
  setQuickInputMode(destination: string) {
    if (!this.quickInput.value || this.quickInput.value.mode === 'pick') return;
    const category =
      destination === 'frame'
        ? '>'
        : destination === 'application'
          ? ''
          : destination;
    const definition = category
      ? this.services.commands.prefixes.get(category)
      : undefined;
    if (category && !definition) return;
    this.quickInput.value = {
      ...this.quickInput.value,
      mode: category === '>' ? 'frame' : 'application',
      category,
      title: definition?.label ?? 'Quick pick',
      placeholder:
        definition?.placeholder ??
        (category
          ? 'Search ' + definition!.label + '…'
          : 'Search application…'),
    };
  }

  /** Opens explicit typed choices and resolves selection or cancellation. */
  showQuickPick<T extends QuickPickItem>(
    items: readonly T[],
    options: QuickPickOptions = {}
  ): Promise<T | undefined> {
    if (new Set(items.map((item) => item.id)).size !== items.length)
      throw new Error('Quick pick item IDs must be unique');
    this.closeQuickInput();
    return new Promise((resolve) => {
      this.quickInput.value = {
        id: ++this.requestId,
        mode: 'pick',
        ...options,
        title: options.title ?? 'Choose an action',
        placeholder: options.placeholder ?? 'Type to filter…',
        items,
        finish: (item) =>
          resolve(items.find((candidate) => candidate.id === item?.id)),
      };
    });
  }

  /** Accepts an available selectable row from the current picker request. */
  acceptQuickInput(id: string) {
    const item = this.quickInputItems.value.find(
      (candidate) => candidate.id === id
    );
    if (
      !item ||
      item.disabled ||
      item.type === 'separator' ||
      item.type === 'heading'
    )
      return;
    const current = this.quickInput.value;
    this.quickInput.value = null;
    current?.finish(item);
  }

  /** Releases state and subscriptions owned by this service. */
  dispose(): void {
    this.closeQuickInput();
    this.scope.stop();
  }
}
