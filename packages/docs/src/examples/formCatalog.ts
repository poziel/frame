import type { ComponentExample } from './componentCatalog';
export const formFamilies = [
  ['autocomplete','Autocomplete'], ['field','Field'], ['input-group','FieldGroup'], ['form','Form'], ['rating','Rating'], ['tag-group','TagGroup'], ['label','Label'], ['checkbox-group','CheckboxGroup'], ['color-area','ColorArea'], ['color-hsv-rectangle','HsvRectangle'], ['color-hsv-wheel','HsvWheel'], ['color-vhs-circle','VhsCircle'], ['color-field','ColorField'], ['color-slider','ColorSlider'], ['color-swatch','ColorSwatch'], ['color-swatch-picker','ColorSwatchPicker'], ['combobox','Combobox'], ['editable','Editable'], ['listbox','Listbox'], ['number-field','NumberField'], ['scrub-field','ScrubField'], ['pin-input','PinField'], ['radio-group','RadioGroup'], ['switch','Switch'], ['tags-input','TagField'], ['toggle','Toggle'], ['toggle-group','ToggleGroup'],
  ['calendar','Calendar'], ['range-calendar','RangeCalendar'], ['date-field','DateField'], ['date-picker','DatePicker'], ['date-range-field','DateRangeField'], ['date-range-picker','DateRangePicker'], ['time-field','TimeField'], ['time-range-field','TimeRangeField'], ['month-picker','MonthPicker'], ['month-range-picker','MonthRangePicker'], ['year-picker','YearPicker'], ['year-range-picker','YearRangePicker'],
] as const;
export const formExamples: ComponentExample[] = formFamilies.map((
  [id, name]
) => {
  const dates = /calendar|date|time|month|year/.test(id), alpha = /calendar|date|time|month|year|autocomplete|^field$|^form$|rating|tag-group|color/.test(id);
  const type = dates ? (id.includes('range') ? '{ start, end }' : id.includes('time') ? 'TimeValue' : 'DateValue') : ['switch','toggle'].includes(id) ? 'boolean' : ['number-field','rating'].includes(id) ? 'number' : ['pin-input','tags-input','checkbox-group'].includes(id) ? 'string[]' : 'string | string[]';
  return { id, title: name.replace(/([a-z])([A-Z])/g, '$1 $2'), group: dates ? 'Dates and times' : 'Forms', description: `Themed ${name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()} backed by Reka UI.${alpha ? ' This Reka family is Alpha.' : ''}`, usage: 'Reusable independently of a Frame instance. The host controls the value, validation, and persistence. Try the live preview and its disabled state. ' + (dates ? 'Use the public date/time models, not JavaScript Date or display strings. Locale changes presentation while preserving the model.' : 'Options may contain disabled choices; they cannot be selected.'), code: `import { Frame${name}${dates ? ', CalendarDate, Time' : ''} } from '@frame/core';\nimport '@frame/core/style.css';\n\n<Frame${name} v-model="value" label="Example"${['combobox','listbox','radio-group','toggle-group'].includes(id) ? ' :options="options"' : ''} />`, properties: [{ name: 'v-model / update:modelValue', type, description: 'Host-controlled value and change event.' }, { name: 'disabled', type: 'boolean', description: 'Prevent interaction while preserving the value.' }, { name: 'label', type: 'string', description: 'Accessible control name.' }] };
});

const extraProperties: Record<string, ComponentExample['properties']> = {
  autocomplete: [{ name: 'options', type: 'string[]', description: 'Host-supplied suggestions; free text is retained.' }],
  'number-field': [{ name: 'min / max / step', type: 'number', description: 'Allowed bounds and increment.' }, {name:'controls',type:"'buttons' | 'none' | 'stacked'",description:'Attached icon steppers, no buttons, or stacked right-side arrows.'},{name:'size',type:"'default' | 'compact'",description:'Standard or compact height; focus uses the theme accent.'}],
  'pin-input': [{ name: 'length', type: 'number', description: 'Number of digit inputs; defaults to six.' }],
  'tag-group': [{ name: 'items', type: '{ value: string; label: string; disabled?: boolean }[]', description: 'Host-owned tags rendered as selectable items.' }],
  'color-slider': [{ name: 'channel', type: 'ColorChannel', description: 'Required color channel, for example hue or alpha.' }],
  'color-swatch-picker': [{ name: 'colors', type: 'string[]', description: 'Available CSS colors.' }],
};
for (const item of formExamples) {
  if (item.id.startsWith('color')) { item.group = 'Colors'; item.properties[0]!.type = 'string'; }
  if (['combobox','listbox','radio-group','toggle-group','checkbox-group'].includes(item.id)) item.properties.push({ name: 'options', type: 'readonly SelectItem[]', description: 'Typed values, labels, descriptions and disabled options.', reference: 'SelectItem' });
  if (['listbox','toggle-group'].includes(item.id)) item.properties.push({ name: 'multiple', type: 'boolean', description: 'Allow multiple selected values; bind an array.' });
  item.properties.push(...(extraProperties[item.id] ?? []));
  if (item.id === 'label') { item.code = `import { FrameLabel, FrameTextField } from '@frame/core';\n\n<FrameLabel for="project-name">Project name</FrameLabel>\n<FrameTextField id="project-name" v-model="name" />`; item.properties = [{ name: 'for', type: 'string', description: 'ID of the associated input.' }, { name: 'default', type: 'slot', description: 'Visible label text.' }]; }
  if (item.id === 'field') { item.code = `import { FrameField, FrameTextField } from '@frame/core';\n\n<FrameField label="Project name" description="Shown in the workspace" :error="error">\n  <FrameTextField v-model="name" aria-label="Project name" />\n</FrameField>`; item.properties = [{ name: 'label / description / error', type: 'string', description: 'Visible field metadata and host validation feedback.' }, { name: 'default', type: 'slot', description: 'Control to label and describe.' }]; }
  if (item.id === 'form') { item.code = `import { FrameForm, FrameField, FrameTextField, FrameButton } from '@frame/core';\n\n<FrameForm @submit.prevent="save">\n  <FrameField label="Project name"><FrameTextField v-model="name" required /></FrameField>\n  <FrameButton type="submit">Save project</FrameButton>\n</FrameForm>`; item.properties = [{ name: 'submit', type: 'event', description: 'Handle submission in the host. preventDefault keeps the page in place.' }, { name: 'default', type: 'slot', description: 'Form fields and submit controls.' }]; }
  if (item.id === 'color-swatch') { item.code = `import { FrameColorSwatch } from '@frame/core';\n\n<FrameColorSwatch color="#0078d4" />`; item.properties = [{ name: 'color', type: 'string', description: 'CSS color to display; this is a display component.' }]; }
  if (item.id === 'color-area') item.properties.push({ name: 'variant', type: "'rectangle' | 'wheel' | 'circle'", description: 'Composed HSV picker: rectangle plus vertical hue, hue wheel plus saturation/value square, or hue/saturation circle plus vertical value. Omit to retain the configured two-channel plane.' });
  if (['color-hsv-rectangle','color-hsv-wheel','color-vhs-circle'].includes(item.id)) {
    item.title = item.id==='color-vhs-circle'?'VHS Circle':item.id==='color-hsv-wheel'?'HSV Wheel':'HSV Rectangle';
    item.description = 'A composed color picker with a shared model, scalable controls, and pointer and keyboard support.';
    item.properties.push({name:'size',type:'number | string',description:'Overall width; defaults to 280px and is capped by the container. The slider scales with the area.'});
  }
  if (item.id === 'color-slider') item.code = item.code.replace('label="Example"', 'channel="hue" label="Hue"');
  if (item.id === 'color-swatch-picker') item.code = item.code.replace('label="Example"', ':colors="[\'#0078d4\', \'#16a34a\']" label="Accent"');
  if (item.id === 'tag-group') item.code = item.code.replace('label="Example"', ':items="items" selection-mode="single" @remove="removeTags" label="Labels"');
  if (item.id === 'autocomplete') item.code = item.code.replace('label="Example"', ':options="[\'Vue\', \'Rust\']" label="Language"');
  if (item.id === 'checkbox-group') item.properties[0]!.type = 'string[]';
  if (['field','form','label','color-swatch'].includes(item.id)) item.usage = 'Reusable independently of a Frame instance. Compose application controls through the documented props and slots. The host owns validation, submission, and persistence.';
}


for (const item of formExamples.filter(item => item.group === 'Dates and times')) item.properties[0]!.reference = item.id.includes('time') ? (item.id.includes('range') ? 'TimeRange' : 'TimeValue') : item.id.includes('range') ? 'DateRange' : 'DateValue';


formExamples.find(item => item.id === 'tag-group')!.properties.push({ name: 'selectionMode / remove', type: 'none | single | multiple / event', description: 'Enable selection explicitly. remove emits values; update the host items array to remove them.' });

// Examples are complete Vue single-file components; every binding is declared.
const sfc = (imports: string[], setup: string, template: string) => `<script setup lang="ts">\nimport { ref } from 'vue';\nimport { ${imports.join(', ')} } from '@frame/core';\nimport '@frame/core/style.css';\n${setup}\n</script>\n\n<template>\n${template}\n</template>`;
const row = (name: string, type: string, description: string) => ({ name, type, description });
for (const item of formExamples) {
  const name = `Frame${formFamilies.find(([id]) => id === item.id)![1]}`;
  const dates = item.group === 'Dates and times', time = item.id.includes('time'), range = item.id.includes('range');
  const options = ['combobox','listbox','radio-group','toggle-group','checkbox-group'].includes(item.id);
  const rootOnly = ['rating','tag-group','color-area','color-hsv-rectangle','color-hsv-wheel','color-vhs-circle','color-field','color-slider','color-swatch-picker'].includes(item.id);
  let setup = '', attrs = rootOnly ? 'aria-label="Example"' : 'label="Example"';
  let initial = ['switch','toggle'].includes(item.id) ? 'false' : ['number-field','rating'].includes(item.id) ? '3' : ['pin-input','checkbox-group'].includes(item.id) ? '[] as string[]' : item.id === 'tags-input' ? "['design', 'review']" : item.id.startsWith('color') ? "'#0078d4'" : item.id === 'editable' ? "'Frame project'" : options || item.id === 'tag-group' ? "'vue'" : "''";
  const imports = [name];
  if (dates) {
    imports.push(time ? 'Time' : 'CalendarDate');
    const start = time ? 'new Time(9, 30)' : 'new CalendarDate(2026, 10, 21)';
    initial = range ? `{ start: ${start}, end: ${time ? 'new Time(17)' : 'new CalendarDate(2026, 10, 26)'} }` : start;
    attrs += ' locale="en-US"';
  }
  if (options) { setup += "const options = [{ value: 'vue', label: 'Vue' }, { value: 'typescript', label: 'TypeScript' }, { value: 'legacy', label: 'Unavailable', disabled: true }];\n"; attrs += ' :options="options"'; }
  if (item.id === 'autocomplete') attrs += ' :options="[\'Vue\', \'Rust\']"';
  if (item.id === 'number-field') attrs += ' :min="0" :max="20" :step="1"';
  if (item.id === 'pin-input') attrs += ' :length="4"';
  if (item.id === 'color-slider') attrs += ' channel="hue"';
  if (item.id === 'color-swatch-picker') attrs += ' :colors="[\'#0078d4\', \'#16a34a\']"';
  if (item.id === 'tag-group') { setup += "const items = ref([{ value: 'vue', label: 'Vue' }, { value: 'typescript', label: 'TypeScript' }]);\nfunction removeTags(values: unknown[]) { items.value = items.value.filter(item => !values.includes(item.value)); }\n"; attrs += ' :items="items" selection-mode="single" @remove="removeTags"'; }
  item.code = sfc(imports, setup + `const value = ref(${initial});`, item.id === 'toggle' ? `  <${name} v-model="value" ${attrs}>Bold</${name}>` : `  <${name} v-model="value" ${attrs} />`);
  if (rootOnly) item.properties = item.properties.filter(property => property.name !== 'label');
  if (rootOnly) item.properties.push(row('aria-label', 'string', 'Accessible name forwarded to the Reka root or input; this wrapper does not define a label prop.'));
  if (dates) {
    item.properties.push(row('locale', 'string', 'Locale used to format labels and segments.'), row('minValue / maxValue', time ? 'TimeValue' : 'DateValue', 'Inclusive lower and upper boundaries.'), row('readonly', 'boolean', 'Allow focus without changing the value.'), row('placeholder / update:placeholder', time ? 'TimeValue / event' : 'DateValue / event', 'Control the displayed date/time page independently of the selected value.'));
    if (!time && !range && /calendar|month-picker|year-picker/.test(item.id)) { item.properties[0]!.type = 'DateValue | DateValue[] | null'; item.properties.push(row('multiple', 'boolean', 'Select multiple dates/months/years; bind an array.')); }
    if (/calendar|date-picker|date-range-picker/.test(item.id)) item.properties.push(row('numberOfMonths / weekStartsOn / fixedWeeks', 'number / 0 | 1 | 2 | 3 | 4 | 5 | 6 / boolean', 'Configure calendar layout and consistent week rows.'));
    if (/field|date-picker|date-range-picker/.test(item.id)) item.properties.push(row('granularity / hourCycle', time ? 'hour | minute | second / 12 | 24' : 'day | hour | minute | second / 12 | 24', 'Control which segments are editable. Date-time values are required for time segments.'));
    if (/date-picker|date-range-picker/.test(item.id)) item.properties.push(row('triggerLabel', 'string', 'Accessible calendar trigger name.'), row('open / update:open', 'boolean / event', 'Control popup visibility without changing its value.'));
    if (!time) item.properties.push(row(item.id.includes('month') ? 'isMonthDisabled / isMonthUnavailable' : item.id.includes('year') ? 'isYearDisabled / isYearUnavailable' : /field/.test(item.id) ? 'isDateUnavailable' : 'isDateDisabled / isDateUnavailable', '(value: DateValue) => boolean', 'Host rules for disabled or unavailable selections.'));
  }
  if (item.id === 'rating') item.properties.push(row('length / step', 'number / 1 | 0.5 | 0.25 | 0.1', 'Number of stars and selection precision.'), row('clearable / hoverable / readonly', 'boolean', 'Configure clearing, hover preview, and read-only display.'));
  if (item.id === 'color-area') item.properties.push(row('colorSpace / xChannel / yChannel', 'ColorSpace / ColorChannel', 'Choose the color representation and horizontal/vertical channels.'), row('change / changeEnd', '(value: string) => void', 'Continuous edits and committed edits.'));
  if (item.id === 'color-field') item.properties.push(row('colorSpace / channel', 'ColorSpace / ColorChannel', 'Edit a full color or one channel.'), row('readonly / disableWheelChange / step', 'boolean / boolean / number', 'Control editing and wheel increments.'));
  if (item.id === 'color-slider') item.properties.push(row('orientation / inverted / step', 'horizontal | vertical / boolean / number', 'Slider direction and increments.'), row('change / changeEnd', '(value: string) => void', 'Continuous edits and committed edits.'));
}
const special = (id: string) => formExamples.find(item => item.id === id)!;
special('label').code = sfc(['FrameLabel','FrameTextField'], "const name = ref('');", '  <FrameLabel for="project-name">Project name</FrameLabel>\n  <FrameTextField id="project-name" v-model="name" />');
special('field').code = sfc(['FrameField','FrameTextField'], "const name = ref('');\nconst invalid = ref(true);\nconst error = ref('A project name is required');", '  <FrameField label="Project name" description="Shown in the workspace" :invalid="invalid" :error="error">\n    <FrameTextField v-model="name" />\n  </FrameField>');
special('field').properties.push(row('name / required / disabled / invalid', 'string / boolean', 'Field registration, required state, interaction and host-controlled validation state.'), row('validate / validationMode / validationDebounceTime', 'FieldValidateFn / FieldValidationMode / number', 'Custom validation, when to validate, and debounce duration.'));
special('form').code = sfc(['FrameForm','FrameField','FrameTextField','FrameButton'], "const name = ref('');\nconst submitted = ref('');\nfunction save(values: Record<string, unknown>, event: SubmitEvent) {\n  event.preventDefault();\n  submitted.value = JSON.stringify(values);\n}", '  <FrameForm @form-submit="save">\n    <FrameField name="projectName" label="Project name" required>\n      <FrameTextField v-model="name" />\n    </FrameField>\n    <FrameButton type="submit">Save project</FrameButton>\n    <p role="status">{{ submitted }}</p>\n  </FrameForm>');
special('form').properties.push(row('errors', 'Record<string, string | string[]>', 'Host/server validation errors keyed by registered field name.'), row('validationMode', 'FieldValidationMode', 'Default validation timing for registered fields.'), row('formSubmit', '(values: Record<string, unknown>, event: SubmitEvent) => void', 'Validated registered values and native event; prevent default in your handler.'));
special('color-swatch').code = sfc(['FrameColorSwatch'], '', '  <FrameColorSwatch color="#0078d4" label="Blue accent" />');

// Immutable internationalized-date models use shallowRef to preserve their nominal types.
for (const item of formExamples.filter(item => item.group === 'Dates and times')) {
  const time = item.id.includes('time'), range = item.id.includes('range');
  const model = time ? range ? 'TimeRange' : 'TimeValue' : range ? 'DateRange' : 'DateValue';
  const multiple = !time && !range && /calendar|month-picker|year-picker/.test(item.id);
  item.code = item.code.replace("import { ref } from 'vue';", "import { shallowRef } from 'vue';").replace(" } from '@frame/core';", `, type ${model} } from '@frame/core';`).replace('const value = ref(', `const value = shallowRef<${model}${multiple ? ' | DateValue[]' : ''} | null>(`);
}
special('color-swatch').code = special('color-swatch').code.replace("import { ref } from 'vue';\n", '');

special('input-group').description = 'A shared input surface with prefix and suffix slots for currency, units, icons, or actions.';
special('input-group').usage = 'Place FrameTextField, a number field, select, or a date field in the default slot. Prefix and suffix content stays inside the same input border. Pass disabled to both the group and its control when disabling the composition.';
special('input-group').code = sfc(['FrameFieldGroup','FrameTextField'], "const amount = ref('25');", '  <FrameFieldGroup>\n    <template #prefix>$</template>\n    <FrameTextField v-model="amount" aria-label="Amount" />\n    <template #suffix>USD</template>\n  </FrameFieldGroup>');
special('input-group').properties = [{name:'prefix / suffix',type:'slot',description:'Decorations or actions inside the input surface.'},{name:'default',type:'slot',description:'A labeled Frame input component.'},{name:'disabled',type:'boolean',description:'Disabled group presentation; also disable the supplied control.'}];

special('scrub-field').description='A numeric field that supports dragging, wheel stepping, arrow buttons, and click-to-type entry.';
special('scrub-field').usage='Drag horizontally to scrub the value. Click without dragging or press Enter to edit. Wheel and arrow buttons use the configured step; Escape cancels direct entry. Bounds and disabled behavior apply to all interaction modes.';
special('scrub-field').code=sfc(['FrameScrubField'], 'const size = ref(12);', '  <FrameScrubField v-model="size" label="Size" suffix=" px" :min="1" :max="256" :step="1" />');
special('scrub-field').properties=[{name:'modelValue / label',type:'number / string',description:'Controlled value and visible accessible label.'},{name:'min / max / step',type:'number',description:'Bounds and step used by dragging, wheel, keys, and arrows.'},{name:'suffix',type:'string',description:'Display unit outside direct editing.'},{name:'pixelsPerStep',type:'number',description:'Optional relative drag sensitivity; bounded fields otherwise track the bar directly.'},{name:'disabled',type:'boolean',description:'Disables every interaction.'}];
