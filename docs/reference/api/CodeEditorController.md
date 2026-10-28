# CodeEditorController

Public interface declared in packages/core/src/modules/editor/types/codeEditorTypes.ts.

## Usage

Import CodeEditorController from @frame/core/modules/editor. The definition below is the source contract; optional fields may be omitted.

```typescript
export interface CodeEditorController {

  /** Readonly reactive reference to the currently attached Monaco surface. */
  readonly instance: Readonly<
    ShallowRef<Monaco.editor.IStandaloneCodeEditor | undefined>
  >;

  /** Focuses the mounted surface, returning false before attachment. */
  focus(): boolean;

  /** Runs Monaco undo on the mounted surface. */
  undo(): boolean;

  /** Runs Monaco redo on the mounted surface. */
  redo(): boolean;

  /** Opens the mounted editor’s find widget. */
  find(): boolean;

  /** Replaces the complete model within undo boundaries, including read-only models. */
  replaceCode(code: string): boolean;

  /** Runs a supported Monaco action; returns false when unavailable. */
  runAction(id: string): Promise<boolean>;

  /** Runs the registered document formatter when supported. */
  format(): Promise<boolean>;

  /** Recomputes the mounted editor layout. */
  layout(): void;

  /** Used by CodeEditor to claim one mounted surface. Returns an idempotent release. */
  attach(instance: Monaco.editor.IStandaloneCodeEditor): () => void;
}
```

## Reference

<!-- frame:generated type="CodeEditorController" -->

```ts
export interface CodeEditorController {

  /** Readonly reactive reference to the currently attached Monaco surface. */
  readonly instance: Readonly<
    ShallowRef<Monaco.editor.IStandaloneCodeEditor | undefined>
  >;

  /** Focuses the mounted surface, returning false before attachment. */
  focus(): boolean;

  /** Runs Monaco undo on the mounted surface. */
  undo(): boolean;

  /** Runs Monaco redo on the mounted surface. */
  redo(): boolean;

  /** Opens the mounted editor’s find widget. */
  find(): boolean;

  /** Replaces the complete model within undo boundaries, including read-only models. */
  replaceCode(code: string): boolean;

  /** Runs a supported Monaco action; returns false when unavailable. */
  runAction(id: string): Promise<boolean>;

  /** Runs the registered document formatter when supported. */
  format(): Promise<boolean>;

  /** Recomputes the mounted editor layout. */
  layout(): void;

  /** Used by CodeEditor to claim one mounted surface. Returns an idempotent release. */
  attach(instance: Monaco.editor.IStandaloneCodeEditor): () => void;
}
```

| Name       | Type                                                                             | Description                                                           |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `instance` | `Readonly<     ShallowRef<Monaco.editor.IStandaloneCodeEditor \| undefined>   >` | Readonly reactive reference to the currently attached Monaco surface. |

<!-- /frame:generated -->

## Notes

- **instance** (Readonly<
  ShallowRef<Monaco.editor.IStandaloneCodeEditor | undefined>
  > ): Instance configuration for this component; see its Features examples for usage.
