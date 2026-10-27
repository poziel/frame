import type {SelectOption} from './selectOption';
import type {SelectSeparator} from './selectSeparator';

/**
 * Runtime base for select options and separators.
 *
 * The constructor supports shared instanceof checks. Its companion type is a
 * structural union, so existing plain-object options and separators remain
 * accepted and consumers can narrow them using the separator discriminator.
 */
export const SelectItem = class SelectItem {};

/** Value-bearing option or non-selectable separator, including plain objects. */
export type SelectItem = SelectOption | SelectSeparator;
