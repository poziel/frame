export function regionIcon(region: "primary" | "secondary" | "panel", visible: boolean, primarySide: "left" | "right" = "left") {
  const side = region === "primary" ? primarySide : primarySide === "left" ? "right" : "left";
  const icon = region === "panel" ? "layout-panel" : `layout-sidebar-${side}`;
  return `${icon}${visible ? "" : "-off"}`;
}
