import type {Component} from 'vue';

/** One selectable choice, structural row, or nested submenu presented by QuickPick. */
export interface QuickPickItem {

  /** Optional live availability for explicit command projections. */
  available?: () => boolean;

  /** Structural rows are not selectable. */
  type?: 'item' | 'separator' | 'heading' | 'submenu';

  /** Inline secondary text. */
  description?: string;

  /** Trailing category annotation. */
  sectionLabel?: string;

  /** Marks the current choice independently of keyboard highlight. */
  selected?: boolean;

  /** Nested choices, opened by the Command Center. */
  items?: readonly QuickPickItem[];

  /** Whether this nested submenu offers text filtering. */
  searchable?: boolean;

  /** Optional local action for non-command choices. */
  run?: () => void | Promise<void>;

  /** Independently accessible row actions. */
  actions?: readonly {
    /** Stable identity used to address this contribution. */
    id: string;
    /** Human-readable name displayed by the owning surface. */
    label: string;
    /** Optional icon rendered beside the contribution. */
    icon?: string;
    /** Application callback invoked when the action is activated. */
    run: () => void | Promise<void>;
  }[];

  /** Stable identity used to address this contribution. */
  id: string;

  /** Optional icon rendered beside the contribution. */
  icon?: string | Component;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional secondary text retained with this entry. */
  detail?: string;

  /** Shortcut text displayed with this choice. */
  shortcut?: string;

  /** Whether user interaction with this entry is currently blocked. */
  disabled?: boolean;
}

/** Search and selection presentation supplied to a Frame-owned QuickPick request. */
export interface QuickPickOptions {

  /** Controls text filtering; defaults to true. */
  searchable?: boolean;

  /** Restores navigation state when returning to a submenu. */
  initialQuery?: string;

  /** Restores keyboard highlight when returning to a submenu. */
  initialSelectedId?: string;

  /** Reports state to the owning navigation controller. */
  onStateChange?: (state: {query: string; selectedId: string}) => void;

  /** Heading displayed by the owning presentation. */
  title?: string;

  /** Hint displayed when the input or search field is empty. */
  placeholder?: string;
}
