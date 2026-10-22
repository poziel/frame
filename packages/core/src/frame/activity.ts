import { computed, shallowReactive, shallowRef } from "vue";

/** View and action ids have independent registration namespaces. */
export interface ActivityItemKey { kind: "view" | "action"; id: string }
export type ActivityBadge = string | number;
export type ActivityBarPosition = "default" | "top" | "bottom" | "hidden";
export type ActivityBarDisplay = "icons" | "text" | "both";
export type ActivityBarSize = "default" | "compact";
interface ActivityLayoutState {
  activityBarVisible: boolean;
  activityBarPosition: Exclude<ActivityBarPosition, "hidden">;
  activityBarSize: ActivityBarSize;
  activityBarDisplay: ActivityBarDisplay;
  primarySide: "left" | "right";
}
export interface ActivityOptions {
  position?: ActivityBarPosition;
  size?: ActivityBarSize;
  display?: ActivityBarDisplay;
  hidden?: readonly ActivityItemKey[];
  hiddenBadges?: readonly ActivityItemKey[];
}
export interface ActivityRegistration extends ActivityItemKey {
  label: string;
  badge?: ActivityBadge;
  defaultVisible?: boolean;
}
export interface ActivityItem extends ActivityRegistration { visible: boolean; badgeVisible: boolean }
const keyOf = (item: ActivityItemKey) => JSON.stringify([item.kind, item.id]);

/** Presentation preferences for existing contributions; registrations retain their own lifecycle. */
export function createActivity(
  registrations: () => readonly ActivityRegistration[],
  options: ActivityOptions = {},
  changed?: (item: ActivityItemKey, visible: boolean) => void,
  layout?: ActivityLayoutState,
) {
  const visibility = shallowReactive(new Map((options.hidden ?? []).map(item => [keyOf(item), false])));
  const badges = shallowReactive(new Map((options.hiddenBadges ?? []).map(item => [keyOf(item), false])));
  const badgeValues = shallowReactive(new Map<string, ActivityBadge | undefined>());
  const disposed = shallowRef(false);
  const position = computed<ActivityBarPosition>(() => layout ? layout.activityBarVisible ? layout.activityBarPosition ?? "default" : "hidden" : "default");
  const size = computed<ActivityBarSize>(() => layout?.activityBarSize ?? "default");
  const display = computed<ActivityBarDisplay>(() => layout?.activityBarDisplay ?? "icons");
  const effectiveDisplay = computed<ActivityBarDisplay>(() => layout?.activityBarPosition === "default" ? "icons" : display.value);
  function setDisplay(value: ActivityBarDisplay) {
    if (disposed.value || !layout || !["icons", "text", "both"].includes(value) || layout.activityBarPosition === "default" && value !== "icons") return false;
    layout.activityBarDisplay = value; return true;
  }
  function setPosition(value: ActivityBarPosition) {
    if (disposed.value || !layout || !["default", "top", "bottom", "hidden"].includes(value)) return false;
    if (value !== "hidden") layout.activityBarPosition = value;
    layout.activityBarVisible = value !== "hidden";
    return true;
  }
  function setSize(value: ActivityBarSize) {
    if (disposed.value || !layout || !["default", "compact"].includes(value)) return false;
    layout.activityBarSize = value; return true;
  }
  function movePrimarySide(side: "left" | "right") {
    if (disposed.value || !layout || !["left", "right"].includes(side)) return false;
    layout.primarySide = side; return true;
  }
  function resetPresentation() { if (layout) layout.activityBarDisplay = options.display ?? "icons"; setPosition(options.position ?? "default"); setSize(options.size ?? "default"); }
  if (layout && options.display !== undefined) layout.activityBarDisplay = options.display;
  if (options.position !== undefined) setPosition(options.position);
  if (options.size !== undefined) setSize(options.size);
  const find = (item: ActivityItemKey) => disposed.value ? undefined : registrations().find(entry => entry.kind === item.kind && entry.id === item.id);
  function isVisible(item: ActivityItemKey) {
    const entry = find(item);
    return !!entry && (visibility.get(keyOf(item)) ?? entry.defaultVisible !== false);
  }
  function isBadgeVisible(item: ActivityItemKey) { return !!find(item) && (badges.get(keyOf(item)) ?? true); }
  function setVisible(item: ActivityItemKey, visible: boolean) {
    if (!find(item)) return false;
    if (isVisible(item) !== visible) { visibility.set(keyOf(item), visible); changed?.(item, visible); }
    return true;
  }
  function setBadgeVisible(item: ActivityItemKey, visible: boolean) {
    if (!find(item)) return false;
    badges.set(keyOf(item), visible); return true;
  }
  function setBadge(item: ActivityItemKey, badge?: ActivityBadge) {
    if (!find(item)) return false;
    badgeValues.set(keyOf(item), badge); return true;
  }
  const items = computed<ActivityItem[]>(() => disposed.value ? [] : registrations().map(entry => ({
    ...entry, badge: badgeValues.has(keyOf(entry)) ? badgeValues.get(keyOf(entry)) : entry.badge,
    visible: isVisible(entry), badgeVisible: isBadgeVisible(entry),
  })));
  function forget(item: ActivityItemKey) { const key = keyOf(item); visibility.delete(key); badges.delete(key); badgeValues.delete(key); }
  function dispose() { disposed.value = true; visibility.clear(); badges.clear(); badgeValues.clear(); }
  return { position, size, display, effectiveDisplay, setDisplay, setPosition, setSize, movePrimarySide, resetPresentation, items, isVisible, setVisible, isBadgeVisible, setBadgeVisible, setBadge, forget, dispose };
}
export type ActivityController = ReturnType<typeof createActivity>;
