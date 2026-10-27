# Viewer module

Public entry: `@frame/core/modules/viewer`. Existing component, source-contract,
file-name, and type-detection exports remain available. Standalone viewers need
no Frame. Importing this module does not fetch files or start PDF workers.

## Class ownership

| Class                 | File                                 | Responsibility                                                                        |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| `ViewerController`    | `controllers/viewerController.ts`    | One viewer's reactive content, active request, stale-result checks, and media cleanup |
| `ViewerDocument`      | `services/viewerDocument.ts`         | One bounded load, abort signal, type sniffing, decoded source, and owned object URL   |
| `ViewerPdfController` | `controllers/viewerPdfController.ts` | PDF page/zoom state, render cancellation, canvas sizing, and document replacement     |
| `ViewerPdfDocument`   | `services/pdf/viewerPdfDocument.ts`  | One PDF.js loading task, document, and dedicated browser worker                       |

Each class lives in its own file. Properties precede constructors and methods;
TSDoc explains ownership and cleanup for public and private members. The PDF
classes remain behind the lazy renderer import and are internal implementations.

- `components/`: fullscreen dialog and embeddable content presentation, props,
  events, and Vue watchers.
- `components/renderers/`: the lazy PDF surface and its navigation controls.
- `controllers/`: reactive document and PDF presentation lifecycles.
- `services/`: request-owned resources and pure file-detection helpers.
- `services/pdf/`: worker-backed PDF document resources.
- `types/`: portable source contracts and ambient worker declarations.
- `styles/index.css`: unchanged shared viewer presentation.

`services/viewer.ts` keeps its existing type re-exports for internal consumers.
Type detection, file-name resolution, and byte sniffing remain pure functions;
they do not need class wrappers. See the
[shared module structure](../README.md#shared-module-structure).

## Public controller

The components retain their existing props and events and create their own
controllers. The exported controller also supports host-owned custom content
presentations without requiring a Vue component or Frame instance:

```ts
import {ViewerController} from '@frame/core/modules/viewer';

const viewer = new ViewerController({onError: console.error});
await viewer.load({source: new Blob(['Hello']), name: 'notes.txt'});
console.log(viewer.text.value);
viewer.dispose();
```

`load(file, maxBytes?)` replaces the current request and resets source mode.
The default byte limit remains 100 MiB and applies to supplied Blobs, declared
response lengths, and streamed downloads. Host metadata overrides, conservative
binary sniffing, and inert HTML/SVG source rendering retain their behavior.
The host owns filesystem access, credentials, and the original File/Blob/URL.

`dispose()` is idempotent and permanently releases the controller. Components
invoke it on unmount. Media is stopped before revoking the request's object URL;
late request results and errors cannot replace current content. Public load,
error, and disposal callbacks retain their receiver when passed independently.

PDFs retain one-based page navigation, 25–300% zoom controls, render-generation
checks, and the existing backing-pixel cap. Replacing or unmounting a PDF cancels
rendering, destroys its loading task/document, and terminates its worker. Models,
URLs, workers, and navigation state are independent between viewer instances.
Browser-supported media formats and the current visual PDF-preview scope are
unchanged; this refactor adds no codecs, PDF search, or document editing.
