# ModalDefinition

Public object contract exported by @frame/core.

## Usage

Use this contract when calling the corresponding Frame API. Optional fields may be omitted.

```typescript
export interface ModalDefinition {
  id: string;
  title: string;
  component: Component;
  props?: Record<string, unknown>;
  icon?: Component;
  actions?: readonly PanelAction[];
  width?: number;
  height?: number;
  maximized?: boolean;
}
```

## Reference

<!-- frame:generated type="ModalDefinition" -->

```ts
export interface ModalDefinition extends ModalOptions {

  /** Stable identity used to address this contribution. */
  id: string;

  /** Heading displayed by the owning presentation. */
  title: string;

  /** Host-supplied Vue component rendered for this contribution. */
  component: Component;

  /** Properties forwarded to the host-supplied component. */
  props?: Record<string, unknown>;

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Actions offered by the owning surface. */
  actions?: readonly PanelAction[];

  /** Requested presentation width in pixels, constrained by the shell bounds. */
  width?: number;

  /** Requested presentation height in pixels, constrained by the shell bounds. */
  height?: number;

  /** Initial maximized presentation for this modal. */
  maximized?: boolean;

  /** Optional host-owned footer component. */
  footer?: Component;

  /** Properties forwarded to the footer component. */
  footerProps?: Record<string, unknown>;
}
```

| Name          | Type                      | Description                                                               |
| ------------- | ------------------------- | ------------------------------------------------------------------------- |
| `id`          | `string`                  | Stable identity used to address this contribution.                        |
| `title`       | `string`                  | Heading displayed by the owning presentation.                             |
| `component`   | `Component`               | Host-supplied Vue component rendered for this contribution.               |
| `props`       | `Record<string, unknown>` | Properties forwarded to the host-supplied component.                      |
| `icon`        | `Component`               | Optional icon rendered beside the contribution.                           |
| `actions`     | `readonly PanelAction[]`  | Actions offered by the owning surface.                                    |
| `width`       | `number`                  | Requested presentation width in pixels, constrained by the shell bounds.  |
| `height`      | `number`                  | Requested presentation height in pixels, constrained by the shell bounds. |
| `maximized`   | `boolean`                 | Initial maximized presentation for this modal.                            |
| `footer`      | `Component`               | Optional host-owned footer component.                                     |
| `footerProps` | `Record<string, unknown>` | Properties forwarded to the footer component.                             |

<!-- /frame:generated -->

## Notes

- **id** (string): Stable identifier used for registration, lookup, and disposal.
- **title** (string): Visible heading for the dialog, category, or picker.
- **component** (Component): Vue component rendered as the custom content.
- **props** (Record<string, unknown> | undefined): Values passed as props to the content component.
- **icon** (Component | undefined): Optional Vue component rendered as the contribution icon.
- **actions** (readonly PanelAction[] | undefined): Header actions displayed for this contribution. See [PanelAction](PanelAction.md).
- **width** (number | undefined): Initial dialog width in pixels; constrained to the available workbench.
- **height** (number | undefined): Initial dialog height in pixels; constrained to the available workbench.
- **maximized** (boolean | undefined): Open the dialog maximized within the workbench.
