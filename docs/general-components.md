# General components

Frame provides all 24 families in Reka UI’s General category. Import the standalone controls from `@frame/core` and import `@frame/core/style.css` once. No Frame instance is required.

The General catalog contains Accordion, Alert Dialog, Aspect Ratio, Avatar, Collapsible, Context Menu, Dialog, Drawer, Dropdown Menu, Hover Card, Menubar, Navigation Menu, Pagination, Popover, Progress, Scroll Area, Separator, Splitter, Stepper, Tabs, Toast, Toolbar, and Tree. The existing Tooltip page documents `FrameTooltip`, now backed by Reka. Drawer and Tree inherit their upstream Alpha status.

Each page includes task examples, source-extracted inherited props and events, slots, consumed theme variables, and an interactive demo. Root props and updates are forwarded; wrappers add typed item collections and default compositions, with slots for application-owned content. Import the exported `FrameAccordionItem`, `FrameTabItem`, `FrameStepItem`, `FrameToolbarItem`, `FrameTreeItem`, `FrameSplitPanel`, `FrameNavigationItem`, `FrameMenubarItem`, and `FrameGeneralMenuItem` types when authoring data.

These controls complement the shell services. `FrameDialog` is a standalone dialog; Frame-owned modals remain controlled through the existing instance API. `FrameToast` is a standalone toast with explicit activation; Frame’s notification service retains its state, history, and lifecycle. General menubars, navigation menus, splitters, and trees do not register shell views or execute host commands automatically. Applications handle emitted actions and supply routing/domain behavior.

Portalled overlays use the existing Frame overlay boundary and theme host when mounted inside a shell, falling back to the document outside one. Repeated opening, focus return, keyboard selection, disabled entries, nested menus, and runtime theme changes are covered by focused browser fixtures.

Verification: `bun run build:library`, `bun run check:consumer`, `bun run build`, `bun test`, and `python tests/general-{a,b,c,docs}-browser.py` individually against the development host. The bracketed browser command denotes four separate scripts, not a literal shell command.
