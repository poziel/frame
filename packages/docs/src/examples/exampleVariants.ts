export interface ExampleVariant { id: string; label: string; code: string }
export function variantsFor(id: string): ExampleVariant[] {
  if (id !== "select") return [{ id: "default", label: "Default", code: "" }];
  return [
    { id: "default", label: "With descriptions", code: `import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'manual', label: 'Manual', description: 'Save on demand.' }),
  new SelectOption({ value: 'automatic', label: 'Automatic', description: 'Save while you work.' }),
];
// <FrameSelect v-model="mode" label="Save mode" :options="options" />` },
    { id: "plain", label: "Without descriptions", code: `import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'manual', label: 'Manual' }),
  new SelectOption({ value: 'automatic', label: 'Automatic' }),
]; // description is optional` },
    { id: "separators", label: "Grouped with separators", code: `import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'local', label: 'Local' }),
  new SelectOption({ value: 'project', label: 'Project' }),
  new SelectSeparator('remote-group'),
  new SelectOption({ value: 'remote', label: 'Remote' }),
  new SelectSeparator('advanced-group'),
  new SelectOption({ value: 'custom', label: 'Custom' }),
]; // separators have no value and cannot be selected` },
    { id: "disabled", label: "Disabled choices", code: `import { SelectOption, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'manual', label: 'Manual' }),
  new SelectOption({ value: 'automatic', label: 'Automatic', disabled: true }),
  new SelectOption({ value: 'focus', label: 'On focus change' }),
]; // keyboard navigation skips disabled choices` },
  ];
}
