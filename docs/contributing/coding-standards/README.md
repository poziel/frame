# Coding standards

Read this index before editing Frame or the active frame-native companion.
These documents are the shared source of coding conventions for humans and
agents; do not maintain a separate copy of the rules in prompts or AGENTS.md.

## Reading order

1. [TypeScript and JavaScript](typescript.md): classes, files, TSDoc, member
   spacing, method parameters, and the Google baseline.
2. [Vue components](vue.md): script, template, style, and component contracts.
3. [HTML](html.md): semantic markup, accessibility, and whitespace.
4. [CSS and SCSS](css.md): explicit shared classes, embedded component styles,
   cohesive mixins/functions, composition, runtime tokens, and cascade safety.
5. [Formatting and checks](formatting.md): the supported commands, scope,
   configuration, and enforcement limits.

Read the language guide for every language you change. For Vue single-file
components, read the TypeScript, Vue, HTML, and CSS guides together. Product
architecture and ownership still come from the root AGENTS.md and the library
documentation; formatting rules do not replace those contracts.

For stylesheet locations and entry-point order, read the maintained
[style architecture](../../styling/style-architecture.md).

## Precedence

Explicit task instructions take precedence. Next come these project rules, then
the linked Google style guides for details not covered here. A formatter's
defaults never take precedence over the documented project conventions.

Project-wide defaults are UTF-8, LF line endings, two-space indentation, no
trailing whitespace, and a final newline. Preserve meaningful Markdown hard
breaks. Prefer an 80-column code layout; do not damage literals, URLs, TSDoc
examples, or readable types merely to satisfy a line-width target.

## What tools enforce

| Concern                                                                                              | Enforcement                   |
| ---------------------------------------------------------------------------------------------------- | ----------------------------- |
| Indentation, quotes, semicolons, wrapping, language syntax layout                                    | Pinned Prettier configuration |
| Blank lines around class/interface members and declarations                                          | Project member-spacing pass   |
| Six-parameter convention and signature width                                                         | Project parameter pass        |
| Type correctness                                                                                     | `bun run check:types`         |
| Meaningful TSDoc, appropriate class boundaries, ownership, semantics, accessibility, token selection | Author and reviewer checks    |

Formatting does not invent documentation, split classes, reorder executable
initializers, sort CSS declarations, or prove behavior. Check the relevant
tests and builds separately when behavior changes.
