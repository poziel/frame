# Reka documentation coverage review

This review compares the six existing Frame form-control pages with the official Markdown references linked from [Reka's llms.txt](https://reka-ui.com/llms.txt), their rendered documentation, and the installed Reka `2.11.0` implementation. The live website may describe a newer API than the installed dependency; runtime claims here were checked against the installed source and Frame wrappers.

## Findings and corrections

The initial pages covered Frame's declared props, update events, basic examples, and styling, but were incomplete as reference documentation. They omitted anatomy, state attributes, internal-part customization boundaries, and a systematic comparison with upstream props and scoped slots. Those sections are now present in each page.

| Frame component | Upstream reference | Review result |
| --- | --- | --- |
| [Checkbox](../components/forms/checkbox.md) | [Checkbox](https://reka-ui.com/docs/components/checkbox.md) | Added Label/Root/Indicator anatomy, Root forwarding map, indicator API boundaries, group mapping, state attributes, and scoped-slot differences |
| [Switch](../components/forms/switch.md) | [Switch](https://reka-ui.com/docs/components/switch.md) | Added Label/Root/Thumb anatomy, forwarding map, thumb boundaries, scoped-slot differences, and state attributes |
| [Label](../components/forms/label.md) | [Label](https://reka-ui.com/docs/components/label.md) | Added anatomy, composition forwarding, and explicit absence of model/state attributes |
| [Select](../components/forms/select.md) | [Select](https://reka-ui.com/docs/components/select.md) | Added composed and omitted parts, Root mapping, event/slot boundaries, state attributes, geometry variables, and placeholder caveat |
| [Text input](../components/forms/text-input.md) | [Primitive](https://reka-ui.com/docs/utilities/primitive.md) | No corresponding Reka TextInput page; documented native input composition, fixed element assumptions, and native state selectors |
| [Text area](../components/forms/text-area.md) | [Primitive](https://reka-ui.com/docs/utilities/primitive.md) | No corresponding Reka TextArea page; documented native textarea composition and native state selectors |

## How to read the comparison

- **Declared** means Frame explicitly types and handles the prop/event/slot.
- **Forwarded** means Vue attributes reach a specific Reka part. This is not equivalent to a declared Frame API, and attributes targeting another internal part will not configure it.
- **Internal** means Frame fixes or derives that behavior. It does not provide caller configuration for that part.
- **Absent** means Frame does not compose that part or expose that capability.

A thin wrapper can both omit features and change their semantics. Checkbox's strict boolean conversion cannot preserve Reka's custom values or indeterminate state. Switch declares boolean updates but does not normalize a custom value forwarded to its Root. Select's `defaultValue` annotates an option rather than initializing a model. These are implementation constraints, not documentation shortcuts.

The downloaded Markdown had empty Features/Keyboard sections and omitted data-attribute tables present in the rendered pages. Its Select Icon section also contained Item API rows. We did not copy those omissions or misclassifications into Frame: relevant attributes, part ownership, and keyboard behavior were checked against installed source.

## Select parts and API inventory

This inventory accounts for the fetched Select reference's props, events, and scoped-slot fields by part. It records exposure rather than repeating upstream descriptions or implying the upstream types are Frame types. The component guide documents the supported Frame fields with types/defaults. All other properties below remain internal, forwarded only to the specified part, or absent as described.

### Root

Declared string model, disabled, required; Frame-specific name/defaultValue handling. Other Root options and scoped slots are internal or absent.

- Props: `autocomplete`, `by`, `defaultOpen`, `defaultValue`, `dir`, `disabled`, `modelValue`, `multiple`, `name`, `nullableValue`, `open`, `required`.
- Events: `update:modelValue`, `update:open`.
- Slots: `modelValue`, `open`.

### Trigger

Frame supplies disabled state and internal content. Other attributes reach Trigger, including untyped as/asChild/reference; no public content slot.

- Props: `as`, `asChild`, `disabled`, `reference`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Value

Absent; Frame renders its own label/fallback span. No Value props or scoped payloads.

- Props: `as`, `asChild`, `placeholder`.
- Events: none declared in the reviewed reference.
- Slots: `selectedLabel`, `modelValue`.

### Icon

Absent; Frame uses FrameIcon with a fixed chevron.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Portal

Internal; target derived from Frame overlay boundary. No public teleport/presence controls.

- Props: `defer`, `disabled`, `forceMount`, `to`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Content

Internal; popper mode, derived boundary, 8px collision padding. No Content option or event forwarding.

- Props: `align`, `alignFlip`, `alignOffset`, `arrowPadding`, `as`, `asChild`, `avoidCollisions`, `bodyLock`, `collisionBoundary`, `collisionPadding`, `dir`, `disableOutsidePointerEvents`, `disableUpdateOnLayoutShift`, `forceMount`, `hideShiftedArrow`, `hideWhenDetached`, `loop`, `memoDependencies`, `position`, `positionStrategy`, `prioritizePosition`, `reference`, `side`, `sideFlip`, `sideOffset`, `sticky`, `updatePositionStrategy`.
- Events: `closeAutoFocus`, `escapeKeyDown`, `pointerDownOutside`.
- Slots: none declared in the reviewed reference.

### Viewport

Internal; no viewport slot, nonce prop, or element customization forwarded by Frame.

- Props: `as`, `asChild`, `nonce`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Item

Derived from options: value, disabled, textValue from label. No item select event or selected scoped slot exposed.

- Props: `as`, `asChild`, `disabled`, `textValue`, `value`.
- Events: `select`.
- Slots: `selected`.

### ItemText

Internal label rendering; no part props forwarded.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### ItemIndicator

Absent; no public indicator configuration.

- Props: `as`, `asChild`, `forceMount`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### ScrollUpButton

Absent; Frame supplies its own overlay scrollbar integration.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### ScrollDownButton

Absent; Frame supplies its own overlay scrollbar integration.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Group

Absent; options support separators, not named groups.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Label

Absent as a Select group part; visible field labels use FrameLabel separately.

- Props: `as`, `asChild`, `for`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Separator

Created from separator options; no per-separator composition props exposed.

- Props: `as`, `asChild`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

### Arrow

Absent; no popup arrow configuration.

- Props: `as`, `asChild`, `height`, `rounded`, `width`.
- Events: none declared in the reviewed reference.
- Slots: none declared in the reviewed reference.

## Verification and limits

All six initial Frame pages account for their declared API, anatomy, slot/event boundaries, and state hooks. The next batch adds [Number field](../components/forms/number-field.md), [Radio group](../components/forms/radio-group.md), [Checkbox group](../components/forms/checkbox-group.md), [PIN input](../components/forms/pin-input.md), and [Tags input](../components/forms/tags-input.md), each with its own upstream API inventory. Native HTML attributes are described by forwarding behavior rather than reproducing the entire HTML standard.

This is documentation validation against official references and local source, not implementation of missing upstream features. Raw downloads and example-check artifacts stay in the ignored `.tmp/` directory. The website still uses its existing documentation renderer; it has not been migrated to these Markdown files.

The remaining Forms category now has individual references for [Autocomplete](../components/forms/autocomplete.md), [Combobox](../components/forms/combobox.md), [Editable](../components/forms/editable.md), [Field](../components/forms/field.md), [Form](../components/forms/form.md), [Listbox](../components/forms/listbox.md), [Rating](../components/forms/rating.md), [Slider](../components/forms/slider.md), [Tag group](../components/forms/tag-group.md), [Toggle](../components/forms/toggle.md), and [Toggle group](../components/forms/toggle-group.md). Each accounts for the composed upstream parts, unavailable related parts, attribute routing, scoped-slot boundaries, and component styling. These comparisons use the official component Markdown references and installed Reka 2.11.0 source, with Frame's wrapper taking precedence.

Notable current limits are documented on the relevant pages: Combobox forwards undeclared attributes to Input; Slider forwards them to Thumb; Listbox's label currently names its outer Root; ToggleGroup's selection mode comes from model shape or Reka's type rather than the wrapper's multiple boolean; and autocomplete's Frame-side filter depends on the supplied model. Field/Form do not expose Reka's ref validation methods, and TagGroup removal requires a host listener and list mutation. Colors and dates/times remain separate documentation categories.
