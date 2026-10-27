# Framework presentation

This folder contains FrameShell and the components that render framework services:
bars, sidebars, panels, settings surfaces, overlays, and workspace presentation.
Shared application presentation styles live in `styles/`.

Coordinate behavior through the controllers in `../../framework/`; keep rendering
and presentation helpers here. Independent controls belong in their component
group rather than depending on these application surfaces.
