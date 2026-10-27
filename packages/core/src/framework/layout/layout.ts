import type {ViewBarDisplay} from '../views/primaryViewBar';
import type {
  SecondaryViewBarDisplay,
  SecondaryViewBarSize,
} from '../views/secondaryViewBar';

/** Physical edge occupied by the panel. */
export type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

/** Display style for panel selectors. */
export type PanelDisplay = 'icons' | 'text' | 'both';

/** Physical horizontal coverage for a panel or banner. */
export type PanelAlignment = 'left' | 'right' | 'center' | 'justify';

/** Session-only preferences describing one shell arrangement. */
export interface LayoutState {

  /** Placement of the Manage action on its owning bar. */
  manageButtonPosition: 'top' | 'bottom';

  /** Shell region maximized within the workbench, or null. */
  maximizedRegion: 'secondary' | 'bottom' | null;

  /** Presentation visibility for navigation. */
  navigationVisible: boolean;

  /** Presentation visibility for menuBar. */
  menuBarVisible: boolean;

  /** Presentation visibility for primaryViewBar. */
  primaryViewBarVisible: boolean;

  /** Placement of primaryViewBar relative to its shell region. */
  primaryViewBarPosition: 'default' | 'top' | 'bottom';

  /** Default or compact presentation size for primaryViewBar. */
  primaryViewBarSize: 'default' | 'compact';

  /** Icon and text presentation for primaryViewBar. */
  primaryViewBarDisplay: ViewBarDisplay;

  /** Presentation visibility for primarySidebar. */
  primarySidebarVisible: boolean;

  /** Presentation visibility for secondarySidebar. */
  secondarySidebarVisible: boolean;

  /** Presentation visibility for secondaryViewBar. */
  secondaryViewBarVisible: boolean;

  /** Placement of secondaryViewBar relative to its shell region. */
  secondaryViewBarPosition: 'default' | 'top' | 'bottom';

  /** Icon and text presentation for secondaryViewBar. */
  secondaryViewBarDisplay: SecondaryViewBarDisplay;

  /** Default or compact presentation size for secondaryViewBar. */
  secondaryViewBarSize: SecondaryViewBarSize;

  /** Presentation visibility for panelViewBar. */
  panelViewBarVisible: boolean;

  /** Default or compact presentation size for panelViewBar. */
  panelViewBarSize: 'default' | 'compact';

  /** Presentation visibility for panel. */
  panelVisible: boolean;

  /** Presentation visibility for statusBar. */
  statusBarVisible: boolean;

  /** Presentation visibility for banner. */
  bannerVisible: boolean;

  /** Physical horizontal coverage of banner. */
  bannerAlignment: PanelAlignment;

  /** Preferred workspace banner height in pixels. */
  bannerHeight: number;

  /** Physical edge occupied by the primary sidebar and its paired bar. */
  primarySide: 'left' | 'right';

  /** Physical horizontal coverage of panel. */
  panelAlignment: PanelAlignment;

  /** Placement of panel relative to its shell region. */
  panelPosition: PanelPosition;

  /** Icon and text presentation for panelViewBar. */
  panelViewBarDisplay: PanelDisplay;

  /** Vertical placement of the command and choice picker. */
  quickInputPosition: 'top' | 'center';

  /** Spacing density shared by shell regions. */
  density: 'default' | 'compact';

  /** Whether the workspace uses the centered-width presentation. */
  centered: boolean;

  /** Whether Frame is presenting the shell in Zen Mode. */
  zenMode: boolean;

  /** Preferred primary sidebar width in pixels. */
  primaryWidth: number;

  /** Preferred secondary sidebar width in pixels. */
  secondaryWidth: number;

  /** Preferred horizontal panel height in pixels. */
  panelHeight: number;

  /** Preferred vertical panel width in pixels. */
  panelWidth: number;

  /** Preferred workspace proportion in centered layout. */
  centeredRatio: number;
}

/**
 * Mutable layout preferences for one Frame, with instance geometry operations.
 * The root Frame supplies reactivity and feature guards; calculations preserve
 * preferred sizes when the available viewport requires temporary clamping.
 */
export class Layout implements LayoutState {

  /** Placement of the Manage action on its owning bar. */
  manageButtonPosition: 'top' | 'bottom' = 'bottom';

  /** Shell region maximized within the workbench, or null. */
  maximizedRegion: 'secondary' | 'bottom' | null = null;

  /** Presentation visibility for navigation. */
  navigationVisible: boolean = true;

  /** Presentation visibility for menuBar. */
  menuBarVisible: boolean = true;

  /** Presentation visibility for primaryViewBar. */
  primaryViewBarVisible: boolean = true;

  /** Placement of primaryViewBar relative to its shell region. */
  primaryViewBarPosition: 'default' | 'top' | 'bottom' = 'default';

  /** Default or compact presentation size for primaryViewBar. */
  primaryViewBarSize: 'default' | 'compact' = 'default';

  /** Icon and text presentation for primaryViewBar. */
  primaryViewBarDisplay: ViewBarDisplay = 'icons';

  /** Presentation visibility for primarySidebar. */
  primarySidebarVisible: boolean = false;

  /** Presentation visibility for secondarySidebar. */
  secondarySidebarVisible: boolean = false;

  /** Presentation visibility for secondaryViewBar. */
  secondaryViewBarVisible: boolean = true;

  /** Placement of secondaryViewBar relative to its shell region. */
  secondaryViewBarPosition: 'default' | 'top' | 'bottom' = 'top';

  /** Icon and text presentation for secondaryViewBar. */
  secondaryViewBarDisplay: SecondaryViewBarDisplay = 'both';

  /** Default or compact presentation size for secondaryViewBar. */
  secondaryViewBarSize: SecondaryViewBarSize = 'default';

  /** Presentation visibility for banner. */
  bannerVisible: boolean = false;

  /** Physical horizontal coverage of banner. */
  bannerAlignment: PanelAlignment = 'center';

  /** Preferred workspace banner height in pixels. */
  bannerHeight: number = 100;

  /** Presentation visibility for panelViewBar. */
  panelViewBarVisible: boolean = true;

  /** Default or compact presentation size for panelViewBar. */
  panelViewBarSize: 'default' | 'compact' = 'default';

  /** Presentation visibility for panel. */
  panelVisible: boolean = false;

  /** Presentation visibility for statusBar. */
  statusBarVisible: boolean = true;

  /** Physical edge occupied by the primary sidebar and its paired bar. */
  primarySide: 'left' | 'right' = 'left';

  /** Physical horizontal coverage of panel. */
  panelAlignment: PanelAlignment = 'center';

  /** Placement of panel relative to its shell region. */
  panelPosition: PanelPosition = 'bottom';

  /** Icon and text presentation for panelViewBar. */
  panelViewBarDisplay: PanelDisplay = 'both';

  /** Vertical placement of the command and choice picker. */
  quickInputPosition: 'top' | 'center' = 'top';

  /** Spacing density shared by shell regions. */
  density: 'default' | 'compact' = 'default';

  /** Whether the workspace uses the centered-width presentation. */
  centered: boolean = false;

  /** Whether Frame is presenting the shell in Zen Mode. */
  zenMode: boolean = false;

  /** Preferred primary sidebar width in pixels. */
  primaryWidth: number = 236;

  /** Preferred secondary sidebar width in pixels. */
  secondaryWidth: number = 280;

  /** Preferred horizontal panel height in pixels. */
  panelHeight: number = 240;

  /** Preferred vertical panel width in pixels. */
  panelWidth: number = 320;

  /** Preferred workspace proportion in centered layout. */
  centeredRatio: number = 0.9;

  /** Creates the default session-only shell arrangement. */
  constructor() {}

  /** Calculates shell tracks without changing preferred dimensions. */
  geometry(
    width: number,
    height: number,
    measurements: ViewBarMeasurements = {}
  ) {
    return layoutGeometry(this, width, height, measurements);
  }

  /** Calculates the currently maximized region without covering protected rails. */
  maximizedBounds(
    width: number,
    height: number,
    measurements: ViewBarMeasurements = {}
  ) {
    return maximizedRegionBounds(this, width, height, measurements);
  }
}

/** Creates independent default preferences for plain-data and geometry consumers. */
export function defaultLayout(): LayoutState {
  return new Layout();
}
/** Clamps a dimension without allowing an inverted maximum below its minimum. */
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

/** Optional measured view-bar dimensions used instead of default size estimates. */
export interface ViewBarMeasurements {

  /** Measured primary view-bar width or height, overriding the size estimate. */
  primary?: {width?: number; height?: number};

  /** Measured secondary view-bar width or height, overriding the size estimate. */
  secondary?: {width?: number; height?: number};
}

/** Calculates maximized bounds while preserving protected view-bar rails. */
export function maximizedRegionBounds(
  layout: LayoutState,
  width: number,
  height: number,
  measurements: ViewBarMeasurements = {}
) {
  const region = layout.maximizedRegion;
  if (
    !region ||
    (region === 'bottom'
      ? !layout.panelVisible
      : !layout.secondarySidebarVisible)
  )
    return undefined;
  const g = layoutGeometry(layout, width, height, measurements);
  const verticalPanel =
    region === 'bottom' &&
    (layout.panelPosition === 'left' || layout.panelPosition === 'right');
  const primary =
    !verticalPanel &&
    (region === 'secondary' ||
      layout.panelAlignment === 'left' ||
      layout.panelAlignment === 'justify');
  const secondary =
    !verticalPanel &&
    (region === 'secondary' ||
      layout.panelAlignment === 'right' ||
      layout.panelAlignment === 'justify');
  const primaryInset = primary
    ? g.rail
      ? g.rail + g.gap
      : 0
    : layout.primarySide === 'left'
      ? g.left + g.leftGap
      : g.right + g.rightGap;
  const secondaryInset = secondary
    ? g.secondaryRail
      ? g.secondaryRail + g.gap
      : 0
    : layout.primarySide === 'left'
      ? g.right + g.rightGap
      : g.left + g.leftGap;
  const left = layout.primarySide === 'left' ? primaryInset : secondaryInset;
  const right = layout.primarySide === 'right' ? primaryInset : secondaryInset;
  return {
    left,
    right,
    top: 0,
    height,
    width: Math.max(0, width - left - right),
    primary,
    secondary,
  };
}
/** Physical panel coverage is independent of which sidebar is primary. */
export function panelCoverage(alignment: PanelAlignment) {
  return {
    left: alignment === 'left' || alignment === 'justify',
    right: alignment === 'right' || alignment === 'justify',
  };
}
/** Calculates shell tracks and coverage without changing preferred layout values. */
export function layoutGeometry(
  layout: LayoutState,
  width: number,
  height: number,
  measurements: ViewBarMeasurements = {}
) {
  const gap = layout.density === 'compact' ? 0 : 6;
  const viewBarHorizontal =
    layout.primaryViewBarPosition === 'top' ||
    layout.primaryViewBarPosition === 'bottom';
  const secondaryViewBarHorizontal =
    layout.secondaryViewBarPosition === 'top' ||
    layout.secondaryViewBarPosition === 'bottom';
  const viewBarHeight =
    viewBarHorizontal &&
    layout.primaryViewBarVisible &&
    layout.primarySidebarVisible
      ? (measurements.primary?.height ??
        (layout.primaryViewBarSize === 'compact' ? 38 : 46))
      : 0;
  const rail =
    layout.primaryViewBarVisible && !viewBarHorizontal
      ? (measurements.primary?.width ??
        (layout.primaryViewBarSize === 'compact' ? 32 : 40))
      : 0;
  const secondaryRail =
    layout.secondaryViewBarVisible && !secondaryViewBarHorizontal
      ? (measurements.secondary?.width ??
        (layout.secondaryViewBarSize === 'compact' ? 32 : 40))
      : 0;
  const secondaryViewBarHeight =
    secondaryViewBarHorizontal &&
    layout.secondaryViewBarVisible &&
    layout.secondarySidebarVisible
      ? (measurements.secondary?.height ??
        (layout.secondaryViewBarSize === 'compact' ? 38 : 46))
      : 0;
  const narrow = width < 760;
  const available = Math.max(160, width - rail - secondaryRail - 240 - gap * 2);
  let primary = layout.primarySidebarVisible
    ? clamp(
        layout.primaryWidth,
        160,
        narrow ? width - rail - secondaryRail - 20 : available
      )
    : 0;
  let secondary = layout.secondarySidebarVisible
    ? clamp(
        layout.secondaryWidth,
        160,
        narrow ? width - rail - secondaryRail - 20 : available
      )
    : 0;
  if (!narrow && primary && secondary && primary + secondary > available) {
    const extras = Math.max(0, available - 320);
    const ratio =
      Math.max(1, primary - 160) / Math.max(2, primary + secondary - 320);
    primary = 160 + extras * ratio;
    secondary = 160 + extras * (1 - ratio);
  }
  const primaryTrack = rail + (narrow ? 0 : primary);
  const secondaryTrack = secondaryRail + (narrow ? 0 : secondary);
  const left = layout.primarySide === 'left' ? primaryTrack : secondaryTrack;
  const right = layout.primarySide === 'right' ? primaryTrack : secondaryTrack;
  const leftGap = left ? gap : 0;
  const rightGap = right ? gap : 0;
  const panelVertical =
    layout.panelPosition === 'left' || layout.panelPosition === 'right';
  const panelTop = layout.panelPosition === 'top';
  const centerAvailable = Math.max(
    0,
    width - left - right - leftGap - rightGap
  );
  const panelWidth =
    layout.panelVisible && panelVertical
      ? clamp(layout.panelWidth, 90, centerAvailable - 120 - gap)
      : 0;
  const panel =
    layout.panelVisible && !panelVertical
      ? clamp(
          layout.panelHeight,
          90,
          height - 120 - (layout.bannerVisible ? 32 + gap : 0)
        )
      : 0;
  const banner = layout.bannerVisible
    ? clamp(
        layout.bannerHeight,
        32,
        height - panel - (panel ? gap : 0) - gap - 120
      )
    : 0;
  const bannerCoverage = panelCoverage(layout.bannerAlignment);
  const coverage = panelCoverage(layout.panelAlignment);
  const panelAbovePrimary =
    layout.panelVisible &&
    !panelVertical &&
    panelTop &&
    coverage[layout.primarySide];
  const panelAboveSecondary =
    layout.panelVisible &&
    !panelVertical &&
    panelTop &&
    coverage[layout.primarySide === 'left' ? 'right' : 'left'];
  const underPrimary =
    layout.panelVisible &&
    !panelVertical &&
    !panelTop &&
    coverage[layout.primarySide];
  const underSecondary =
    layout.panelVisible &&
    !panelVertical &&
    !panelTop &&
    coverage[layout.primarySide === 'left' ? 'right' : 'left'];
  return {
    panelVertical,
    panelTop,
    panelWidth,
    centerAvailable,
    panelAbovePrimary,
    panelAboveSecondary,
    viewBarHorizontal,
    viewBarHeight,
    secondaryViewBarHorizontal,
    secondaryViewBarHeight,
    banner,
    abovePrimary: layout.bannerVisible && bannerCoverage[layout.primarySide],
    aboveSecondary:
      layout.bannerVisible &&
      bannerCoverage[layout.primarySide === 'left' ? 'right' : 'left'],
    bannerColumn: `${bannerCoverage.left ? 1 : 3} / ${bannerCoverage.right ? 6 : 4}`,
    bannerLeftInset: bannerCoverage.left
      ? (layout.primarySide === 'left' ? rail : secondaryRail) +
        ((layout.primarySide === 'left' ? rail : secondaryRail) ? gap : 0)
      : 0,
    bannerRightInset: bannerCoverage.right
      ? (layout.primarySide === 'right' ? rail : secondaryRail) +
        ((layout.primarySide === 'right' ? rail : secondaryRail) ? gap : 0)
      : 0,
    gap,
    rail,
    secondaryRail,
    primary,
    secondary,
    left,
    right,
    leftGap,
    rightGap,
    panel,
    narrow,
    underPrimary,
    underSecondary,
    center: Math.max(0, centerAvailable - panelWidth - (panelWidth ? gap : 0)),
    panelColumn: `${coverage.left ? 1 : 3} / ${coverage.right ? 6 : 4}`,
    panelLeftInset: coverage.left
      ? (layout.primarySide === 'left' ? rail : secondaryRail) +
        ((layout.primarySide === 'left' ? rail : secondaryRail) ? gap : 0)
      : 0,
    panelRightInset: coverage.right
      ? (layout.primarySide === 'right' ? rail : secondaryRail) +
        ((layout.primarySide === 'right' ? rail : secondaryRail) ? gap : 0)
      : 0,
  };
}
