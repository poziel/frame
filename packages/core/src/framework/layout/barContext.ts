import type {FrameMenuItem} from '../../components/navigation/generalMenu';

/** Context entry targeted by common bar editing actions. */
export interface BarContextTarget {

  /** Whether the target is a presentation-only separator. */
  separator?: boolean;

  /** Accessible label used by the hide action. */
  label: string;

  /** Whether the separator may be removed by the user. */
  allowRemove?: boolean;

  /** Current badge presentation used to label the toggle action. */
  badgeVisible?: boolean;

  /** Whether an earlier insertion position exists. */
  earlier: boolean;

  /** Whether a later insertion position exists. */
  later: boolean;
}

/** Input for the stateless common bar-context action builder. */
export interface BarContextOptions {

  /** Whether this menu offers separator creation. */
  allowAddSeparator: boolean;

  /** Optional row or separator receiving contextual actions. */
  target?: BarContextTarget;
}

/** Common edit actions; each bar appends its own placement and content actions. */
export function barContextActions(options: BarContextOptions): FrameMenuItem[] {
  const items: FrameMenuItem[] = [],
    target = options.target;
  const divider = () => {
    if (items.length && items[items.length - 1]?.type !== 'separator')
      items.push({id: `edit-divider-${items.length}`, type: 'separator'});
  };
  if (options.allowAddSeparator)
    items.push({id: 'add-separator', label: 'Add Separator'});
  if (target?.separator) {
    if (target.allowRemove)
      items.push({id: 'delete-separator', label: 'Delete Separator'});
    divider();
  } else {
    divider();
    if (target)
      items.push(
        {id: 'hide', label: `Hide '${target.label}'`},
        {id: 'badge', label: target.badgeVisible ? 'Hide Badge' : 'Show Badge'}
      );
  }
  if (target)
    items.push(
      {id: 'earlier', label: 'Move Earlier', disabled: !target.earlier},
      {id: 'later', label: 'Move Later', disabled: !target.later}
    );
  divider();
  return items;
}
