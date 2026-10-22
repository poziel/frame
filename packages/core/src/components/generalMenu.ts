export interface FrameGeneralMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  shortcut?: string;
  /** Add a separator before this action. */
  separator?: boolean;
}

import type { FrameMenuItem } from '../types';
export function normalizeMenuItems(items: readonly (FrameGeneralMenuItem | FrameMenuItem)[]): FrameMenuItem[] {
 return items.flatMap(item => 'separator' in item && item.separator ? [{id:item.id+'-separator',type:'separator' as const},item as FrameMenuItem] : [item as FrameMenuItem]);
}
