# QuickPickOptions

Options for the always-searchable frame.showQuickPick service.

## Usage

Supply title and search placeholder. Custom content belongs in FrameQuickPanel rather than a non-searchable picker.

```typescript
export interface QuickPickOptions {
  title?: string;
  placeholder?: string;
}
```

## Reference

<!-- frame:generated type="QuickPickOptions" -->

```ts
export interface QuickPickOptions {

  /** Controls text filtering; defaults to true. */
  searchable?: boolean;

  /** Restores navigation state when returning to a submenu. */
  initialQuery?: string;

  /** Restores keyboard highlight when returning to a submenu. */
  initialSelectedId?: string;

  /** Reports state to the owning navigation controller. */
  onStateChange?: (state: {query: string; selectedId: string}) => void;

  /** Heading displayed by the owning presentation. */
  title?: string;

  /** Hint displayed when the input or search field is empty. */
  placeholder?: string;
}
```

| Name                | Type                                                   | Description                                              |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `searchable`        | `boolean`                                              | Controls text filtering; defaults to true.               |
| `initialQuery`      | `string`                                               | Restores navigation state when returning to a submenu.   |
| `initialSelectedId` | `string`                                               | Restores keyboard highlight when returning to a submenu. |
| `onStateChange`     | `(state: {query: string; selectedId: string}) => void` | Reports state to the owning navigation controller.       |
| `title`             | `string`                                               | Heading displayed by the owning presentation.            |
| `placeholder`       | `string`                                               | Hint displayed when the input or search field is empty.  |

<!-- /frame:generated -->

## Notes

- **title** (string | undefined): Visible heading for the dialog, category, or picker.
- **placeholder** (string | undefined): Prompt shown in the empty picker search field.
