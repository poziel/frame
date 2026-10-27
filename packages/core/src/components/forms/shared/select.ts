import type {SelectItem} from './selectItem';
import type {SelectOption} from './selectOption';
export function isSelectOption(
  item: SelectItem | undefined
): item is SelectOption { return !!item && !("type" in item && item.type === "separator"); }
export function selectableOptions(items: readonly SelectItem[]) { return items.flatMap((
  item,
  index
) => isSelectOption(item) && !item.disabled ? [index] : []); }
