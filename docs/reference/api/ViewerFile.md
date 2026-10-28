# ViewerFile

Public interface declared in packages/core/src/modules/viewer/types/viewerTypes.ts.

## Usage

Import ViewerFile from @frame/core/modules/viewer. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface ViewerFile {

  /** Portable bytes or a browser-fetchable URL; authentication stays host-owned. */
  source: ViewerSource;

  /** Explicit display name; otherwise resolved from File or URL. */
  name?: string;

  /** Explicit MIME type preferred over the supplied Blob or response metadata. */
  mimeType?: string;

  /** Optional syntax language override for code detection. */
  language?: string;
}
```

## Reference

<!-- frame:generated type="ViewerFile" -->

```ts
export interface ViewerFile {

  /** Portable bytes or a browser-fetchable URL; authentication stays host-owned. */
  source: ViewerSource;

  /** Explicit display name; otherwise resolved from File or URL. */
  name?: string;

  /** Explicit MIME type preferred over the supplied Blob or response metadata. */
  mimeType?: string;

  /** Optional syntax language override for code detection. */
  language?: string;
}
```

| Name       | Type           | Description                                                                 |
| ---------- | -------------- | --------------------------------------------------------------------------- |
| `source`   | `ViewerSource` | Portable bytes or a browser-fetchable URL; authentication stays host-owned. |
| `name`     | `string`       | Explicit display name; otherwise resolved from File or URL.                 |
| `mimeType` | `string`       | Explicit MIME type preferred over the supplied Blob or response metadata.   |
| `language` | `string`       | Optional syntax language override for code detection.                       |

<!-- /frame:generated -->

## Notes

- **source** (ViewerSource): Source configuration for this component; see its Features examples for usage.
- **name** (string): Icon name, optionally including its Iconify collection prefix.
- **mimeType** (string): Mime Type configuration for this component; see its Features examples for usage.
- **language** (string): Syntax language identifier.
