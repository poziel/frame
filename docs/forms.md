# Forms, colors, dates, and times

These are reusable Core visual components. They do not install a feature, require a Frame instance, or own application persistence. Import controls and their model helpers from `@frame/core`; load `@frame/core/style.css` once. Each control has an individual Components catalog page with an interactive preview, usage snippet, and property/event guidance.

## Primitive coverage and provenance

The installed `reka-ui` version is **2.11.0**. Coverage below is by component family: Frame composes the root, inputs, triggers, items, and other necessary subparts into a themed control, rather than re-exporting every unstyled primitive.

| Reka family | Frame component | Model / notes |
| --- | --- | --- |
| Checkbox | FrameCheckbox | boolean; existing API retained |
| Checkbox group | FrameCheckboxGroup | string array |
| Combobox | FrameCombobox | option value |
| Editable | FrameEditable | string |
| Label | FrameLabel | `for` links a control |
| Listbox | FrameListbox | string or array; optional multiple |
| Number field | FrameNumberField | number; min/max/step |
| PIN input | FramePinInput | string array |
| Radio group | FrameRadioGroup | option value |
| Select | FrameSelect | existing SelectItem options and string value retained |
| Slider | FrameSlider | existing numeric API retained |
| Switch | FrameSwitch | boolean |
| Tags input | FrameTagsInput | string array |
| Toggle / toggle group | FrameToggle / FrameToggleGroup | boolean / selected values |
| Autocomplete (Alpha) | FrameAutocomplete | string and string options |
| Field / Form (Alpha) | FrameField / FrameForm | field metadata and host validation; composed controls in slots |
| Rating (Alpha) | FrameRating | number |
| Tag group (Alpha) | FrameTagGroup | item selection; host owns items |
| Color area / field / slider (Alpha) | FrameColorArea / FrameColorField / FrameColorSlider | CSS color string; slider channel is explicit |
| Color swatch / swatch picker (Alpha) | FrameColorSwatch / FrameColorSwatchPicker | display color / select from host colors |
| Calendar / range calendar (Alpha) | FrameCalendar / FrameRangeCalendar | DateValue / DateRange |
| Date field / date picker (Alpha) | FrameDateField / FrameDatePicker | DateValue; picker composes a field, popover, and calendar |
| Date range field / picker (Alpha) | FrameDateRangeField / FrameDateRangePicker | DateRange |
| Time field / range field (Alpha) | FrameTimeField / FrameTimeRangeField | TimeValue / TimeRange |
| Month picker / range picker (Alpha) | FrameMonthPicker / FrameMonthRangePicker | DateValue / DateRange |
| Year picker / range picker (Alpha) | FrameYearPicker / FrameYearRangePicker | DateValue / DateRange |

`FrameColorPicker` preserves its existing hex-string API as a compact color trigger with a Reka Popover containing ColorArea, ColorSlider, and ColorField. Reka does not supply a standalone text-input or textarea family: `FrameTextInput` and `FrameTextArea` intentionally retain native input/textarea semantics and Frame tokens. Native form attributes such as names, required state, and validation remain host concerns.

Alpha indicates upstream API maturity, not an unavailable export: these families are present in the installed version. This scope covers the Forms, Colors, and Dates catalog families; unrelated general-purpose Reka components are outside this migration.

## Dates and locale

Public helpers include `CalendarDate`, `CalendarDateTime`, `ZonedDateTime`, `Time`, `parseDate`, `parseDateTime`, and `parseTime`. Models retain calendar/time structure; formatted display strings and JavaScript Date are not interchangeable with them. Supply locale and boundary props through the relevant control. The host decides time zones, storage formats, allowed dates, and business validation.

Picker overlays use Frame's overlay integration and document theme tokens. Controls remain usable outside a shell. Disabled state preserves values; closing a picker does not itself persist application data.

Upstream maturity labels were checked against the [Reka component documentation](https://reka-ui.com/docs/components/date-picker); all 12 date/time families are currently marked Alpha. Installed exports were checked independently against the 2.11.0 package.

## Verification

Run `bun test`, `bun run build:library`, `bun run build:features`, `bun run check:consumer`, and `bun run build` from the repository root. Browser checks require Python Playwright with Chromium.

- Date behavior: `bunx vite build --config tests/fixtures/forms-dates/vite.config.ts`, then `python tests/forms-dates-browser.py` (serves its compiled fixture on a free port).
- Stable controls: start `bunx vite --config tests/fixtures/forms-controls/vite.config.ts`, then `python tests/forms-controls-browser.py` against port 1433.
- Documentation and advanced forms: start the docs server on port 1448 with `bun run --cwd packages/docs dev --host 127.0.0.1 --port 1448`, then run `python tests/forms-docs-browser.py` and `python tests/forms-advanced-browser.py`. These accept `FRAME_DOCS_URL` for another server.

The migration does not change Quick Input's custom interaction model, chat composition, native file upload inputs, menus, or draggable modal behavior. Those are separate feature/shell surfaces, not new Reka form wrappers.
