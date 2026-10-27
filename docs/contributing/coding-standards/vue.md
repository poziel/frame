# Vue components

Apply the [TypeScript](typescript.md), [HTML](html.md), and [CSS](css.md) rules
inside the corresponding sections of a single-file component.

Use `<script setup lang="ts">`, then `<template>`, then `<style>` unless an
existing component has a concrete reason for a different arrangement. Keep
scripts and styles unindented relative to their block boundary; indent their
own contents normally. Prefer scoped styles for component-private rules.
Global theme infrastructure and intentionally shared stylesheet entry points
remain global.

Use Composition API refs, computed values, and lifecycle hooks for component-local
presentation. Stateful framework controllers belong in classes; wrapping an
entire setup function in a class is not required. Do not move framework state
into a component or create a parallel shell store to satisfy a style rule.

Define explicit typed props, emitted events, slots, and exposed methods.
Document public behavior with TSDoc, including defaults, ownership, and cleanup
where relevant. Use descriptive handler names for nontrivial interactions.
Keep template expressions small; extract business logic and substantial state
transitions into their owning methods or computed values.

Use PascalCase for imported Vue components and kebab-case for HTML attributes,
component props in templates, and emitted event bindings. Retain Vue directives
and their shorthand forms. Give repeated stateful elements stable domain keys.
Do not use `v-html` for untrusted content.

Templates use double-quoted attributes. Let the formatter wrap long attribute
lists; avoid manually compressed one-line component trees. Keep explicit closing
tags, except for void HTML elements and self-closing Vue components. Preserve
whitespace between inline elements when it contributes to rendered text.

Use theme variables in styles. Portaled elements must use the existing theme
and overlay integration; do not assume scoped selectors or inheritance from a
component's original DOM parent will reach a portal.

The project formatter handles all three SFC sections and then applies member
spacing and parameter conventions to script blocks. Raw Prettier alone is not
the complete project format.
