# Form components

This folder owns reusable form controls and their supporting behavior and styles.
General controls live here, color controls in `colors/`, and date/time controls in
`dates-and-times/`. `shared/` contains behavior used across controls, including
parsing, file picking, and interaction helpers. `styles/` contains shared SCSS
for input surfaces, controls, fields, colors, dates, and files.

Keep new private helpers beside their control. Move behavior into `shared/` only
when multiple controls need it. Controls remain usable without a Frame instance.
