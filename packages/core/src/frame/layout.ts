export type PanelAlignment = "left" | "right" | "center" | "justify";
export interface LayoutState {
  maximizedRegion: "secondary" | "bottom" | null;
  navigationVisible: boolean;
  menuBarVisible: boolean;
  activityBarVisible: boolean;
  primarySidebarVisible: boolean;
  secondarySidebarVisible: boolean;
  panelVisible: boolean;
  statusBarVisible: boolean;
  bannerVisible: boolean;
  bannerAlignment: PanelAlignment;
  bannerHeight: number;
  primarySide: "left" | "right";
  panelAlignment: PanelAlignment;
  quickInputPosition: "top" | "center";
  density: "default" | "compact";
  centered: boolean;
  zenMode: boolean;
  primaryWidth: number;
  secondaryWidth: number;
  panelHeight: number;
  centeredRatio: number;
}
export function defaultLayout(): LayoutState {
  return {
    maximizedRegion: null,
    navigationVisible: true,
    menuBarVisible: true, activityBarVisible: true, primarySidebarVisible: false,
    secondarySidebarVisible: false, bannerVisible: false, bannerAlignment: "center", bannerHeight: 100, panelVisible: false, statusBarVisible: true,
    primarySide: "left", panelAlignment: "center", quickInputPosition: "top", density: "default",
    centered: false, zenMode: false, primaryWidth: 236, secondaryWidth: 280, panelHeight: 240, centeredRatio: .9,
  };
}
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));
/** Maximize inside the workbench, leaving the activity rail and uncovered regions intact. */
export function maximizedRegionBounds(layout: LayoutState, width: number, height: number) {
  const region = layout.maximizedRegion;
  if (!region || (region === "bottom" ? !layout.panelVisible : !layout.secondarySidebarVisible)) return undefined;
  const g = layoutGeometry(layout, width, height);
  const primary = region === "secondary" || layout.panelAlignment === "left" || layout.panelAlignment === "justify";
  const secondary = region === "secondary" || layout.panelAlignment === "right" || layout.panelAlignment === "justify";
  const primaryInset = primary ? (g.rail ? g.rail + g.gap : 0) : layout.primarySide === "left" ? g.left + g.leftGap : g.right + g.rightGap;
  const secondaryInset = secondary ? 0 : layout.primarySide === "left" ? g.right + g.rightGap : g.left + g.leftGap;
  const left = layout.primarySide === "left" ? primaryInset : secondaryInset;
  const right = layout.primarySide === "right" ? primaryInset : secondaryInset;
  return { left, right, top: 0, height, width: Math.max(0, width - left - right), primary, secondary };
}
/** Physical panel coverage is independent of which sidebar is primary. */
export function panelCoverage(alignment: PanelAlignment) {
  return { left: alignment === "left" || alignment === "justify", right: alignment === "right" || alignment === "justify" };
}
export function layoutGeometry(layout: LayoutState, width: number, height: number) {
  const gap = layout.density === "compact" ? 0 : 6;
  const rail = layout.activityBarVisible ? (layout.density === "compact" ? 38 : 40) : 0;
  const narrow = width < 760;
  const available = Math.max(160, width - rail - 240 - gap * 2);
  let primary = layout.primarySidebarVisible ? clamp(layout.primaryWidth, 160, narrow ? width - rail - 20 : available) : 0;
  let secondary = layout.secondarySidebarVisible ? clamp(layout.secondaryWidth, 160, narrow ? width - 60 : available) : 0;
  if (!narrow && primary && secondary && primary + secondary > available) {
    const extras = Math.max(0, available - 320);
    const ratio = Math.max(1, primary - 160) / Math.max(2, primary + secondary - 320);
    primary = 160 + extras * ratio; secondary = 160 + extras * (1 - ratio);
  }
  const primaryTrack = rail + (narrow ? 0 : primary);
  const secondaryTrack = narrow ? 0 : secondary;
  const left = layout.primarySide === "left" ? primaryTrack : secondaryTrack;
  const right = layout.primarySide === "right" ? primaryTrack : secondaryTrack;
  const leftGap = left ? gap : 0;
  const rightGap = right ? gap : 0;
  const panel = layout.panelVisible ? clamp(layout.panelHeight, 90, height - 120 - (layout.bannerVisible ? 32 + gap : 0)) : 0;
  const banner = layout.bannerVisible ? clamp(layout.bannerHeight, 32, height - panel - (panel ? gap : 0) - gap - 120) : 0;
  const bannerCoverage = panelCoverage(layout.bannerAlignment);
  const coverage = panelCoverage(layout.panelAlignment);
  const underPrimary = layout.panelVisible && coverage[layout.primarySide];
  const underSecondary = layout.panelVisible && coverage[layout.primarySide === "left" ? "right" : "left"];
  return { banner, abovePrimary: layout.bannerVisible && bannerCoverage[layout.primarySide], aboveSecondary: layout.bannerVisible && bannerCoverage[layout.primarySide === "left" ? "right" : "left"],
    bannerColumn: `${bannerCoverage.left ? 1 : 3} / ${bannerCoverage.right ? 6 : 4}`,
    bannerLeftInset: bannerCoverage.left && layout.primarySide === "left" && rail ? rail + gap : 0,
    bannerRightInset: bannerCoverage.right && layout.primarySide === "right" && rail ? rail + gap : 0,
    gap, rail, primary, secondary, left, right, leftGap, rightGap, panel, narrow, underPrimary, underSecondary,
    center: Math.max(0, width - left - right - leftGap - rightGap),
    panelColumn: `${coverage.left ? 1 : 3} / ${coverage.right ? 6 : 4}`,
    panelLeftInset: coverage.left && layout.primarySide === "left" && rail ? rail + gap : 0,
    panelRightInset: coverage.right && layout.primarySide === "right" && rail ? rail + gap : 0,
  };
}

