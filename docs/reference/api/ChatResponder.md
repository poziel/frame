# ChatResponder

Public type declared in packages/core/src/modules/chat/types/chatTypes.ts.

## Usage

Import ChatResponder from @frame/core/modules/chat. The definition below is the source contract; optional fields may be omitted.

```typescript
export type ChatResponder = (
  request: ChatRequest,
  response: ChatResponseWriter
) => void | Promise<void>;
```

## Reference

<!-- frame:generated type="ChatResponder" -->

```ts
export type ChatResponder = (
  request: ChatRequest,
  response: ChatResponseWriter
) => void | Promise<void>;
```

No declared entries.

<!-- /frame:generated -->

## Notes
