# Component documentation tabs

Date: 2026-10-21
Scope: Duck documentation, plus public styling tokens in Core and Features.

## Outcome

Every component page in Components and Features has four tabs: Features, API, Theming, and Interactive demo. Features is initially selected. Pages use Frame's existing visual language and controls. API references remain distinct pages in the API activity section. Documentation data, editors, and examples stay in packages/docs.

The PrimeVue Checkbox page is the structural reference: named feature sections with descriptions, live examples, and adjacent code. It does not define Frame's supported properties or styling. Actual Frame source is authoritative.

## Approach

Use a shared, typed documentation model and page renderer, with explicit per-component content and demo adapters. Reuse current catalog IDs and navigation. Avoid a separate renderer for each component, and avoid pretending the existing abbreviated property summaries are complete API contracts.

Keep the generic ComponentShowcase export compatible for existing consumers and type reference pages. Implement the richer tabbed component documentation in Docs. Reuse FrameCodeBlock for highlighted, copyable examples rather than adding another code-highlighting dependency.

## Page layout and navigation

A common header shows package, component name, and description. A single top-level tablist follows it. It has roving keyboard focus, ArrowLeft/ArrowRight/Home/End support, aria-selected, aria-controls, and associated tab panels. Tab selection is local to each workspace page. Changing the component resets its tab to Features and scrolls to the start.

Existing component and Features activity separation remains. Existing API links still open the API activity, preserve the previous page/sidebar, and support Back. Back restores the component tab that contained the link. Icon-library links stay on the Icons Features tab. Existing icon catalog behavior remains intact.

## Features

Each feature has a stable ID, heading, description, live example, and complete copyable usage code. Render feature sections sequentially rather than hiding different examples behind the old variant tabs. Existing variants such as select descriptions, plain options, groups, and disabled choices become feature sections.

Examples must demonstrate supported behavior. Do not copy PrimeVue-only features into Frame documentation. Document accessibility and keyboard behavior where relevant. Separate explanatory examples from the unrestricted demo controls.

Every page has a basic example and additional examples for its supported options, states, or composition. Existing interactive examples are reused when appropriate, with code matching the displayed variant. Service and shell API pages use working host compositions rather than claiming they are standalone Vue components.

## API

Each page describes the actual rendered component, or explicitly named components when a page presents a family. Group multiple components into separate sections; do not conflate their props or defaults.

Properties contain name, TypeScript type, default value, description, and optional reference target. Show required properties explicitly. Distinguish an explicit default, Vue's Boolean false default, an omitted optional value, and a default calculated from another property. v-model is documented as its modelValue property and update:modelValue event.

Emits contain name, named parameters and types, return type, and description. Return types describe the emit signature, not the return value of an application handler. Omit Emits when none exist.

Slots contain name, scoped parameters and types, rendered-content return type, and description. Include default slots detected in templates as well as explicit defineSlots declarations. Omit Slots when none exist.

Document exposed refs and methods when present. Methods include parameters, return type, and behavior.

Related interfaces/classes/types are listed with links to the existing API pages. Their fields show name, type, default or required/optional status, and description on those pages. A type itself has no fabricated default value. Where a referenced public type lacks documentation, add an accurate reference page.

Audit defineProps, withDefaults, defineEmits, defineSlots, defineExpose, template slots, native attribute forwarding, and component usage. Record the source file for each documented component so contracts can be checked for drift.

## Theming

List documented public element classes with their purpose. List component CSS variables with token name, default, description, and applicable element/state. Include the shared semantic tokens a component depends on without treating them as component-specific knobs.

Introduce component-prefixed variables for configurable styling currently expressed as literal colors, dimensions, spacing, borders, typography, opacity, shadows, and transitions. Defaults preserve the current visual result. Geometry determined by layout calculations, structural display rules, and accessibility behavior are not theme tokens. Document prop-controlled sizing as props rather than inventing a second conflicting source of truth.

Use component variables with fallback to existing shared Frame semantic variables where applicable. Public token names must be stable and package-specific naming must not imply a Docs dependency. Update the actual component CSS together with its documentation; never list variables that the component does not consume.

For third-party renderers such as Monaco, terminal, or loader web components, document the supported Frame styling surface and their own theme/configuration APIs. Do not promise arbitrary access to third-party internals through Frame CSS variables.

## Interactive demo

Each component has a dedicated demo adapter with controls for its public properties and model values. Use checkboxes for booleans, selects for enums, numeric inputs for numbers, text inputs for strings, and validated structured editors or supplied editable fixtures for arrays/objects.

Required component/controller/HTMLElement/function properties use real provided instances or selectable fixtures. Do not evaluate user-entered JavaScript. Callbacks and emits are observable through an event log. Slot content has text or predefined scoped-slot fixtures where relevant. Exposed methods have explicit action buttons.

Controls update the actual rendered component immediately. Include Reset, an event log with Clear, validation messages, and copyable usage code synchronized with current controls. Invalid structured input leaves the last valid preview running. Optional props can be omitted to demonstrate real defaults.

Changing a component or leaving a demo releases listeners, timers, controllers, editor models, and demo registrations. Terminal/AI examples require an explicit user action before launching processes or sending requests. Previews must not start network providers or processes merely because a page or tab is opened.

Service and shell compositions expose the relevant API options and host actions rather than a misleading generated Vue prop panel. Clearly identify the rendered component or API being demonstrated.

## Data organization

Keep catalog navigation metadata separate from complete page content. Use typed records for feature examples, API sections, style classes/tokens, and demo controls. Reuse API reference identifiers rather than duplicating navigation destinations. The shared renderer consumes these records and per-component preview adapters.

Source-derived inventories can help collect declarations, but descriptions and complex defaults require review against actual behavior. Do not substitute inferred documentation for unresolved contracts. All existing catalog entries must receive the complete four-tab presentation before this change is described as complete.

## Verification and acceptance

- Every Components and Features catalog entry renders all four tabs with meaningful content.
- Features have matching preview/code pairs and multiple supported use cases.
- API tables cover public props, defaults, emits, slots, and exposed APIs; absent sections are omitted.
- Type links resolve and Back restores the source page/tab/sidebar.
- Every documented theme variable is consumed by production CSS; default visuals are retained.
- Interactive controls update actual props, reset correctly, and report emits; invalid inputs do not break previews.
- No unexpected process launch, provider request, or persistent demo registration occurs on page load.
- Keyboard tab navigation and narrow workspace layouts work without clipping controls or API tables.
- Unit checks cover contract inventories and demo-state handling where meaningful; browser checks cover representative simple, structured, overlay, asynchronous, and Features examples.
- Run the full test suite, Docs/Core/Features builds, consumer type checks, and package-boundary checks.

## Boundaries

This work does not change existing component semantics or add unsupported PrimeVue features. Public behavior changes discovered to be necessary must be identified separately. Styling changes are limited to exposing supported tokens while preserving defaults. Unrelated work in the shared workspace is preserved. No publication, deployment, or push is part of this work.
