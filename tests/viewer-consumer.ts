import { UniversalViewer, UniversalViewerContent, detectViewerType, type ViewerFile, type ViewerSource } from '@frame/extras';
import { h } from 'vue';
const sources: ViewerSource[] = [new Blob(['hello']), new File(['hello'], 'hello.txt'), 'https://example.com/test.pdf', new URL('https://example.com/image.svg')];
for (const source of sources) {
  const file: ViewerFile = { source, name: 'example.txt', mimeType: 'text/plain' };
  h(UniversalViewer, { file, open: true, 'onUpdate:open': (_open: boolean) => {} });
  h(UniversalViewerContent, { file, maxBytes: 1024 });
}
detectViewerType('example.ts');
