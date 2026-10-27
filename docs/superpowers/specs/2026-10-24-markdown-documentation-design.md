# Markdown documentation and component contract conventions

Date: 2026-10-24
Status: Proposed for user review. No implementation is claimed by this document.

## Intent

Make consumer documentation useful both inside the Docs website and as ordinary Markdown read by developers and LLMs. Include a review of component APIs, comments, and CSS variables so generated references describe actual supported behavior. Keep live examples and playgrounds as Docs-owned Vue components.

This serves two responsibilities: Docs presentation and authoring, and the public contracts of Core/Features reusable controls. Shell documentation also describes Frame-owned instance configuration, registration, state, and lifecycle. Documentation tooling must not become a runtime dependency of any library package.

## Agreed direction and approaches

The conversation selected Markdown prose, generated code references, and explicit live-example markers. It also selected comments beside declarations as the descriptions used by the documentation, and included the component contract review in the migration.

Alternatives considered:

1. Keep prose and reference rendering in Vue/TypeScript and separately export Markdown. This preserves the current duplication and gives Markdown a secondary role.
2. Maintain Markdown prose with separately authored API/style tables or a Docs-owned part manifest. This requires maintaining facts already present in code and was explicitly rejected for part mappings.
3. Use Markdown with generated reference sections from Vue/TypeScript and documented CSS declarations; keep examples in an explicit Vue registry. Selected direction. Extraction provides structural facts; comments and Markdown provide intentional explanations.

Maintainer choices proposed here, rather than separately approved by the user: update generated regions in committed consumer Markdown; use named JSDoc tags; retain existing token names; migrate in batches behind a coverage inventory. These can be revised during review.

## Scope and boundaries

- Cover all consumer website prose: introduction/guides, layouts, components, optional features, API/type references, styling, and package/host integration explanations. Inventory current routes and consumer Markdown before conversion; preserve useful existing content and URLs.
- Interactive previews, playground controls, icon browsing, and other functional catalog UI remain Vue. Their explanatory documentation comes from Markdown.
- Do not convert internal plans, source-code interfaces, playground implementation, or legal notices into component documentation pages.
- Preserve package READMEs as useful entry points. Reuse or link their consumer content without creating a second detailed narrative maintained separately.
- Do not implement proposed feature installers or change shell ownership as part of documentation work.
- Preserve current public imports, accepted props/events/slots, theme names and supported overrides. Do not remove or rename APIs just to simplify extraction. Any necessary breaking change must be brought back with its concrete compatibility impact.
- Do not commit, push, publish, or deploy. The user has requested a design discussion; implementation follows design approval.

## Canonical Markdown and website pages

Use `docs/` as the canonical consumer-documentation tree, retaining existing locations where practical. Package README links remain supported. Generated regions contain real Markdown tables and fenced examples, not website-only references to JSON.

For components, features, and layouts:

- H1 and introductory prose appear above the tabs.
- `## Features`, `## APIs`, and `## Styling` supply the first three tabs, matching the existing authoring standard. Styling is the user-facing name for the styles tab.
- `Playground` is the fourth tab, supplied by a Vue registry rather than a Markdown H2.
- H3/H4 sections remain ordinary Markdown. Feature examples explain behavior and usage. Layout examples show initial application configuration and actual Frame instance APIs, not internal renderer refs.
- Ordinary guides use normal article structure without mandatory tabs.
- Preserve or redirect existing page IDs, hashes, and useful anchors. Resolve relative links and fragments for both browser navigation and published Markdown, including links across package README files.

The website renderer parses Markdown structurally, using a Markdown AST, rather than splitting arbitrary strings or interpreting arbitrary HTML as executable Vue. Prose must leave existing Vue/TypeScript catalogs when its replacement is migrated. Minimal page/routing metadata and playground registrations may remain code.

## Generated regions and live examples

Proposed generated reference boundary:

```md
<!-- frame:generated api=FrameButton -->
...complete Markdown reference tables...
<!-- /frame:generated -->
```

Generation updates only owned regions, preserves authored prose, and is deterministic/idempotent. Malformed, duplicate, or unresolved markers are errors. A check mode detects stale generated regions without modifying files.

Proposed example marker:

```md
<!-- frame:example id="button.basic" -->
```

The website mounts the explicitly registered Vue preview there. The adjacent Markdown contains an actual fenced example and its explanation. Where practical, generate that fence from the same standalone example SFC or named source region used by the preview. Do not show snippets that require unnamed Docs fixtures or internal imports. Examples with Docs-only wrappers must expose an explicitly delimited consumer example source. Validate those consumer examples independently of the wrapper.

Markdown cannot import arbitrary files or execute expressions. The registry resolves only known IDs through explicit imports. Renderer-generated previews participate in Vue cleanup and use the correct Frame injection/portal scope. Playground state and resource creation remain explicit and per instance.

Publish raw, complete Markdown alongside the site with stable paths, a Markdown reading index, and an updated `llms.txt`. Generated API/style tables and code fences must be present in those files. Do not include internal authoring plans in consumer indexes. Support normal Markdown links without requiring JavaScript execution.

## Vue and TypeScript extraction

Use `vue-component-meta` as the intended extraction engine. First verify its installed-version compatibility with this repository's Vue, TypeScript, generic components, inherited Reka interfaces, events, slots, and exposed refs/methods. Pin the validated dependency as Docs build tooling. If a material incompatibility exists, document it and propose a focused compiler supplement or replacement before broad migration.

Normalize extraction to an internal intermediate representation containing component/export identity, source locations, props, required status, types, declared defaults, events/payloads, slots/parameters, exposed methods/properties, descriptions, tags, and referenced public types. Keep declared types readable while resolving their references. Distinguish optionality from defaults. Filter Vue framework plumbing from component-exposed members. Preserve useful generic constraints and overloads rather than silently turning them into `any`.

Extract shell controller interfaces, option types and public methods using TypeScript's checker. Do not build layout API documentation by listing internal shell component props. Map pages to existing public exports/types using minimal page metadata; this is not an anatomy or forwarding manifest. Include parameter, return, cleanup, and ownership comments where those belong to the API declaration.

Never infer a public API merely from an imported Reka root. Never assume that finding `$attrs` establishes which element receives attributes. Structural extraction documents the declared public contract; the intentional attribute destination and anatomy are described beside code or in Markdown.

## Component contract review

Review each public documented Core/Features component against these conventions:

1. Declare the supported Frame API explicitly. Inheriting upstream props/events is appropriate when Frame preserves that contract; retaining a smaller Frame API is appropriate for opinionated wrappers.
2. Confirm that declared props/events are actually handled or forwarded. A type alone does not prove runtime support. Verify representative UI behavior and host calls for changed contracts.
3. Deliberately route native attributes, listeners, accessible naming, classes and styles to the appropriate interaction element or documented container. Use `inheritAttrs: false` and explicit forwarding when needed, not as a blanket rewrite.
4. Add typed `defineSlots` contracts with comments and scoped parameter descriptions. Document fallback content and replacement boundaries.
5. Explicitly document exposed methods/properties, including ref unwrapping, availability before mounting, and supported return types.
6. Keep internal Reka parts internal unless current public composition already supports them. Explain anatomy and supported customization without generating an exhaustive upstream API inventory for inaccessible parts.
7. Preserve ordinary controls' independence from Frame. Shell-dependent components use existing injection and instance APIs.

Use Button, Switch, Accordion and Dropdown Menu as the initial extraction/contract fixtures: they exercise native elements, restricted wrappers, inherited contracts, generics, content configuration, slots and exposure. Include a layout/public-controller reference in the first vertical slice.

Descriptions come from JSDoc beside declarations, including events, slots and exposed methods. Inherited documentation can be reused when semantics are preserved. Override comments/types when Frame changes their meaning. Remove generic name-based filler from the extractor. Long examples, accessibility walkthroughs and explanations belong in Markdown; do not generate behavioral guarantees from types.

## Default value documentation

- Read literal defaults from implementation, including `withDefaults`, supported destructuring defaults and runtime prop declarations.
- Separate required status, omission, literal values, factory expressions and contextual/derived behavior.
- Use `@defaultValue` for a documented contextual default when there is no directly extractable default, and `@remarks` for default behavior or precedence explanations. Keep the property's main comment as its description.
- Do not duplicate a machine-readable literal in a comment. If both exist and conflict, report the conflict.
- Do not execute factories, component setup, adapters or arbitrary expressions during extraction.
- Do not copy Reka defaults based on imports. Resolve effective upstream defaults only where forwarding is established during the code review; otherwise explain the omitted/default behavior explicitly beside the Frame declaration.

## CSS variables and theme generation

Replace scattered public component fallback-only definitions with documented CSS custom-property declarations owned by the component or its stylesheet. Each public declaration has an adjacent purpose comment. Consumption normally uses `var(--frame-...)` with its default defined in the owning declaration. Comments may carry structured tags for contextual behavior, value kind, and internal runtime status when necessary; facts stay with the source declaration rather than in a Docs manifest.

Use a CSS AST and parsed Vue style blocks. Extract names, comments, values, dependency references, contextual selectors/conditions and consuming components. Follow explicit CSS imports; do not guess component ownership only from class-name matches. Shared token references are linked rather than misrepresented as local declarations.

Keep existing kebab-case CSS names. Derive dotted paths using the current theme rule (`--frame-button-radius` becomes `frame.button.radius`). The existing typed token catalog, parser and validation semantics remain authoritative for theme application. Generate component catalog data from CSS without importing Docs at runtime or creating a runtime Core-to-Features dependency. Foundation token definitions currently owned by `themes/tokens.ts` remain authoritative; do not edit generated `default.css` as a source. Join foundation descriptions/defaults from that source and component descriptions/defaults from CSS.

Critical compatibility requirements:

- A public token set on a theme root or attached surface must still override component defaults. A local declaration of the same token must not mask inherited overrides.
- Dependent defaults must resolve against the active instance's semantic tokens. Declaring a variable once on `:root` can resolve its `var()` dependencies too early to follow descendant instance overrides; do not assume root defaults alone solve this.
- Preserve standalone controls, document CSS themes, explicit/partial themes, theme replacement/reset/detach, nested scopes, multiple Frame instances and external portal hosts.
- Preserve variant/state-specific defaults. Split internal default calculations from supported override hooks where necessary; do not flatten different contextual values to one global constant.
- Runtime geometry/state variables are classified separately from user theme defaults. Do not invent static values for measured layout state or turn every runtime CSS property into a configurable styling guarantee.
- Existing accepted token names remain compatible. Duplicate names with genuinely different contextual values must be represented as contextual declarations, not silently reduced to the last value.

The implementation starts with a focused theme-default feasibility pass before bulk rewriting CSS. The builder chooses the precise scoping/default-emission mechanism, with browser evidence for the requirements above. If extracting defaults into declarations cannot preserve an existing case without changing its public override contract, report that case for design resolution rather than silently changing behavior. This design does not authorize mechanically hoisting all fallbacks or masking inherited themes.

## Generation and migration pipeline

Proposed stages, implemented within existing package scripts where appropriate:

1. Inventory public routes, exports, consumer Markdown, example IDs, theme tokens and existing documentation coverage.
2. Validate the extraction engine and CSS default scoping on the representative components and one layout.
3. Generate normalized API/token metadata from owning source code.
4. Update complete Markdown reference/code regions; check coverage, links, IDs, source comments, normalization collisions and extraction diagnostics.
5. Render website pages from that same Markdown and publish raw Markdown assets/indexes in the Docs build output.
6. Migrate remaining guides, layouts, components and features in coherent batches; remove superseded prose/rendering code only after equivalent content is available.
7. Update the internal authoring standard and build instructions to match the implemented marker/comment contracts.

The initial inventory establishes a reviewable baseline for legacy gaps. Strict checks apply to migrated entries; remaining gaps must stay explicit in the inventory. Completion requires every in-scope page/contract to be migrated or an explicitly justified non-documentation exemption. A successful partial batch is not completion of the migration.

Normal Docs builds regenerate the artifacts before building, as current `docs:contracts` already does. Add a non-mutating validation path for stale checked-in output. Do not invent a deployment provider or publish remotely; document how an eventual deployment invokes the same build. No API-version diff or breaking-change dashboard is included.

## Verification and acceptance

- Extraction tests cover inherited types and comments, model events, overloads/generics, default expressions, slots, exposed methods/properties and missing descriptions. Use real representative components plus focused fixtures where needed.
- Markdown checks cover deterministic generation, preservation of prose, fenced-code handling, invalid markers, links/anchors and raw output completeness.
- Browser checks show the four tabs for a component and layout, Markdown-driven guide navigation, mounted previews, working playgrounds and correct cleanup. Existing isolated layout behavior remains.
- Theme browser checks cover shared-token dependency changes, component overrides, variants/states, standalone controls, two differently themed Frame instances and a portal, replacement/reset/detach, and unchanged default appearance.
- Run relevant `bun test` checks. Build library outputs before Features/consumer checks; use `bun run build:library`, `bun run build:features`, `bun run check:consumer` and `bun run build` as affected. Run Tailwind checks when token generation or utility inputs change.
- Report actual results and environmental limits. No claim of full reference completeness based solely on successful type extraction.

## Working practices and outstanding work

The checkout contains extensive pre-existing changes, including component moves, documentation, layouts, themes and tests. Inspect ownership/status before each implementation batch and preserve that work. Do not reset or regenerate unrelated artifacts indiscriminately.

After approval of this design, write an implementation plan with the extraction and CSS feasibility passes first, followed by the vertical slice and migration batches. No product code or dependency installation has been performed for this design.
