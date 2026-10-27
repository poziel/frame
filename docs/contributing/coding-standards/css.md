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
