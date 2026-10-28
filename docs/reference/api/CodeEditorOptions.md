# CodeEditorOptions

Public type declared in packages/core/src/modules/editor/types/codeEditorTypes.ts.

## Usage

Import CodeEditorOptions from @frame/core/modules/editor. The definition below is the source contract; optional fields may be omitted.

```typescript
export type CodeEditorOptions = Omit<
  Monaco.editor.IStandaloneEditorConstructionOptions,
  'value' | 'model' | 'language' | 'theme'
> &
  Monaco.editor.ITextModelUpdateOptions;
```

## Reference

<!-- frame:generated type="CodeEditorOptions" -->

```ts
export type CodeEditorOptions = Omit<
  Monaco.editor.IStandaloneEditorConstructionOptions,
  'value' | 'model' | 'language' | 'theme'
> &
  Monaco.editor.ITextModelUpdateOptions;
```

No declared entries.

<!-- /frame:generated -->

## Notes
