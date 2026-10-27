import type {SplitterPanelProps} from 'reka-ui';

/**
 * One FrameSplitter panel with the existing Reka sizing and identity props.
 * Frame consumes label and content for its fallback presentation and forwards
 * the remaining properties to the panel primitive unchanged.
 */
export interface FrameSplitPanel extends SplitterPanelProps {

  /** Resize-handle name and fallback panel text when content is omitted. */
  label?: string;

  /** Fallback text displayed when the panel slot is not supplied. */
  content?: string;
}
