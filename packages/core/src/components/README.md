# Component folders

Reusable components are grouped by purpose. The documentation catalog uses the same inventory in [`component-groups.json`](../../component-groups.json).

| Folder                   | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `actions/`               | Buttons, toggles, and toolbars                                 |
| `forms/`                 | Fields, choices, form composition, and file entry              |
| `forms/dates-and-times/` | Calendars and date/time fields and pickers                     |
| `forms/colors/`          | Color fields, pickers, areas, sliders, and swatches            |
| `navigation/`            | Tabs, pagination, steppers, and menus                          |
| `layout/`                | Structural containers, scrolling, splitting, and resizing      |
| `data-display/`          | Avatars, icons, trees, and code blocks                         |
| `feedback/`              | Progress, loading, notifications, and toasts                   |
| `overlays/`              | Reusable dialogs, drawers, popovers, hover cards, and tooltips |

`framework/` holds application presentation components and their helpers. `shared/` holds existing cross-group component contracts and styles. Their documentation pages appear under **General**. Private helpers with a clear group live beside the controls that use them; helpers shared by framework components live in `framework/`. These folders organize source files, not state ownership or public package entry points.

When adding a grouped component, add its name to the inventory and export it through `../index.ts` as appropriate. Consumers continue importing from `@frame/core`. Optional modules live in `../../modules/` with their own documentation catalog.

## Component contracts

Data-only contracts live beside the components that consume them. They remain
interfaces rather than runtime classes, and public imports stay at `@frame/core`.

| Component             | Contract file                       |
| --------------------- | ----------------------------------- |
| `FrameTabs`           | `navigation/tabsTypes.ts`           |
| `FrameStepper`        | `navigation/stepperTypes.ts`        |
| `FrameToolbar`        | `actions/toolbarTypes.ts`           |
| `FrameTree`           | `data-display/treeTypes.ts`         |
| `FrameSplitter`       | `layout/splitterTypes.ts`           |
| `FrameNavigationMenu` | `navigation/navigationMenuTypes.ts` |
| `FrameMenubar`        | `navigation/menubarTypes.ts`        |

Keep directly related small interfaces together, such as a menubar definition
and its action entries. Document every contract member with its actual default
rendering, event, forwarding, or slot behavior. `shared/` is for dependencies
with actual cross-group ownership, rather than a catch-all for unrelated types.
