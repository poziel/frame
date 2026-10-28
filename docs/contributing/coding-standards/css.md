# CSS and component styles

Use the [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
as a baseline. Frame's theme ownership and the cascade-preservation rules below
take precedence over generic sorting or normalization recommendations.

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

## Documenting component token defaults

Keep component defaults at the selector that consumes them. A public custom
property declared on a component masks an inherited application override;
hoisting a semantic alias to `:root` resolves it in the wrong context.
Use a private default declaration and an adjacent source comment instead:

```css
.frame-example {
  /* Surface behind expanded disclosure content. @token --frame-example-background */
  --_frame-default-example-background: var(--frame-canvas);
  background: var(
    --frame-example-background,
    var(--_frame-default-example-background)
  );
}
```

The `@token` annotation names the existing public override; the private
`--_frame-default-*` variable is an implementation detail. Declare that default
on the actual consuming element and state, including portalled surfaces, so
semantic aliases resolve against its active theme. Do not reuse a private
default inherited from another component when its semantic context can differ.
Keep geometry supplied by layout state or measured at runtime outside this
presentation-default convention.

The documentation extractor reads declarations and adjacent comments with a CSS
AST. It records legacy fallback-only tokens without inventing descriptions.
`packages/docs/scripts/theme-contracts/coverage.ts` derives coverage from source;
source tests require adjacent purpose comments and public annotations for private
defaults. Extraction rejects private-variable leakage and missing descriptions in every
selector context. Shared semantic descriptions come from TSDoc on the owning
theme catalog property; local purpose comments take precedence.

CSS-wide fallback keywords (`inherit`, `initial`, `unset`, `revert`, and
`revert-layer`) are an exception: keep the entire affected fallback expression
at the real property use site with an adjacent purpose comment. A private
custom property declared with one of these keywords inherits or resets that
private variable rather than the actual styled property. Do not hide such a
keyword in a nested private default either. The extraction tests audit this
exception across production styles.

For inherited aliases and runtime geometry, add a purpose comment with
`@token --frame-public-name @context` in the consuming rule. This documents the
value without declaring a CSS default or changing its cascade. A comment can
sit beside a consuming property or describe a contextual reference nested in a
private default. Animated endpoints also use `@context`; an animation keyframe
value is not a reusable component default. Never fill omitted runtime values
with invented literals merely to complete a documentation table.
