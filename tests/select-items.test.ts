import { test, expect } from "bun:test";
import { selectableOptions, isSelectOption } from "../packages/core/src/frame/select";
import { createFrame } from "../packages/core/src/frame/createFrame";
import type { SelectItem } from "../packages/core/src/types";
import * as contracts from "../packages/core/src/types";
test("runtime select classes preserve option metadata and separator behavior", () => {
  expect(typeof contracts.SelectOption).toBe("function");
  const option = new contracts.SelectOption({ value: "remote", label: "Remote", detail: "Cloud", description: "Sync online", disabled: true });
  const separator = new contracts.SelectSeparator("remote-group");
  expect(option).toBeInstanceOf(contracts.SelectItem);
  expect(separator).toBeInstanceOf(contracts.SelectItem);
  expect(option.description).toBe("Sync online");
  expect(isSelectOption(separator)).toBe(false);
  expect(selectableOptions([separator, option, new contracts.SelectOption({ value: "local", label: "Local" })])).toEqual([2]);
});
const items: SelectItem[] = [{ value: "one", label: "One" }, { type: "separator", id: "group" }, { value: "disabled", label: "Disabled", disabled: true }, { value: "two", label: "Two", description: "Optional" }, { type: "separator", id: "last" }];
test("select items skip separators and disabled choices, with optional descriptions", () => { expect(selectableOptions(items)).toEqual([0, 3]); expect(isSelectOption(items[1])).toBe(false); expect(isSelectOption(undefined)).toBe(false); expect(isSelectOption(items[0])).toBe(true); expect(selectableOptions([{type:"separator",id:"only"}])).toEqual([]); });
test("settings validate select values against choices rather than separators", () => { const frame = createFrame(); frame.registerSettingsSection({ id: "general", title: "General", settings: [{ id: "choice", label: "Choice", type: "select", default: "one", options: items }] }); expect(frame.settings.set("choice", "group")).toBe(false); expect(frame.settings.set("choice", "disabled")).toBe(false); expect(frame.settings.set("choice", "two")).toBe(true); });
