/** Recursive tree data accepted by FrameTree and its custom item slot. */
export interface FrameTreeItem {

  /** Default rendering and selection key, unless getKey overrides it. */
  id: string;

  /** Visible label in the default tree row. */
  label: string;

  /** Optional row icon, independent of the expansion indicator. */
  icon?: string;

  /** Disables interaction with this item through the underlying tree primitive. */
  disabled?: boolean;

  /** Descendants consumed by the tree's item-flattening behavior. */
  children?: FrameTreeItem[];
}
