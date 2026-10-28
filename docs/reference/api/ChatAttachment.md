# ChatAttachment

Public interface declared in packages/core/src/modules/chat/types/chatTypes.ts.

## Usage

Import ChatAttachment from @frame/core/modules/chat. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface ChatAttachment {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Display name supplied by the host. */
  name: string;

  /** Distinguishes file, folder, and application-context references. */
  kind: 'file' | 'folder' | 'context';

  /**
   * Optional browser File objects retained by reference; copying clones only
   * the list.
   */
  files?: File[];
}
```

## Reference

<!-- frame:generated type="ChatAttachment" -->

```ts
export interface ChatAttachment {

  /**
   * Stable identity used to address this entry within its owning message or
   * schema.
   */
  id: string;

  /** Display name supplied by the host. */
  name: string;

  /** Distinguishes file, folder, and application-context references. */
  kind: 'file' | 'folder' | 'context';

  /**
   * Optional browser File objects retained by reference; copying clones only
   * the list.
   */
  files?: File[];
}
```

| Name    | Type                              | Description                                                                        |
| ------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `id`    | `string`                          | Stable identity used to address this entry within its owning message or schema.    |
| `name`  | `string`                          | Display name supplied by the host.                                                 |
| `kind`  | `'file' \| 'folder' \| 'context'` | Distinguishes file, folder, and application-context references.                    |
| `files` | `File[]`                          | Optional browser File objects retained by reference; copying clones only the list. |

<!-- /frame:generated -->

## Notes

- **id** (string): Id configuration for this component; see its Features examples for usage.
- **name** (string): Icon name, optionally including its Iconify collection prefix.
- **kind** ('file' | 'folder' | 'context'): Kind configuration for this component; see its Features examples for usage.
- **files** (File[]): Files configuration for this component; see its Features examples for usage.
