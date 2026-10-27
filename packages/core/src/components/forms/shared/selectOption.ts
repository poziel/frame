import {SelectItem} from './selectItem';

/**
 * A value-bearing row in a select control.
 *
 * Unlike a separator, this item can become the selected value unless disabled.
 * Plain objects with the same public properties remain valid select inputs.
 *
 * @example
 * new SelectOption({value: 'dark', label: 'Dark', description: 'Low light'});
 */
export class SelectOption extends SelectItem {

  /** Value returned when the option is selected. */
  value: string;

  /** Primary text displayed in the selection list. */
  label: string;

  /** Optional secondary text displayed beside the label. */
  description?: string;

  /** Optional supporting text for a longer explanation. */
  detail?: string;

  /** Prevents selection without hiding the option. */
  disabled?: boolean;

  /** Copies option content into an independently editable select item. */
  constructor(options: SelectOptionOptions) {
    super();
    this.value = options.value;
    this.label = options.label;
    this.description = options.description;
    this.detail = options.detail;
    this.disabled = options.disabled;
  }
}

/** Initial content and availability of one selectable value. */
export interface SelectOptionOptions {

  /** Value returned when the option is selected. */
  value: string;

  /** Primary text displayed in the selection list. */
  label: string;

  /** Optional secondary text displayed beside the label. */
  description?: string;

  /** Optional supporting text for a longer explanation. */
  detail?: string;

  /** Prevents selection while retaining the option in the list. */
  disabled?: boolean;
}
