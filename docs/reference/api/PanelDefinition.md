# PanelDefinition

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface PanelDefinition {
  id: string;
  label: string;
  icon?: Component;
  actions?: readonly PanelAction[];
  padded?: boolean;
  draggable?: boolean;
  movable?: boolean;
  collapsed?: boolean;
  component?: Component;
  children?: readonly PanelDefinition[];
  props?: Record<string, unknown>;
}
```

## Reference

<!-- frame:generated type="PanelDefinition" -->

```ts
export interface PanelDefinition {

  /** Render the bottom/secondary pane header. Defaults to true; false lets content supply its own toolbar. */
  showHeader?: boolean;

  /** CSS color for the view heading and selector label. Supports reactive getters. */
  titleColor?: string;

  /** Optional view-item badge; presentation is controlled by frame.primaryViewBar or frame.secondaryViewBar. */
  badge?: ViewBadge;

  /** Stable identity used to address this contribution. */
  id: string;

  /** Human-readable name displayed by the owning surface. */
  label: string;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Actions offered by the owning surface. */
  actions?: readonly PanelAction[];

  /** Whether the surface applies its standard content padding. */
  padded?: boolean;

  /** Optional content retained above the main view content. */
  top?: ViewContentSlot;

  /** Optional content retained below the main view content. */
  bottom?: ViewContentSlot;

  /** Whether pointer dragging is allowed for this contribution. */
  draggable?: boolean;

  /** Whether this contribution can move between eligible containers. */
  movable?: boolean;

  /** Initial collapsed state of this view section. */
  collapsed?: boolean;

  /** Initial presentation visibility; hiding does not unregister or dispose the view. */
  visible?: boolean;

  /** Host-supplied Vue component rendered for this contribution. */
  component?: Component;

  /** Nested definitions rendered and registered beneath this entry. */
  children?: readonly PanelDefinition[];

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;
}
```

| Name         | Type                         | Description                                                                                             |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `showHeader` | `boolean`                    | Render the bottom/secondary pane header. Defaults to true; false lets content supply its own toolbar.   |
| `titleColor` | `string`                     | CSS color for the view heading and selector label. Supports reactive getters.                           |
| `badge`      | `ViewBadge`                  | Optional view-item badge; presentation is controlled by frame.primaryViewBar or frame.secondaryViewBar. |
| `id`         | `string`                     | Stable identity used to address this contribution.                                                      |
| `label`      | `string`                     | Human-readable name displayed by the owning surface.                                                    |
| `icon`       | `Component`                  | Optional icon rendered beside the contribution.                                                         |
| `actions`    | `readonly PanelAction[]`     | Actions offered by the owning surface.                                                                  |
| `padded`     | `boolean`                    | Whether the surface applies its standard content padding.                                               |
| `top`        | `ViewContentSlot`            | Optional content retained above the main view content.                                                  |
| `bottom`     | `ViewContentSlot`            | Optional content retained below the main view content.                                                  |
| `draggable`  | `boolean`                    | Whether pointer dragging is allowed for this contribution.                                              |
| `movable`    | `boolean`                    | Whether this contribution can move between eligible containers.                                         |
| `collapsed`  | `boolean`                    | Initial collapsed state of this view section.                                                           |
| `visible`    | `boolean`                    | Initial presentation visibility; hiding does not unregister or dispose the view.                        |
| `component`  | `Component`                  | Host-supplied Vue component rendered for this contribution.                                             |
| `children`   | `readonly PanelDefinition[]` | Nested definitions rendered and registered beneath this entry.                                          |
| `props`      | `Record<string, unknown>`    | Properties forwarded to the host-supplied component.                                                    |

<!-- /frame:generated -->

## Notes

- **id** (string): Stable identifier used for registration, lookup, and disposal.
- **label** (string): Visible text shown in the corresponding control or view.
- **icon** (Component | undefined): Optional Vue component rendered as the contribution icon.
- **actions** (readonly PanelAction[] | undefined): Header actions displayed for this contribution. See [PanelAction](PanelAction.md).
- **padded** (boolean | undefined): Controls internal view-content padding.
- **draggable** (boolean | undefined): Allows dragging this view when shell interaction policies also allow it.
- **movable** (boolean | undefined): Allows moving this view between regions or collections.
- **collapsed** (boolean | undefined): Initial collapsed state for a section in a view collection.
- **component** (Component | undefined): Vue component rendered as the custom content.
- **children** (readonly PanelDefinition[] | undefined): Nested definitions shown as child categories or view sections.
- **props** (Record<string, unknown> | undefined): Values passed as props to the content component.
