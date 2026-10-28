import {toRef, useAttrs} from 'vue';

/** Shared tooltip options for independent controls. */
export interface ControlTooltipProps {

  /** Tooltip text; false disables it. When omitted, the native title attribute is used. */
  tooltip?: string | false;

  /** Preferred tooltip side; positioning falls back when space is limited. */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

/** Optional shared tooltip contract. Native title is accepted as a migration alias. */
export function useControlTooltip(props: ControlTooltipProps) {
  const attrs = useAttrs();
  return {
    tooltipText: toRef(() =>
      props.tooltip === false
        ? false
        : (props.tooltip ??
          (typeof attrs.title === 'string' ? attrs.title : undefined))
    ),
    controlAttrs: toRef(() =>
      Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'title')
      )
    ),
    describedBy: (id?: string) =>
      [attrs['aria-describedby'], id].filter(Boolean).join(' ') || undefined,
  };
}
