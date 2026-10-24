import type { ViewBarDisplay } from './primaryViewBar';
import type { SecondaryViewBarDisplay, SecondaryViewBarSize } from './secondaryViewBar';
export type PanelPosition = "top" | "bottom" | "left" | "right";
export type PanelDisplay = "icons" | "text" | "both";
export type PanelAlignment = "left" | "right" | "center" | "justify";
export interface LayoutState {
  manageButtonPosition: "top" | "bottom";
  maximizedRegion: "secondary" | "bottom" | null;
  navigationVisible: boolean;
  menuBarVisible: boolean;
  primaryViewBarVisible: boolean;
  primaryViewBarPosition: "default" | "top" | "bottom";
  primaryViewBarSize: "default" | "compact";
  primaryViewBarDisplay: ViewBarDisplay;
  primarySidebarVisible: boolean;
  secondarySidebarVisible: boolean;
  secondaryViewBarVisible: boolean;
  secondaryViewBarPosition: "default" | "top" | "bottom";
  secondaryViewBarDisplay: SecondaryViewBarDisplay;
  secondaryViewBarSize: SecondaryViewBarSize;
  panelViewBarVisible: boolean;
  panelViewBarSize: "default" | "compact";
  panelVisible: boolean;
  statusBarVisible: boolean;
  bannerVisible: boolean;
  bannerAlignment: PanelAlignment;
  bannerHeight: number;
  primarySide: "left" | "right";
  panelAlignment: PanelAlignment;
  panelPosition: PanelPosition;
  panelViewBarDisplay: PanelDisplay;
  quickInputPosition: "top" | "center";
  density: "default" | "compact";
  centered: boolean;
  zenMode: boolean;
  primaryWidth: number;
  secondaryWidth: number;
  panelHeight: number;
  panelWidth: number;
  centeredRatio: number;
}
export function defaultLayout(): LayoutState {
  return {
    manageButtonPosition: "bottom",
    maximizedRegion: null,
    navigationVisible: true,
    menuBarVisible: true, primaryViewBarVisible: true, primaryViewBarPosition: "default", primaryViewBarSize: "default", primaryViewBarDisplay: "icons", primarySidebarVisible: false,
    secondarySidebarVisible: false, secondaryViewBarVisible: true, secondaryViewBarPosition: 'top', secondaryViewBarDisplay: 'both', secondaryViewBarSize: 'default', bannerVisible: false, bannerAlignment: "center", bannerHeight: 100, panelViewBarVisible: true, panelViewBarSize:"default", panelVisible: false, statusBarVisible: true,
    primarySide: "left", panelAlignment: "center", panelPosition: "bottom", panelViewBarDisplay: "both", quickInputPosition: "top", density: "default",
    centered: false, zenMode: false, primaryWidth: 236, secondaryWidth: 280, panelHeight: 240, panelWidth: 320, centeredRatio: .9,
  };
}
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));
/** Maximize inside the workbench, leaving the activity rail and uncovered regions intact. */
export interface ViewBarMeasurements { primary?: {width?:number;height?:number}; secondary?: {width?:number;height?:number} }
export function maximizedRegionBounds(layout: LayoutState, width: number, height: number, measurements: ViewBarMeasurements = {}) {
  const region = layout.maximizedRegion;
  if (!region || (region === "bottom" ? !layout.panelVisible : !layout.secondarySidebarVisible)) return undefined;
  const g = layoutGeometry(layout, width, height, measurements);
  const verticalPanel=region === "bottom" && (layout.panelPosition === "left" || layout.panelPosition === "right");
  const primary = !verticalPanel && (region === "secondary" || layout.panelAlignment === "left" || layout.panelAlignment === "justify");
  const secondary = !verticalPanel && (region === "secondary" || layout.panelAlignment === "right" || layout.panelAlignment === "justify");
  const primaryInset = primary ? (g.rail ? g.rail + g.gap : 0) : layout.primarySide === "left" ? g.left + g.leftGap : g.right + g.rightGap;
  const secondaryInset = secondary ? (g.secondaryRail ? g.secondaryRail + g.gap : 0) : layout.primarySide === "left" ? g.right + g.rightGap : g.left + g.leftGap;
  const left = layout.primarySide === "left" ? primaryInset : secondaryInset;
  const right = layout.primarySide === "right" ? primaryInset : secondaryInset;
  return { left, right, top: 0, height, width: Math.max(0, width - left - right), primary, secondary };
}
/** Physical panel coverage is independent of which sidebar is primary. */
export function panelCoverage(alignment: PanelAlignment) {
  return { left: alignment === "left" || alignment === "justify", right: alignment === "right" || alignment === "justify" };
}
export function layoutGeometry(layout: LayoutState, width: number, height: number, measurements: ViewBarMeasurements = {}) {
  const gap = layout.density === "compact" ? 0 : 6;
  const viewBarHorizontal = layout.primaryViewBarPosition === "top" || layout.primaryViewBarPosition === "bottom";
  const secondaryViewBarHorizontal = layout.secondaryViewBarPosition === "top" || layout.secondaryViewBarPosition === "bottom";
  const viewBarHeight = viewBarHorizontal && layout.primaryViewBarVisible && layout.primarySidebarVisible ? (measurements.primary?.height ?? (layout.primaryViewBarSize === "compact" ? 38 : 46)) : 0;
  const rail = layout.primaryViewBarVisible && !viewBarHorizontal ? (measurements.primary?.width ?? (layout.primaryViewBarSize === "compact" ? 32 : 40)) : 0;
  const secondaryRail = layout.secondaryViewBarVisible && !secondaryViewBarHorizontal ? (measurements.secondary?.width ?? (layout.secondaryViewBarSize === "compact" ? 32 : 40)) : 0;
  const secondaryViewBarHeight = secondaryViewBarHorizontal && layout.secondaryViewBarVisible && layout.secondarySidebarVisible ? (measurements.secondary?.height ?? (layout.secondaryViewBarSize === "compact" ? 38 : 46)) : 0;
  const narrow = width < 760;
  const available = Math.max(160, width - rail - secondaryRail - 240 - gap * 2);
  let primary = layout.primarySidebarVisible ? clamp(layout.primaryWidth, 160, narrow ? width - rail - secondaryRail - 20 : available) : 0;
  let secondary = layout.secondarySidebarVisible ? clamp(layout.secondaryWidth, 160, narrow ? width - rail - secondaryRail - 20 : available) : 0;
  if (!narrow && primary && secondary && primary + secondary > available) {
    const extras = Math.max(0, available - 320);
    const ratio = Math.max(1, primary - 160) / Math.max(2, primary + secondary - 320);
    primary = 160 + extras * ratio; secondary = 160 + extras * (1 - ratio);
  }
  const primaryTrack = rail + (narrow ? 0 : primary);
  const secondaryTrack = secondaryRail + (narrow ? 0 : secondary);
  const left = layout.primarySide === "left" ? primaryTrack : secondaryTrack;
  const right = layout.primarySide === "right" ? primaryTrack : secondaryTrack;
  const leftGap = left ? gap : 0;
  const rightGap = right ? gap : 0;
  const panelVertical=layout.panelPosition === "left" || layout.panelPosition === "right";
  const panelTop=layout.panelPosition === "top";
  const centerAvailable=Math.max(0,width-left-right-leftGap-rightGap);
  const panelWidth=layout.panelVisible&&panelVertical?clamp(layout.panelWidth,90,centerAvailable-120-gap):0;
  const panel = layout.panelVisible && !panelVertical ? clamp(layout.panelHeight, 90, height - 120 - (layout.bannerVisible ? 32 + gap : 0)) : 0;
  const banner = layout.bannerVisible ? clamp(layout.bannerHeight, 32, height - panel - (panel ? gap : 0) - gap - 120) : 0;
  const bannerCoverage = panelCoverage(layout.bannerAlignment);
  const coverage = panelCoverage(layout.panelAlignment);
  const panelAbovePrimary=layout.panelVisible&&!panelVertical&&panelTop&&coverage[layout.primarySide];
  const panelAboveSecondary=layout.panelVisible&&!panelVertical&&panelTop&&coverage[layout.primarySide === "left" ? "right" : "left"];
  const underPrimary = layout.panelVisible&&!panelVertical&&!panelTop && coverage[layout.primarySide];
  const underSecondary = layout.panelVisible&&!panelVertical&&!panelTop && coverage[layout.primarySide === "left" ? "right" : "left"];
  return { panelVertical,panelTop,panelWidth,centerAvailable,panelAbovePrimary,panelAboveSecondary, viewBarHorizontal, viewBarHeight, secondaryViewBarHorizontal, secondaryViewBarHeight, banner, abovePrimary: layout.bannerVisible && bannerCoverage[layout.primarySide], aboveSecondary: layout.bannerVisible && bannerCoverage[layout.primarySide === "left" ? "right" : "left"],
    bannerColumn: `${bannerCoverage.left ? 1 : 3} / ${bannerCoverage.right ? 6 : 4}`,
    bannerLeftInset: bannerCoverage.left ? (layout.primarySide === "left" ? rail : secondaryRail) + ((layout.primarySide === "left" ? rail : secondaryRail) ? gap : 0) : 0,
    bannerRightInset: bannerCoverage.right ? (layout.primarySide === "right" ? rail : secondaryRail) + ((layout.primarySide === "right" ? rail : secondaryRail) ? gap : 0) : 0,
    gap, rail, secondaryRail, primary, secondary, left, right, leftGap, rightGap, panel, narrow, underPrimary, underSecondary,
    center: Math.max(0, centerAvailable - panelWidth - (panelWidth ? gap : 0)),
    panelColumn: `${coverage.left ? 1 : 3} / ${coverage.right ? 6 : 4}`,
    panelLeftInset: coverage.left ? (layout.primarySide === "left" ? rail : secondaryRail) + ((layout.primarySide === "left" ? rail : secondaryRail) ? gap : 0) : 0,
    panelRightInset: coverage.right ? (layout.primarySide === "right" ? rail : secondaryRail) + ((layout.primarySide === "right" ? rail : secondaryRail) ? gap : 0) : 0,
  };
}

