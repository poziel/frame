# Component documentation authoring standard

This is an internal guide for Frame maintainers. Keep it out of `llms.txt`, consumer indexes, package documentation, and website navigation. It governs new component pages and future revisions; existing pages have not all been migrated to this structure yet.

## Purpose and source of truth

Document the complete component contract, with approachable examples first. The goal is a reference that a developer can use without guessing at behavior, not just a list of common use cases.

Start from the official Reka reference linked through `https://reka-ui.com/llms.txt`. Read the component's Markdown and, where necessary, its rendered reference. Some Markdown exports omit data attributes or keyboard tables. Then inspect the installed Reka version, Frame's wrapper, public exports, relevant styles, and theme token catalog.

Reka supplies the underlying interaction details; Frame supplies composition, additional APIs, and styling. Document both, with their boundaries explicit. Do not copy an upstream API table and imply that Frame exposes every row. Do not omit an upstream feature merely because the wrapper restricts it: explain its status on the corresponding part.

Use this precedence when sources differ:

1. Frame's current implementation and public declarations determine the Frame contract.
2. The installed Reka implementation determines the behavior Frame actually uses.
3. The live Reka documentation provides the reference structure and upstream context; it can describe a different version.

Write original, Frame-specific explanations and attribute upstream sources. Record the installed Reka version and source links within the page, rather than relying on an old downloaded snapshot.

## Fixed page structure

Every page starts with one H1 containing the exported component name, followed by a short description. Explain what it is, what value/content it handles, and when it is useful. This introduction sits above the tabs.

Use exactly these H2 headings, in this order:

1. `## Features`
2. `## APIs`
3. `## Styling`

Each H2 becomes one website tab. Each H3 becomes a section within that tab. Use H4 headings for groups inside a section, such as a part's props or data attributes. Do not introduce an extra H2 for anatomy, examples, keyboard behavior, source links, or an upstream inventory: that would create another tab.

The Markdown must remain useful without the website. Use normal fenced examples and tables. Do not invent live-example tags, invisible HTML placeholders, or renderer-specific syntax until that integration has an agreed contract.

## Features tab

The first two H3 sections are always `### Anatomy` and `### Basic usage`.

### Anatomy

Show where Frame sits in the composition and how it uses the actual Reka parts. A text tree is sufficient. Name the Frame wrapper, its outer element or label, each meaningful Reka part, generated children, and form helpers where relevant.

For example, FrameSwitch contains a Label, a SwitchRoot, and a SwitchThumb. The label slot is beside the root, not inside the thumb. The diagram must make that distinction visible.

Explain the role of each meaningful part, which parts render elements versus provide state, where caller attributes go, and which parts callers can customize. Identify replaced or omitted Reka parts when that changes usage. An internal anatomy diagram is not a claim that those parts are separately exported or publicly composable through Frame.

For native wrappers, show the actual native element and any Primitive composition. Do not invent a Reka component counterpart that does not exist.

### Basic usage

Give a small, complete Vue single-file example with public imports, model state where needed, accessible labeling, and the stylesheet import. State that styles need loading once per application. Ordinary controls must not be shown requiring a Frame instance when they work independently.

Initialize values with their real model types. Do not use `any` to hide mismatches. Show a useful result without depending on unnamed fixtures, demo stores, hidden setup, or the documentation application's internal imports.

### Additional feature sections

After basic usage, use descriptive H3 headings for meaningful capabilities: disabled state, custom content, formatting, grouping, validation, or similar features. Do not add empty variations merely to give every page the same length.

Include keyboard/accessibility, native form behavior, model edge cases, and lifecycle behavior where relevant. These can have their own H3 sections within Features. Keep keyboard details precise about focus versus selection, disabled items, composition input, and cancellation. Distinguish form values from Vue models and browser constraints from application validation.

Each example should demonstrate a documented capability. A shortened follow-up example may reuse the basic setup, but explicitly say so. Do not show an upstream capability as a Frame example when the wrapper does not support it.

## APIs tab

Organize the tab by anatomy part, not by a single component-wide list of props. Put `### Root` first when there is a root part. Follow it with the relevant parts, such as `### Thumb`, `### Indicator`, `### Item`, or `### Group Root`, in anatomy order.

Within each part, use H4 subsections for `Props`, `Emits`, `Slots`, and `Data attributes`. Include exposed methods where that part actually exposes them through Frame. If a category has no entries, say that explicitly; do not leave readers guessing whether it was forgotten. For large parts, additional H4 subsections can clarify behavior without creating new tabs or parts.

### Reka part references

Use Reka's API as the inventory for each corresponding part. Account for all documented props, emits, scoped-slot fields, and state attributes, checking them against the installed version. Keep useful types, defaults, payloads, and descriptions rather than reducing the reference to names alone.

Every upstream API row must make its availability through Frame clear. Use an availability column or a short, unambiguous part-level statement when every row shares the same status:

| Status    | Meaning                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Declared  | Explicitly typed and handled by Frame                                                                        |
| Forwarded | Reaches this particular part through Vue attribute/listener fallthrough; not a separately declared Frame API |
| Internal  | Configured or derived by Frame; callers cannot independently configure it                                    |
| Changed   | Frame narrows the type, converts the payload, or gives the same name different semantics                     |
| Absent    | The part or capability is not composed/exposed by Frame                                                      |

Preserve the upstream reference separately from Frame's actual type/default when they differ. For example, an upstream generic value is not the same contract as Frame's boolean model. A controlled wrapper does not become uncontrolled because an upstream `defaultValue` attribute reaches its root.

An internal Thumb still deserves its own section describing its upstream props and state attributes, with its customization boundary stated. Do not place its props in the Root table or imply that attributes passed to the outer Frame component configure the Thumb.

For entirely omitted related parts, provide a concise explanation and an upstream link or a link to the separate Frame component. Do not suggest callers can manually compose them inside a wrapper with no public composition slot. Cover supported grouped controls on their own pages rather than silently treating an independent control as a group API.

### Table content

- Props: name, type, required/default, behavior, and availability. Distinguish a Frame default from an inherited Reka default.
- Emits: event name, exact payload, trigger, cancellation support if any, and whether Frame declares or merely forwards it. Native bubbling listeners are not automatically component emits.
- Slots: slot name, placement, fallback, scoped payload names/types, and availability. Distinguish default-slot payload fields from separate named slots.
- Data attributes: actual owning element/part, attribute, possible values or presence rule, and meaning. Separate focus/highlight from checked/selected state. Do not put a child's state attributes on its parent in the documentation.
- Exposed methods/refs: exact types, mount/lifetime restrictions, and access through Frame. Do not imply internal Reka refs are exposed by the wrapper.

Stateful ARIA attributes can be explained alongside data attributes, but do not call them `data-*` attributes. Native wrappers may expose native pseudo-classes rather than Reka state attributes; say so.

### Frame additions

After the upstream parts, add `### Frame additions` when Frame introduces custom props, emits, slots, or methods. For example, FrameSwitch's `label` and its label-content slot belong here. Describe where they fit in the anatomy and how they interact with the underlying parts.

Group these additions with H4 headings as needed. Do not mix a Frame-only `label` prop into a table presented as Reka's Root API. If Frame only changes an existing upstream API, explain the change on that API row rather than inventing a second property.

If there are no Frame additions, state that briefly instead of inventing custom APIs. Put implementation/source links and the upstream version note in a final H3 section inside APIs; they do not need their own H2 tab. A separate exhaustive name inventory is unnecessary when the part tables already cover the same API.

## Styling tab

Styling is Frame's contribution and must be documented from Frame's styles and theme implementation, not inferred from unstyled Reka documentation.

### Parts and selectors

Map each meaningful element to its Frame class/selector and explain how state selectors apply to it. Document where caller `class` and `style` end up. Note component-specific placement details, such as a popup rendering outside the trigger's subtree.

### Variables

Inventory the variables actually consumed by this component, including shared semantic tokens and local fallback variables. Group them by part or purpose when the list is long. Include configurable colors, typography, spacing, geometry, radii, borders, shadows, and motion where they exist.

For each entry provide:

| Field            | Required information                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Token key        | Exact accepted key                                                                                 |
| Variable         | Exact `--frame-*` name used by the stylesheet                                                      |
| Value kind       | Color, length, font, shadow, duration, easing, or the actual supported category                    |
| Default/fallback | Literal value or full `var(...)` fallback chain; distinguish catalog default from local fallback   |
| Part/effect      | Which element and visual property it changes                                                       |
| Scope/limits     | States affected, shared effects on other controls, or geometry constraints                         |
| Description      | Which part, state, and visual property it affects; include component-specific limits when relevant |

Check JSON support against `packages/core/src/themes/tokens.ts` and validation in `packages/core/src/themes/theme.ts`. A CSS custom property appearing in a stylesheet is not automatically an allowed JSON token.

Do not invent tokens for hard-coded dimensions or present runtime `--reka-*` geometry outputs as writable Frame JSON settings. Briefly identify component-specific constraints where needed. A short link to the consumer theme guide is sufficient for readers who need theme authoring instructions. The opposite is true as well.

## Page skeleton

The following illustrates heading structure. Replace part names with the actual anatomy; it is not a requirement to give every component a Thumb.

```markdown
# FrameComponent

Short purpose and description.

## Features

### Anatomy

Frame composition tree and explanation of Reka/native parts.

### Basic usage

Complete Vue example with public imports and accessible labeling.

### A meaningful capability

Explanation and example.

### Keyboard and accessibility

Relevant keyboard, focus, and naming behavior.

### Forms and validation

Relevant model, submission, and validation rules.

## APIs

### Root

#### Props

Complete upstream mapping with Frame availability and actual types/defaults.

#### Emits

Events, payloads, triggers, and forwarding/cancellation boundaries.

#### Slots

Slot placement, fallback, and exact scoped payloads, or explicit absence.

#### Data attributes

Owning element, values/presence, and meaning.

### Thumb

#### Props

Upstream props and whether Frame exposes them.

#### Emits

Explicit absence if none.

#### Slots

Underlying slot and Frame exposure, or explicit absence.

#### Data attributes

State markers on the thumb itself.

### Frame additions

#### Props

Frame-only properties and their behavior.

#### Slots

Frame-specific slots and payloads.

### Sources and version

Upstream reference, installed dependency version, and implementation links.

## Styling

### Parts and selectors

Class/element map, caller attributes, and component-specific placement details.

### Variables

| Token key | Variable | Value kind | Default/fallback | Part/effect | Scope/limits | Description |
| --- | --- | --- | --- | --- | --- | --- |
| Exact accepted key or CSS only | Exact `--frame-*` name | Supported value category | Literal default or full `var(...)` fallback chain | Element and visual property affected | Applicable states, shared effects, or geometry constraints | Explanation of the variable's purpose and component-specific behavior |
```

## Validation before delivery

Check the three H2 tabs and consistent H3 structure. Match the anatomy and every public prop/event/slot/method to source. Check upstream part inventories so omissions are intentional and explained. Verify data attributes on the element that actually owns them.

Type-check examples against current public declarations. Reused setup must be explicit. Check listed JSON keys against the real token allowlist and verify CSS variables exist and are consumed. Check local links and heading anchors. Use focused browser verification when a claim cannot be established from source/types, and distinguish source review from tested runtime behavior in the delivery report.

Keep changes limited to the requested documentation batch. Updating this authoring guide does not automatically authorize migrating all existing component pages, changing wrapper APIs to match Reka, or implementing the website renderer. When revising a page later, use this structure and preserve verified details rather than discarding them to fit the template.
