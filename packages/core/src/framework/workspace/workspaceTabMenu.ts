import type {FrameMenuItem} from '../../components/navigation/generalMenu';
import type {WorkspaceSplitDirection} from './workspaceTypes';
import type {Workspace} from './workspace';

/**
 * Connects a pane's tab context menu to its owning workspace controller.
 * Entries are derived from current immutable snapshots; selection delegates
 * to existing close, move, pin, split, and presentation policy operations.
 */
export class WorkspaceTabMenu {

  /** Workspace owning the tab registrations and operation policies. */
  private readonly workspace: Workspace;

  /** Retains the owning workspace without registering extra tabs or listeners. */
  constructor(workspace: Workspace) {
    this.workspace = workspace;
    this.items = this.items.bind(this);
    this.select = this.select.bind(this);
  }

  /** Builds current tab actions from shared workspace permissions and policies. */
  items(paneId: string, tabId: string): readonly FrameMenuItem[] {
    const workspace = this.workspace;
    const local = workspace.tabs.value.filter((t) => t.paneId === paneId);
    const tab = local.find((t) => t.id === tabId);
    if (!tab) return [];
    const at = local.indexOf(tab);
    const closeSets = {
      close: [tab],
      others: local.filter((t) => t.id !== tabId),
      right: local.slice(at + 1),
      left: local.slice(0, at),
      all: local,
    };
    const labels = {
      close: 'Close',
      others: 'Close others',
      right: 'Close to the right',
      left: 'Close to the left',
      all: 'Close all',
    };
    const defaults: FrameMenuItem[] = Object.entries(closeSets).map(
      ([id, candidates]) => {
        const eligible = candidates.filter(
          (t) => !t.pinned && t.closable !== false
        );
        return {
          id: `tab.${id}`,
          label: labels[id as keyof typeof labels],
          disabled:
            !eligible.length ||
            !workspace.tabOptions(paneId).allowClose ||
            (workspace.tabOptions(paneId).lastTab !== 'allow-empty' &&
              eligible.length === local.length),
        };
      }
    );
    defaults.push(
      {id: 'tab.separator', type: 'separator'},
      {id: 'tab.pin', label: tab.pinned ? 'Unpin' : 'Pin'},
      {
        id: 'tab.split',
        label: 'Split',
        children: (['right', 'left', 'up', 'down'] as const).map((d) => ({
          id: `tab.split.${d}`,
          label: `Split ${d}`,
          disabled: !workspace.canSplit(paneId),
        })),
      },
      {
        id: 'tab.move',
        label: 'Move',
        children: [
          ...workspace.panes.value
            .filter((p) => p.id !== paneId)
            .map((p) => ({
              id: `tab.move.${p.id}`,
              label: p.label,
              disabled: !workspace.canMoveTab(tabId, p.id),
            })),
          ...(['right', 'left', 'up', 'down'] as const).map((d) => ({
            id: `tab.neworkspace.${d}`,
            label: `New pane ${d}`,
            disabled:
              !workspace.canSplit(paneId) ||
              !workspace.tabOptions(paneId).allowMove ||
              tab.movable === false,
          })),
        ],
      }
    );
    if (!workspace.options.allowPaneCreation) {
      const split = defaults.findIndex((item) => item.id === 'tab.split');
      if (split >= 0) defaults.splice(split, 1);
      const move = defaults.findIndex((item) => item.id === 'tab.move');
      if (move >= 0) {
        const item = defaults[move];
        if (item && item.type !== 'separator') {
          const children =
            item.children?.filter((child) =>
              child.id.startsWith('tab.move.')
            ) ?? [];
          if (children.length) defaults[move] = {...item, children};
          else defaults.splice(move, 1);
        }
      }
    }
    defaults.push({
      id: 'tab.display',
      label: 'Tab Display',
      children: (
        [
          {id: 'icons', label: 'Icons Only'},
          {id: 'text', label: 'Text Only'},
          {id: 'both', label: 'Icons and Text'},
        ] as const
      ).map((mode) => ({
        id: `tab.display.${mode.id}`,
        label: mode.label,
        checked: (workspace.tabOptions(paneId).display ?? 'both') === mode.id,
      })),
    });
    return (
      workspace.tabOptions(paneId).contextMenu?.({paneId, tabId}, defaults) ??
      defaults
    );
  }

  /** Routes a menu action through the same guarded pane and tab operations as APIs. */
  select(paneId: string, tabId: string, id: string) {
    const workspace = this.workspace;
    const local = workspace.tabs.value.filter((t) => t.paneId === paneId);
    const tab = local.find((t) => t.id === tabId);
    if (!tab) return;
    const at = local.indexOf(tab);
    const operation = id.slice(4);
    const candidates =
      operation === 'close'
        ? [tab]
        : operation === 'others'
          ? local.filter((t) => t.id !== tabId)
          : operation === 'right'
            ? local.slice(at + 1)
            : operation === 'left'
              ? local.slice(0, at)
              : operation === 'all'
                ? local
                : undefined;
    if (candidates) {
      void workspace.closeTabs(
        candidates
          .filter((t) => !t.pinned && t.closable !== false)
          .map((t) => t.id),
        'menu'
      );
      return;
    }
    if (operation.startsWith('display.')) {
      const display = operation.slice(8);
      if (display === 'icons' || display === 'text' || display === 'both')
        workspace.configurePaneTabs(paneId, {display});
    }
    if (operation === 'pin') workspace.setTabPinned(tabId, !tab.pinned, 'menu');
    if (operation.startsWith('split.') && workspace.canSplit(paneId))
      workspace.split(operation.slice(6) as WorkspaceSplitDirection, paneId);
    if (operation.startsWith('move.'))
      workspace.moveTab(tabId, operation.slice(5), undefined, 'menu');
    if (operation.startsWith('neworkspace.'))
      workspace.moveTabToNewPane(
        tabId,
        operation.slice(4) as WorkspaceSplitDirection,
        'menu'
      );
  }
}
