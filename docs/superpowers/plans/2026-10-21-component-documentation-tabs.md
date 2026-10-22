# Component Documentation Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Give every Duck component page complete Features, API, Theming, and Interactive demo tabs.

**Architecture:** A Docs-owned typed registry drives a shared renderer, explicit feature previews, and per-component demo adapters. Source audits establish complete API contracts and actual styling tokens. Core and Extras expose supported styling variables but never import documentation.

**Tech Stack:** Vue 3, TypeScript, existing Frame controls and FrameCodeBlock, Bun tests, Vite, browser verification.

**Spec:** docs/superpowers/specs/2026-10-21-component-documentation-tabs-design.md

## Global Constraints

- Features is initially selected; top-level tabs are Features, API, Theming, and Interactive demo.
- Documentation data, editors, and examples stay in packages/docs.
- Keep the generic ComponentShowcase export compatible for existing consumers and type reference pages.
- Actual Frame source is authoritative; do not invent PrimeVue-only features.
- Defaults preserve the current visual result.
- Do not evaluate user-entered JavaScript.
- Invalid structured input leaves the last valid preview running.
- Terminal/AI examples require an explicit user action before launching processes or sending requests.
- All existing catalog entries must receive the complete four-tab presentation before this change is described as complete.
- Preserve unrelated work. No publication, deployment, or push.

## Review Focus

1. Absent optional values, Boolean defaults, and derived defaults must remain distinct; Task 1 tests the distinction.
2. API Back navigation must restore the source tab and sidebar, including nested references; Task 3 verifies this in-browser.
3. Invalid or unsafe structured input must not replace valid demo state or execute code; Task 5 tests this.
4. Hidden/unmounted demos must not retain controllers, listeners, processes, or asynchronous work; Tasks 5 and 6 verify disposal and explicit activation.
5. Theme changes in narrow and embedded workbenches must not clip tables, controls, or overlays; Tasks 4 and 6 verify representative small layouts.

## File Structure

- `packages/docs/src/examples/documentation/types.ts`: page, feature, API, style, and demo contracts.
- `packages/docs/src/examples/documentation/registry.ts`: complete page records keyed by existing catalog IDs.
- `packages/docs/src/examples/documentation/pages/`: focused records for actions, forms, display, layout, overlays, and Extras.
- `packages/docs/src/examples/documentation/ComponentTabs.vue`: shared accessible top-level tabs.
- `packages/docs/src/examples/documentation/FeatureSection.vue`: heading, explanation, preview, and highlighted code.
- `packages/docs/src/examples/documentation/ApiTables.vue`: props, emits, slots, methods, and related references.
- `packages/docs/src/examples/documentation/ThemeReference.vue`: public class and token tables.
- `packages/docs/src/examples/documentation/InteractiveDemo.vue`: control panel, preview, reset, code, and event log.
- `packages/docs/src/examples/documentation/demoState.ts`: validated editable state and snippet serialization.
- `packages/docs/src/examples/documentation/demos/`: per-component/family rendering and fixture adapters.
- `packages/docs/src/examples/ComponentExamplePage.vue`: integrates the shared page system.
- Existing `typeDocs.ts`, `TypeLink.vue`, `TypeDocumentationPage.vue`, and `apiNavigation.ts`: retain API routing and restore component tab state.
- Production component CSS: Core/Extras styling tokens, never documentation imports.

## Task 1: Define complete documentation contracts and inventory

**Files:** Create documentation/types.ts, registry.ts, pages/{actions,forms,display,layout,overlays,extras}.ts, tests/component-documentation.test.ts. Modify componentCatalog.ts only to separate navigation summaries from complete contracts.

**Interfaces:** Export `DocumentationTab = 'features' | 'api' | 'theming' | 'demo'`; `ComponentDocumentation` with `id`, `components`, `features`, `theming`, and `demoId`. Each component contract has `name`, `source`, `props`, `emits`, `slots`, `methods`, and `references`. Export `componentDocumentation: Record<string, ComponentDocumentation>`.

Defaults use a discriminated record: `{ kind: 'required' }`, `{ kind: 'omitted' }`, `{ kind: 'literal'; value: string }`, or `{ kind: 'derived'; expression: string }`. Types contain display text and optional existing API-reference identifiers. Props and methods include descriptions; emits/slots include named typed parameters, return type, and descriptions.

- [ ] Write a failing `catalog pages have complete and unique documentation records` test: registry IDs equal componentExamples IDs, each source file exists, features are nonempty, and every linked reference resolves.
- [ ] Write `optional, Boolean, and derived defaults remain distinguishable`: FrameCheckbox.modelValue is literal false, disabled reflects Vue Boolean false, optional label is omitted; derived values retain their expression.
- [ ] Run `bun test tests/component-documentation.test.ts` and verify missing-registry failures.
- [ ] Audit source defineProps/withDefaults/defineEmits/defineSlots/defineExpose, template slots, forwarded attrs, and readers for every catalog component. Populate reviewed records. Split button families and other multi-component pages into explicit component contracts. Record API method contracts for service pages.
- [ ] Extend typeDocs.ts with missing referenced public contracts; keep links shared rather than duplicating destinations.
- [ ] Run the focused test and `bun run build`; inspect failures before proceeding.
- [ ] Commit only this task's files with `docs: define complete component reference contracts`.

## Task 2: Feature sections with matching examples and code

**Files:** Create FeatureSection.vue and documentation feature-preview adapters. Modify exampleVariants.ts, ComponentPreview.vue, existing dedicated *Example.vue files, and page feature records.

**Interfaces:** A feature has `id`, `title`, `description`, `previewId`, and `code`. Feature previews receive `{ pageId: string; featureId: string }` and emit `feedback(text: string)`. Existing dedicated examples can be wrapped without moving their runtime logic into Core.

- [ ] Write `feature records have stable IDs and complete usage code`: all features have descriptions, distinct IDs within a page, and a registered preview; select includes described/plain/grouped/disabled examples.
- [ ] Run the focused test and observe failure for missing adapters.
- [ ] Render each feature as its own section using FrameCodeBlock with copy support. Convert existing select variant tabs into sequential sections. Give every page a basic example plus supported state/composition examples; do not merely duplicate the same preview.
- [ ] Make copied code self-contained: imports, required state, event handlers, and template match the live example. Keep terminal/provider work explicitly activated.
- [ ] Run focused tests and build. Manually compare checkbox, select, loading, and one Extras preview against their code.
- [ ] Commit with `feat(docs): add component feature examples`.

## Task 3: Four-tab page renderer and API navigation

**Files:** Create ComponentTabs.vue, ApiTables.vue, ThemeReference.vue. Modify ComponentExamplePage.vue, docs.css, apiNavigation.ts, TypeDocumentationPage.vue. Add tests/documentation-browser.py using the existing browser-test convention.

**Interfaces:** ComponentTabs accepts `modelValue: DocumentationTab`, emits `update:modelValue`, and provides one slot per tab. ApiTables accepts a component's audited contract. ThemeReference accepts that page's documented classes/tokens. ComponentExamplePage accepts `componentId` and optional `initialTab`.

- [ ] Add browser assertions for four named tabs, Features selected initially, ARIA relationships, ArrowLeft/Right/Home/End behavior, reset on component change, and independent split-pane selections.
- [ ] Add `component API link restores its originating tab`: open select API, follow SelectItem then SelectOption, go Back twice, and assert API tab plus Components sidebar restored. Repeat from an Extras page.
- [ ] Run the browser checks and observe missing-tab failures.
- [ ] Implement the renderer with a shared header, Features sections, complete API tables, and Theming table. Omit absent emits/slots/methods. Render required/default status accurately and use TypeLink for related contracts.
- [ ] Save the current tab in the previous workspace-content props when following a reference; preserve existing routes, icon-library navigation, and root API selections. Keep ComponentShowcase public behavior unchanged.
- [ ] Run browser checks, focused tests, and build. Verify no Docs imports enter Core/Extras.
- [ ] Commit with `feat(docs): add component documentation tabs`.

## Task 4: Production theme tokens and accurate theming reference

**Files:** Modify packages/core/src/style.css, affected Core component scoped styles, packages/extras/src/style.css, affected Extras scoped styles, page theming records. Add tests/component-theme-contracts.test.ts.

**Interfaces:** Theme records contain class name/description and token name/default/description/element/state. Public variables use `--frame-<component>-<purpose>` and fall back to existing semantic tokens where appropriate.

- [ ] Add `documented tokens are consumed by production styles` and `every component has a reviewed public styling surface` checks; a Docs-only variable must fail validation.
- [ ] Run tests to see missing-token failures.
- [ ] Audit all rendered component styling. Replace configurable literal styling values with component tokens while preserving their current computed defaults. Keep structural display, accessibility rules, calculated geometry, and prop-controlled sizing out of token duplication.
- [ ] Populate actual class/token records, including state variants and inherited semantic tokens. Document third-party themes through supported adapter configuration rather than claiming arbitrary internal CSS tokens.
- [ ] Run tests and compare default versus token-overridden screenshots for checkbox, button, select, menu, loading, and Extras chat. Check narrow embedded bounds and inherited token scoping.
- [ ] Commit with `feat: expose documented component styling tokens`.

## Task 5: Validated interactive demo engine

**Files:** Create InteractiveDemo.vue, demoState.ts, demos adapter registry, tests/documentation-demo-state.test.ts.

**Interfaces:** `createDemoState(definition)` returns editable values, last-valid props, validation errors, `set(name, input)`, `reset()`, and `dispose()`. Demo adapters provide control definitions, initial fixtures, a preview component, `serialize(values): string`, event bindings, and optional teardown. Controls support Boolean, enum, number, text, structured JSON, omitted optional values, and selectable runtime fixtures.

- [ ] Write tests: invalid JSON retains last valid array; empty numeric input does not become zero; reset restores omissions/defaults; snippets escape quotes/newlines; unknown fixture IDs are rejected; input containing JavaScript is treated as data and never evaluated.
- [ ] Run `bun test tests/documentation-demo-state.test.ts` and verify expected failures.
- [ ] Implement validated state and serialization. Keep constructors, controller refs, HTMLElement anchors, callbacks, and Vue component refs as real adapter-provided fixtures. Do not pass JSON imitations of runtime objects.
- [ ] Implement controls, live preview, Reset, event feedback with Clear, and synchronized highlighted copyable code. Support slots and exposed-method action buttons through fixture controls.
- [ ] Add disposal assertions: replacing/unmounting a demo invokes teardown once; late async completion cannot update disposed state.
- [ ] Run focused tests and build.
- [ ] Commit with `feat(docs): add validated interactive demo controls`.

## Task 6: Complete all component demo adapters and acceptance

**Files:** Populate demos/{actions,forms,display,layout,overlays,extras}.ts and any focused Vue wrappers; finish all page records. Extend documentation-browser.py and docs/component-catalog.md.

**Interfaces:** Every ComponentDocumentation.demoId resolves to an adapter from Task 5. API service pages expose relevant options/actions and identify their actual component or service target.

- [ ] Add `every public property has a demo control or runtime fixture` and registry coverage checks for every catalog page. Assert no unresolved source/reference/preview/demo ID remains.
- [ ] Run tests and observe failures for missing adapters.
- [ ] Implement action/form controls, structured select/menu/settings fixtures, icon/loader/code-display controls, layout and overlay compositions, then notification history/editor/chat/terminal adapters. Preserve each package's actual defaults and limitations.
- [ ] Add browser assertions: edit/reset simple props, change enum/number/optional props, reject invalid structured data without destroying preview, inspect emits, exercise slot/method fixtures, and verify generated code changes.
- [ ] Verify opening terminal/AI tabs starts no shell/provider request. Verify explicit activation, leaving tabs, navigation, and app disposal clean up resources. Test small viewport tables and overlays without clipping.
- [ ] Run full `bun test`, `bun run build:library`, `bun run build:extras`, `bun run check:consumer`, `bun run build`, and `git diff --check`. Run browser checks against the dev server, recording actual limits if a browser backend is unavailable.
- [ ] Review every existing catalog page across all four tabs. Report incomplete coverage explicitly; do not call the project complete while any page lacks its required content.
- [ ] Update Docs guidance and commit with `feat(docs): complete component reference and demo coverage`.

## Self-review

All spec sections map to tasks: page model/API accuracy (1), multiple features (2), tabs and navigation (3), real theme tokens (4), validation and demo engine (5), complete coverage and verification (6). The five Review Focus conditions have explicit test steps. Production styling changes remain separate from Docs-owned rendering. No new product dependency or external service is required.
