import { typeDocs } from "./typeDocs";
export type ApiKind = "Class" | "Object contract" | "Value type";
const classes = new Set(["SelectItem", "SelectOption", "SelectSeparator"]);
const values = new Set(["FrameMenuItem", "SettingValue", "WorkspaceSplitDirection", "CodeBlockTheme"]);
export const apiEntries = Object.keys(typeDocs).sort().map(name => ({
  name, kind: (classes.has(name) ? "Class" : values.has(name) ? "Value type" : "Object contract") as ApiKind,
  package: name === "NotificationHistory" ? "@frame/extras" : "@frame/core",
}));
export function filterApiEntries(query: string) {
  const search = query.trim().toLowerCase();
  return apiEntries.filter(entry => `${entry.name} ${entry.kind} ${entry.package} ${typeDocs[entry.name]!.description}`.toLowerCase().includes(search));
}
