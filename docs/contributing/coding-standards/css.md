# CSS, SCSS, and component styles

Use the [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
as a baseline. Frame's theme ownership and the cascade-preservation rules below
take precedence over generic sorting or normalization recommendations.

Core's handwritten styles use SCSS, including authored Vue style blocks.
Consumers still import compiled CSS. Read the
[style architecture](../../styling/style-architecture.md) for ownership,
entry points, generated exceptions, and the build workflow.

## Layout and naming

Use two-space indentation, a space before opening braces, one declaration per
line, a space after each declaration colon, semicolons, and blank lines between
logical groups of rules. Closely related adjacent rules may stay together;
grouping is reviewed rather than inferred by the formatter. Let the formatter
handle selector wrapping and value whitespace.
Use descriptive kebab-case class names and existing component naming patterns.
Keep selectors local and low-specificity; avoid IDs for styling and unnecessary
`!important` declarations.

```css
.permission-message {
  display: flex;
  align-items: center;
  color: var(--frame-text);
}
```

## Explicit classes for shared responsibilities

Prefer an explicit semantic class in the markup when different components adopt
the same visual responsibility. Do not maintain growing lists of component
selectors to assign a shared surface, backdrop effect, or container treatment.
Name the responsibility rather than the current set of consumers.

For example, define an overlay surface once and opt into it on each element:

```scss
.frame-overlay-surface {
  -webkit-backdrop-filter: var(--frame-overlay-backdrop-filter);
  backdrop-filter: var(--frame-overlay-backdrop-filter);
}
```

```html
<div class="frame-menu frame-overlay-surface">
```

A new overlay adopts the class instead of extending a selector list such as
`:is(.frame-menu, .frame-modal, .frame-select-popup)`. Shared classes belong in
the owning family or foundation stylesheet and must load wherever their
consumers need them, including portals. Core implements this class in its shared
overlay stylesheet; each component retains its own background/fallback contract.

Selectors remain appropriate for interaction states (`:hover`, `:focus-visible`,
`:disabled`, `[data-state='open']`), genuine parent/child relationships, theme
scopes, and integrations with third-party markup. Do not replace every selector
with another class or duplicate native interaction state in application code.

## Component-owned styles

Keep component-private SCSS directly in the owning Vue component's
`<style lang="scss">` block by default. Prefer scoped styles for new private
rules; preserve existing scoped/global behavior when relocating rules. A large
style block alone is not a reason to create a separate private stylesheet.

Separate stylesheets are for shared foundations, reusable visual classes,
component-family rules, and shared Sass tools. A component can load those tools
with `@use` inside its style block; embedding SCSS does not restrict access to
Sass variables, mixins, or functions.

Keep private rules in their owners through deliberate changes that verify
stylesheet loading, cascade order, standalone use, and portal behavior. Do not
silently change those behaviors merely to relocate a rule.

## Theme concerns

Read [theme variables](../../styling/theme-variables.md) before introducing
colors, typography, spacing, radii, shadows, or motion values. Reuse the
appropriate `--frame-*` variables so application content, controls, and portals
follow the selected theme consistently. Preserve current appearance when
introducing a token. Do not edit generated token outputs directly.

## Cascade and readability

Keep related declarations together. Preserve deliberate fallback order,
shorthand/longhand relationships, media-query order, and source-order behavior.
Do not automatically alphabetize declarations or selectors: reordering can
change the result. For new rules without existing ordering constraints, group
layout and sizing first, then spacing, typography, surfaces/borders, and
interaction or motion concerns.

Prefer unitless zero where the property allows it. Use custom properties for
shared values and avoid unnecessary magic numbers. Comments should explain
non-obvious layering, browser constraints, or layout decisions; they should not
repeat property names. Use section comments to make substantial stylesheets
navigable. Review hover, focus, disabled, dark-theme, and reduced-motion states
when the change affects them.

Formatting expands compressed CSS but does not sort declarations, add missing
theme tokens, verify contrast, or establish responsive behavior.

## SCSS files and composition

Use kebab-case responsibility names for family sheets and shell partials.
Do not extract a component's private rules into an adjacent stylesheet;
keep them embedded in its Vue style block.
Prefix composition-only partials with `_`; omit that prefix
and the extension in Sass references. `index.scss` is an entry point, not a
place to accumulate unrelated declarations. The established `input-surfaces`
sheet is shared by the forms family and shell entry.

Use modern `@use` to load a sheet once within a Sass compilation. Use `@forward`
only to expose an intentional Sass API; Frame currently needs no public Sass
API. Do not use deprecated Sass `@import`, `@extend`, or compatibility sheets
that only redirect old source paths. Public `@frame/core/style.css` is a
compiled artifact contract and must remain unchanged.

```scss
// Shared input surfaces precede shell specializations.
@use '../components/forms/styles/input-surfaces';
@use '../components/framework/styles/workbench';
```

Sass deduplicates within one compilation, not across independent Vite entries.
Import each family entry consistently from TypeScript/Vue. Do not load both a
family entry and its private partials from JavaScript. Keep optional-module
styles in their module entry graph; Core's entry must never load them.

## Nesting and declarations

Prefer flat selectors for existing rules. New nesting should express a direct
relationship or state, normally at most two levels. Expand the selector in your
head and preserve its specificity. Do not nest beneath a new ancestor merely
to group rules: that changes where they match, especially for portals.

```scss
.frame-example {
  display: flex;
  gap: var(--frame-gap);

  &:focus-visible {
    outline: 1px solid var(--frame-accent);
  }

  > .frame-example-label {
    min-width: 0;
  }
}
```

Keep declarations before nested rules. Avoid interleaving declarations and
nesting, which makes emitted order harder to review. Write expanded declarations
with one property per line; do not compress rules to save space. Keep fallback
pairs and shorthand/longhand relationships in their intentional order:

```scss
.frame-example-surface {
  background: var(--frame-surface);
  background: var(--frame-overlay-background, var(--frame-surface));
  padding: 8px;
  padding-inline: var(--frame-control-padding-x);
}
```

## Variables, functions, and mixins

Keep theme values as `--frame-*` CSS custom properties, read with `var(...)`.
They must update at runtime for each Frame instance and its portal host.
Sass variables are for genuine compile-time constants or implementation data,
never substitutes for colors, spacing, fonts, radii, shadows, or motion tokens.
Do not inject a shared Sass prelude into every SFC: it can emit duplicate CSS.

Extract demonstrated reuse around a shared responsibility, not arbitrary
repeated declarations. A mixin emits a cohesive declaration group; a function
calculates and returns a value. Use meaningful names that explain the contract.
A panel-surface mixin can own background, border, and radius. Include padding
only when content spacing is part of that same contract, rather than coupling
unrelated component layouts.

```scss
// Shared Sass tool: styles/mixins/_surfaces.scss.
@mixin panel-surface {
  background: var(--frame-surface);
  border: 1px solid var(--frame-line);
  border-radius: var(--frame-panel-radius);
}
```

```vue
<style scoped lang="scss">
@use '../../styles/mixins/surfaces';

.component-panel {
  @include surfaces.panel-surface;
}
</style>
```

These examples illustrate a contract and relative import; choose the actual
owning folder and path when implementing it. Keep shared Sass tools free of
top-level emitted selectors so importing them does not inject global rules.

Choose an explicit shared CSS class when elements adopt the same visual
responsibility. Choose a mixin when distinct component rules need the same
cohesive declaration group. Mixins emit declarations at every inclusion; a
shared class emits one reusable rule. Use functions for reusable calculations,
not declaration bundles. Keep runtime theme values as CSS custom properties
inside both tools. Avoid speculative token maps, selector generators, tiny
mixins for incidental repetition, and abstractions that obscure source order.

Use `//` comments for composition rationale and `/* ... */` section comments for
substantial rule groups. Explain non-obvious layout coordinates, layering, and
ordering dependencies rather than narrating property names.

## Preserving the cascade

Changing an extension does not authorize selector cleanup. Retain fallback
order, repeated selector blocks, media-query positions, pseudo states,
shorthands, reduced-motion and transparency handling. Moving rules between
compilation entries can change Vite emission order even when Sass output looks
equivalent. Compare emitted selectors/declarations and representative rendered
states when relocating rules. Sass may simplify CSS calculations or normalize
whitespace; verify the resulting values rather than treating byte equality as
the only test. Do not alphabetize composition entries.

The shell currently keeps base rules and later specializations in separate
partials to retain historical order. Add rules to the existing owner and phase;
do not move a late specialization into an earlier base file without checking
all overlapping selectors and responsive states.
