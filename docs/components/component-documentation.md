# Documentation authoring

Consumer documentation lives in `docs/` as ordinary Markdown. The website
renders those same files; complete raw sources are published under
`markdown/docs/`, with package README files under `markdown/packages/`.
Internal contributor documents and design plans stay out of consumer indexes.

## Page structure

Components, modules, and layouts start with one H1 and a short introduction.
Use exactly three H2 headings: `Features`, `APIs`, and `Styling`. H3/H4 headings
organize their content. The website adds the separate Vue `Playground` tab.
Guides and type references remain normal articles.

Explain useful examples, anatomy, keyboard behavior, accessibility, ownership,
and lifecycle in Markdown. Use actual public imports and implemented instance
APIs. Ordinary controls do not require Frame. Describe internal Reka composition
without implying that every upstream part is publicly configurable.

## Source-derived reference sections

Property, event, slot, exposed-method, and public controller descriptions come
from TSDoc attached to their owning declarations. Keep declared defaults in
implementation. Use `@defaultValue` for contextual defaults and `@remarks` for
precedence, ownership, or additional default behavior. Do not repeat a literal
that the extractor already reads. Document supported slots with `defineSlots`.

Inherited Reka types may retain upstream descriptions when Frame preserves the
contract. Explicitly document Frame's changed semantics. Attribute fallthrough
does not prove that every upstream property is a supported Frame API. Record
where native attributes reach the interaction element in the article or source
comment; preserve behavior when reviewing wrappers.

The generator replaces only explicit regions:

```md
<!-- frame:generated api="buttons" -->
Generated reference tables appear here.
<!-- /frame:generated -->
```

Use `styles="buttons"` for CSS references and `type="FrameMenuItem"` for
public type references. IDs come from the existing catalogs and component-page
mapping. Do not manually edit generated region contents. Comments, generics,
factory expressions, contextual defaults and overloads remain source-derived;
extraction never executes component setup or default factories.

Missing source descriptions remain explicit coverage gaps. Add meaningful
comments to source; do not fill tables with guesses based on property names.
Existing authored upstream-composition references remain separate from the
generated Frame contract and must not imply unavailable APIs.

## Live examples

Live examples are explicitly registered Vue implementations/configurations in
Docs. Insert a known ID above its ordinary fenced consumer example:

````md
<!-- frame:example id="buttons.primary" -->

```vue
<FrameButton variant="primary">Save</FrameButton>
```
````

Use actual IDs from `packages/docs/src/markdown/previews.json`; the ID above is
illustrative. Markdown cannot import arbitrary code or start services. A
preview with terminal/backend work needs explicit activation. Each fenced
example remains readable and useful without the live preview. Changes to
example values must keep its Markdown snippet and registered preview aligned.
The playground's own generated snippets remain interactive UI.

## CSS token descriptions

Keep public names stable and derive theme paths using Frame's existing rule:
`--frame-button-radius` maps to `frame.button.radius`. CSS AST extraction reads
adjacent declaration comments and the actual expression, not computed values.

A same-name default declared on a component would hide inherited host overrides.
For contextual defaults, use a documented private declaration in the consuming
selector and retain the public variable as the override hook:

```css
.frame-example {
  /* Corner radius of the example surface. @token --frame-example-radius */
  --_frame-default-example-radius: var(--frame-control-radius);
  border-radius: var(
    --frame-example-radius,
    var(--_frame-default-example-radius)
  );
}
```

This illustrative token is not a new public API. Keep dependent expressions on
the element where they resolve, including variant/state selectors. Preserve
standalone controls, instance scopes and portals. Never hoist all contextual
fallbacks to `:root` or invent defaults for runtime geometry. Foundation token
values remain owned by the theme catalog; generated CSS is not an authoring
source.

## Build and validation

- `bun run docs:contracts` extracts Vue/TypeScript and CSS contracts, updates
  Markdown regions and derived playground metadata, and validates local links.
- `bun run --cwd packages/docs docs:check` detects stale Markdown without writes.
- `bun run build` runs extraction before building the website and raw Markdown.
- `bun run format` and `bun run check` apply the shared project workflow.

Add component pages to `componentPages.json`; keep ordinary navigation metadata
and preview configuration in Docs. Add narrative content only to Markdown.
The generator uses the project formatter, so generation and formatting agree.
Use focused extraction tests and browser checks when changing contract or
preview behavior. API version-difference reporting is outside this pipeline.
