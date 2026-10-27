/** Whether a bar presents icons, text, or both. */
export type BarDisplay = 'icons' | 'text' | 'both';

/** Default or compact bar sizing. */
export type BarSize = 'default' | 'compact';

/** View-selector display contract shared with other bars. */
export type ViewBarDisplay = BarDisplay;

/** View-selector sizing contract shared with other bars. */
export type ViewBarSize = BarSize;

/** Textual or numeric content displayed on a view badge. */
export type ViewBadge = string | number;
