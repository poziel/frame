import { isSelectOption } from "./select";
import { computed, reactive, shallowReactive } from "vue";
import type { SettingDefinition, SettingsSection, SettingValue } from "../types";
export function createSettings() {
  const sections = shallowReactive<SettingsSection[]>([]);
  const values = reactive<Record<string, SettingValue>>({});
  const definitions = new Map<string, SettingDefinition>();
  const sectionIds = new Set<string>();
  const allSections = computed(() => { const result: SettingsSection[] = []; const visit = (items: readonly SettingsSection[]) => { for (const item of items) { result.push(item); visit(item.children ?? []); } }; visit(sections); return result; });
  function register(section: SettingsSection) {
    const ids: string[] = [], fields: SettingDefinition[] = [];
    const visit = (item: SettingsSection) => {
      if (sectionIds.has(item.id) || ids.includes(item.id)) throw new Error(`Duplicate settings section: ${item.id}`);
      ids.push(item.id);
      for (const field of item.settings ?? []) {
        if (definitions.has(field.id) || fields.some(other => other.id === field.id)) throw new Error(`Duplicate setting: ${field.id}`);
        fields.push(field);
      }
      for (const child of item.children ?? []) visit(child);
    };
    visit(section);
    ids.forEach(id => sectionIds.add(id)); fields.forEach(field => { definitions.set(field.id, field); values[field.id] = field.default; });
    sections.push(section);
    let active = true;
    return () => { if (!active) return; active = false; const index = sections.indexOf(section); if (index < 0) return; sections.splice(index, 1); ids.forEach(id => sectionIds.delete(id)); fields.forEach(field => { definitions.delete(field.id); delete values[field.id]; }); };
  }
  function set(id: string, value: SettingValue) {
    const field = definitions.get(id);
    if (!field || field.disabled) return false;
    if ((field.type === "number" || field.type === "range") && (typeof value !== "number" || !Number.isFinite(value) || value < (field.min ?? -Infinity) || value > (field.max ?? Infinity))) return false;
    if (field.type === "checkbox" && typeof value !== "boolean") return false;
    if (!["number", "range", "checkbox"].includes(field.type) && typeof value !== "string") return false;
    if (field.type === "select" && !field.options?.some(option => isSelectOption(option) && option.value === value && !option.disabled)) return false;
    if (field.type === "color" && !/^#[0-9a-f]{6}$/i.test(String(value))) return false;
    if ((field.getValue?.() ?? values[id]) === value) return true;
    field.onChange?.(value); values[id] = value; return true;
  }
  function reset(id: string) { const definition = definitions.get(id); return definition ? set(id, definition.default) : false; }
  function dispose() { sections.splice(0); definitions.clear(); sectionIds.clear(); Object.keys(values).forEach(id => delete values[id]); }
  return { sections, allSections, values, register, set, reset, dispose };
}
