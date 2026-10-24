import {createBarSeparators,type BarSeparatorOptions} from './barSeparators';
import { computed, shallowReactive, shallowRef } from "vue";

/** Presentation of registered primary-sidebar views only. */
export type ViewBadge = string | number;
export type ViewBarPosition = "default" | "top" | "bottom" | "hidden";
export type ViewBarDisplay = "icons" | "text" | "both";
export type ViewBarSize = "default" | "compact";
interface ViewBarLayoutState {
  primaryViewBarVisible: boolean;
  primaryViewBarPosition: Exclude<ViewBarPosition, "hidden">;
  primaryViewBarSize: ViewBarSize;
  primaryViewBarDisplay: ViewBarDisplay;
  primarySide: "left" | "right";
}
export interface PrimaryViewBarOptions extends BarSeparatorOptions {
  position?: ViewBarPosition;
  size?: ViewBarSize;
  display?: ViewBarDisplay;
  hidden?: readonly string[];
  hiddenBadges?: readonly string[];
  /** Allow users and controller APIs to change size/display after initialization. */
  allowSizeChange?: boolean;
  allowDisplayChange?: boolean;
}
export interface ViewRegistration {
  id: string;
  label: string;
  badge?: ViewBadge;
  defaultVisible?: boolean;
}
export interface ViewItem extends ViewRegistration { visible: boolean; badgeVisible: boolean }
const keyOf = (id: string) => id;

/** Presentation preferences for existing contributions; registrations retain their own lifecycle. */
export function createPrimaryViewBar(
  registrations: () => readonly ViewRegistration[],
  options: PrimaryViewBarOptions = {},
  changed?: (input: string, visible: boolean) => void,
  layout?: ViewBarLayoutState,
  canMove: () => boolean = () => true,
) {
 const allowSizeChange=options.allowSizeChange !== false, allowDisplayChange=options.allowDisplayChange !== false;
 const separatorController=createBarSeparators(options,id=>registrations().some(item=>item.id===id),canMove);
  const visibility = shallowReactive(new Map((options.hidden ?? []).map(item => [keyOf(item), false])));
  const badges = shallowReactive(new Map((options.hiddenBadges ?? []).map(item => [keyOf(item), false])));
  const badgeValues = shallowReactive(new Map<string, ViewBadge | undefined>());
  const disposed = shallowRef(false);
  const position = computed<ViewBarPosition>(() => layout ? layout.primaryViewBarVisible ? layout.primaryViewBarPosition ?? "default" : "hidden" : "default");
  const size = computed<ViewBarSize>(() => layout?.primaryViewBarSize ?? "default");
  const display = computed<ViewBarDisplay>(() => layout?.primaryViewBarDisplay ?? "icons");
  const effectiveDisplay = computed<ViewBarDisplay>(() => display.value);
  function setDisplay(value: ViewBarDisplay) {
    if ((!allowDisplayChange && value !== (options.display ?? "icons")) || disposed.value || !layout || !["icons", "text", "both"].includes(value)) return false;
    layout.primaryViewBarDisplay = value; return true;
  }
  function setPosition(value: ViewBarPosition) {
    if (disposed.value || !layout || !["default", "top", "bottom", "hidden"].includes(value)) return false;
    if (value !== "hidden") layout.primaryViewBarPosition = value;
    layout.primaryViewBarVisible = value !== "hidden";
    return true;
  }
  function setSize(value: ViewBarSize) {
    if ((!allowSizeChange && value !== (options.size ?? "default")) || disposed.value || !layout || !["default", "compact"].includes(value)) return false;
    layout.primaryViewBarSize = value; return true;
  }
  function movePrimarySide(side: "left" | "right") {
    if (disposed.value || !layout || !["left", "right"].includes(side)) return false;
    layout.primarySide = side; return true;
  }
  function resetPresentation() { if (layout) layout.primaryViewBarDisplay = options.display ?? "icons"; setPosition(options.position ?? "default"); setSize(options.size ?? "default"); }
  if (layout && options.display !== undefined) layout.primaryViewBarDisplay = options.display;
  if (options.position !== undefined) setPosition(options.position);
  if (options.size !== undefined) setSize(options.size);
  const find = (input: string) => disposed.value ? undefined : registrations().find(entry => entry.id === keyOf(input));
  function isVisible(input: string) {
    const entry = find(input);
    return !!entry && (visibility.get(keyOf(input)) ?? entry.defaultVisible !== false);
  }
  function isBadgeVisible(input: string) { return !!find(input) && (badges.get(keyOf(input)) ?? true); }
  function setVisible(input: string, visible: boolean) {
    if (!find(input)) return false;
    if (isVisible(input) !== visible) { visibility.set(keyOf(input), visible); changed?.(input, visible); }
    return true;
  }
  function setBadgeVisible(input: string, visible: boolean) {
    if (!find(input)) return false;
    badges.set(keyOf(input), visible); return true;
  }
  function setBadge(input: string, badge?: ViewBadge) {
    if (!find(input)) return false;
    badgeValues.set(keyOf(input), badge); return true;
  }
  const items = computed<ViewItem[]>(() => disposed.value ? [] : registrations().map(entry => ({
    ...entry, badge: badgeValues.has(keyOf(entry.id)) ? badgeValues.get(keyOf(entry.id)) : entry.badge,
    visible: isVisible(entry.id), badgeVisible: isBadgeVisible(entry.id),
  })));
  function forget(input: string) { const key = keyOf(input); visibility.delete(key); badges.delete(key); badgeValues.delete(key); }
  function dispose() { separatorController.disposeSeparators(); disposed.value = true; visibility.clear(); badges.clear(); badgeValues.clear(); }
  return {allowSizeChange,allowDisplayChange,...separatorController, position, size, display, effectiveDisplay, setDisplay, setPosition, setSize, movePrimarySide, resetPresentation, items, isVisible, setVisible, isBadgeVisible, setBadgeVisible, setBadge, forget, dispose };
}
export type PrimaryViewBarController = ReturnType<typeof createPrimaryViewBar> & import('./features').PresentationController;
