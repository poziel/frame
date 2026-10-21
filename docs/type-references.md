# API and type references

Component API tables show the property/API name, its TypeScript type, and its behavior. Linked application types open separate reference pages with fields, types, examples, and a Back action. Nested references preserve the previous page in that workspace pane. Direct type links fall back to the Selects documentation.

## Select items

```ts
import { SelectOption, SelectSeparator, type SelectItem } from '@frame/core';
const options: SelectItem[] = [
  new SelectOption({ value: 'local', label: 'Local' }),
  new SelectSeparator('remote-group'),
  new SelectOption({ value: 'remote', label: 'Remote', description: 'Sync online.' }),
];
```

SelectOption and SelectSeparator extend the shared SelectItem runtime base. The SelectItem TypeScript type is their discriminated union, so controls can distinguish choices from dividers. Constructors preserve metadata; the application owns values and state. Plain object inputs remain structurally compatible. FrameSelect and settings use the same contracts and skip separators and disabled options.

Reference pages and example navigation belong to the documentation app. The core library exports contracts and controls without registering example content.
