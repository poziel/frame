import {
  UniversalViewer,
  UniversalViewerContent,
  detectViewerType,
  ViewerController,
  type ViewerControllerOptions,
  type ViewerFile,
  type ViewerSource,
} from '@frame/core/modules/viewer';
import {h} from 'vue';

const sources: ViewerSource[] = [
  new Blob(['hello']),
  new File(['hello'], 'hello.txt'),
  'https://example.com/test.pdf',
  new URL('https://example.com/image.svg'),
];
for (const source of sources) {
  const file: ViewerFile = {
    source,
    name: 'example.txt',
    mimeType: 'text/plain',
  };
  h(UniversalViewer, {
    file,
    open: true,
    'onUpdate:open': (_open: boolean) => {},
  });
  h(UniversalViewerContent, {file, maxBytes: 1024});
}
detectViewerType('example.ts');

const options: ViewerControllerOptions = {onError: (_error: unknown) => {}};
const controller = new ViewerController(options);
const load: (file: ViewerFile, maxBytes?: number) => Promise<void> =
  controller.load;
const dispose: () => void = controller.dispose;
void [load, dispose, controller.type.value, controller.sourceMode.value];
// @ts-expect-error Sources must be portable files or URLs.
void controller.load({source: 123});
