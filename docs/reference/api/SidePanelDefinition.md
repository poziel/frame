# SidePanelDefinition

Public interface declared in packages/core/src/framework/views/shellViewContainer.ts.

## Usage

Import SidePanelDefinition from @frame/core. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface SidePanelDefinition extends PanelDefinition {

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Whether this view contributes an activity-rail selector. */
  showInRail?: boolean;
}
```

## Reference

<!-- frame:generated type="SidePanelDefinition" -->

```ts
export interface SidePanelDefinition extends PanelDefinition {

  /** Optional icon rendered beside the contribution. */
  icon?: Component;

  /** Whether this view contributes an activity-rail selector. */
  showInRail?: boolean;
}
```

| Name         | Type        | Description                                              |
| ------------ | ----------- | -------------------------------------------------------- |
| `icon`       | `Component` | Optional icon rendered beside the contribution.          |
| `showInRail` | `boolean`   | Whether this view contributes an activity-rail selector. |

<!-- /frame:generated -->

## Notes

- **icon** (Component): Optional leading icon; provide an accessible label for icon-only actions.
- **showInRail** (boolean): Show In Rail configuration for this component; see its Features examples for usage.
