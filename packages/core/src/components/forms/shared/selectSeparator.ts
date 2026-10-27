import {SelectItem} from './selectItem';

/**
 * A structural boundary between select options.
 *
 * Separators have stable identities for rendering but carry no selectable
 * value. The type discriminator distinguishes them from value-bearing rows.
 */
export class SelectSeparator extends SelectItem {

  /** Identifies this row as a non-selectable separator. */
  readonly type = 'separator' as const;

  /** Stable rendering identifier within the option list. */
  id: string;

  /** Creates a structural row with the supplied rendering identity. */
  constructor(id: string) {
    super();
    this.id = id;
  }
}
