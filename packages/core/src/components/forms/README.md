# Form components

This folder owns reusable form controls and their supporting behavior and styles.
General controls live here, color controls in `colors/`, and date/time controls in
`dates-and-times/`. `shared/` contains behavior and CSS used across controls,
including parsing, file picking, input surfaces, and interaction helpers.

Keep new private helpers beside their control. Move behavior into `shared/` only
when multiple controls need it. Controls remain usable without a Frame instance.
